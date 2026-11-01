import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp,readFile,readdir,writeFile,rm } from 'node:fs/promises';
import { fileURLToPath,pathToFileURL } from 'node:url';
import { dirname,join } from 'node:path';
import ts from 'typescript';
import { neonConfig,neon } from '@neondatabase/serverless';

// Explicitly provision a disposable database. This refuses the application DB.
const url=new URL(process.env.FETCH_TEST_DATABASE_URL||'postgres://invalid/invalid');
assert.match(url.pathname,/^\/halaldl_fetch_verify_[a-z0-9_]+$/,'Disposable test database required');
assert.ok(!process.env.DATABASE_URL||new URL(process.env.DATABASE_URL).pathname!==url.pathname,'Never use the application database for this test');
process.env.DATABASE_URL=url.href;
process.env.AUTH_SECRET='integration-test-only-auth-secret';
process.env.WORKER_TOKEN='integration-test-only-worker';
neonConfig.webSocketConstructor=globalThis.WebSocket;
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const generated=await mkdtemp(join(root,'.analytics','fetch-db-modules-'));
const sourceDir=join(root,'src','lib','fetch');
let pool;
let upkeep;
const deleted=[];globalThis.__fetchIntegrationDeleted=deleted;
try{
 for(const name of await readdir(sourceDir)){
  if(!name.endsWith('.ts'))continue;
  let input=await readFile(join(sourceDir,name),'utf8');
  input=input.replaceAll('../../../services/fetch-worker/media.mjs',pathToFileURL(join(root,'services','fetch-worker','media.mjs')).href);
  let code=ts.transpileModule(input,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  code=code.replace(/(["'])@\/lib\/fetch\/([a-z-]+)\1/g,'"./$2.mjs"')
    .replace(/(["'])\.\/([a-z-]+)(?:\.ts)?\1/g,'"./$2.mjs"')
    .replaceAll('"next/server"','"next/server.js"').replaceAll('"next/headers"','"next/headers.js"');
  await writeFile(join(generated,name.replace(/\.ts$/,'.mjs')),code);
 }
 // Storage timing/key selection is tested here; real R2 deletion has its own canary.
 await writeFile(join(generated,'storage.mjs'),`export function storageConfigured(){return true} export async function deleteMediaObject(key){globalThis.__fetchIntegrationDeleted.push(key)} export async function presignDownload(){return 'https://storage.example.test/file'}`);
 const db=await import(pathToFileURL(join(generated,'db.mjs')));
 const service=await import(pathToFileURL(join(generated,'service.mjs')));
 pool=db.getPool();pool.options.max=8;pool.options.connectionTimeoutMillis=15000;
 await db.ensureSchema();console.log(JSON.stringify({stage:'schema_ready'}));
 const query=(s,v=[])=>pool.query(s,v);
 await query('TRUNCATE halaldl_fetch.jobs,halaldl_fetch.sessions,halaldl_fetch.secrets,halaldl_fetch.users,halaldl_fetch.source_limits CASCADE');
 const direct=neon(url.href);
 const req=new Request('https://test.example/api/worker',{headers:{authorization:`Bearer ${process.env.WORKER_TOKEN}`,'x-halaldl-worker-protocol':'2'}});
 await service.recordHeartbeat(req,{runningJobs:0,waitingJobs:0,loadAverage:0,memoryFreeMb:8000,diskFreeMb:30000,cpuCount:6,accepting:true,transcoding:false,protocolVersion:2,detail:null});
 console.log(JSON.stringify({stage:'heartbeat_recorded'}));
 upkeep=setInterval(()=>{void direct.query('UPDATE halaldl_fetch.worker_status SET reported_at=now() WHERE id=1').catch(()=>{});},5000);
 const a=await service.createSession(),b=await service.createSession();
 const link='https://vimeo.com/1084537';
 const duplicates=await Promise.all(Array.from({length:6},()=>service.probeUrl(a,link,true,false)));
 console.log(JSON.stringify({stage:'duplicate_admission_checked'}));
 assert.equal(new Set(duplicates.map(x=>x.id)).size,1);
 const id=duplicates[0].id;
 await assert.rejects(service.jobForSession(b,id),e=>e.status===404);
 await assert.rejects(service.confirmDownload(b,id,'v0'),e=>e.status===404);
 await assert.rejects(service.downloadLink(b,id),e=>e.status===404);
 const first=await service.claimJob(req);assert.equal(first.id,id);assert.equal(await service.claimJob(req),null);
 await service.completeJob(req,id,{ok:true,title:'Integration fixture',duration:10,itemCount:1,formats:[{format_id:'18',ext:'mp4',height:360,vcodec:'avc1',acodec:'aac',filesize:1000}]});
 const confirms=await Promise.allSettled(Array.from({length:6},()=>service.confirmDownload(a,id,'v0')));
 assert.equal(confirms.filter(r=>r.status==='fulfilled').length,1);
 assert.equal((await query('SELECT count(*) FROM halaldl_fetch.jobs WHERE quota_spent')).rows[0].count,'1');
 await query("UPDATE halaldl_fetch.jobs SET status='failed' WHERE id=$1",[id]);
 const throttle=await Promise.allSettled(Array.from({length:11},()=>service.throttleSource('192.0.2.90')));
 assert.equal(throttle.filter(r=>r.status==='fulfilled').length,10);
 assert.equal(throttle.filter(r=>r.status==='rejected'&&r.reason.code==='source_limit').length,1);
 const accountSession=await service.upsertGoogleUser({sub:`integration:${randomUUID()}`},null);
 const user=(await query('SELECT user_id FROM halaldl_fetch.sessions WHERE id=$1',[accountSession])).rows[0].user_id;
 await query("UPDATE halaldl_fetch.users SET tier='pro' WHERE id=$1",[user]);
 assert.equal((await service.accountSnapshot(accountSession)).tier,'free');
 const secondSession=await service.upsertGoogleUser({sub:`different:${randomUUID()}`},null);
 await query("INSERT INTO halaldl_fetch.jobs (id,session_id,user_id,source_url,platform,kind,status,tier,quota_spent,confirmed_at) SELECT gen_random_uuid(),$1,$2,$3,'vimeo','download','failed','free',true,now() FROM generate_series(1,74)",[accountSession,user,link]);
 const format={formatId:'v0',selector:'18',label:'360p',ext:'mp4',height:360,fps:30,filesize:1000,mediaType:'video',hasAudio:true};
 const ids=[];
 for(let i=0;i<2;i++){
  const next=randomUUID();ids.push(next);
  await query("INSERT INTO halaldl_fetch.jobs (id,session_id,user_id,source_url,platform,kind,status,tier,formats) VALUES($1,$2,$3,$4,'vimeo','probe','waiting_choice','free',$5::jsonb)",[next,accountSession,user,link,JSON.stringify([format])]);
 }
 await assert.rejects(service.jobForSession(secondSession,ids[0]),e=>e.status===404);
 const quota=await Promise.allSettled(ids.map(next=>service.confirmDownload(accountSession,next,'v0')));
 console.log(JSON.stringify({stage:'quota_results',results:quota.map(r=>r.status==='fulfilled'?'accepted':r.reason.code)}));
 assert.equal(quota.filter(r=>r.status==='fulfilled').length,1);
 assert.equal(quota.filter(r=>r.status==='rejected'&&r.reason.code==='daily_limit').length,1);
 assert.equal((await query('SELECT count(*) FROM halaldl_fetch.jobs WHERE user_id=$1 AND quota_spent',[user])).rows[0].count,'75');
 const otherSameAccount=randomUUID();await query("INSERT INTO halaldl_fetch.sessions (id,user_id,expires_at) VALUES($1,$2,now()+interval '1 day')",[otherSameAccount,user]);
 assert.equal((await service.jobForSession(otherSameAccount,ids[0])).id,ids[0]);
 // Queue admission is independent from processing capacity. All fixtures are
 // confined to this disposable DB, including timestamps used for waiting tests.
 await query("UPDATE halaldl_fetch.jobs SET status='failed' WHERE status='queued'");
 await service.recordHeartbeat(req,{runningJobs:0,waitingJobs:0,loadAverage:100,memoryFreeMb:8000,diskFreeMb:30000,cpuCount:1,accepting:false,transcoding:false,protocolVersion:2,detail:'high-limit'});
 const pending=[];
 for(let i=0;i<8;i++){
  const session=await service.createSession();
  const job=await service.probeUrl(session,link,true,false);
  pending.push({id:job.id,session});
  assert.equal(job.queuePosition,i+1);
 }
 const busyStatus=await service.publicStatus();
 assert.equal(busyStatus.accepting,true);assert.equal(busyStatus.processing,false);assert.equal(busyStatus.waiting,8);
 await query("UPDATE halaldl_fetch.jobs SET updated_at=now()-interval '30 minutes' WHERE id=$1",[pending[7].id]);
 assert.equal((await service.jobForSession(pending[7].session,pending[7].id)).status,'queued');
 assert.equal((await service.jobForSession(pending[7].session,pending[7].id)).queuePosition,8);
 const late=randomUUID(),lateSession=await service.createSession();
 await query("INSERT INTO halaldl_fetch.jobs(id,session_id,source_url,platform,kind,status,tier,formats,created_at) VALUES($1,$2,$3,'vimeo','probe','waiting_choice','anonymous',$4::jsonb,now()-interval '1 day')",[late,lateSession,link,JSON.stringify([format])]);
 const lateConfirmed=await service.confirmDownload(lateSession,late,'v0');
 assert.equal(lateConfirmed.queuePosition,9,'Confirmation joins the tail, not its old probe creation time');
 const claimed=await service.claimJob(req);assert.equal(claimed.id,pending[0].id);
 assert.equal((await service.jobForSession(pending[7].session,pending[7].id)).queuePosition,7);
 await service.completeJob(req,claimed.id,{ok:false,errorCode:'blocked'});
 // Deterministic tie order and worker ordering must match the reported rank.
 await query("UPDATE halaldl_fetch.jobs SET queued_at=now()-interval '1 hour' WHERE id=ANY($1::uuid[])",[[pending[1].id,pending[2].id]]);
 const tied=[pending[1],pending[2]].sort((left,right)=>left.id.localeCompare(right.id));
 assert.equal((await service.jobForSession(tied[0].session,tied[0].id)).queuePosition,1);
 assert.equal((await service.jobForSession(tied[1].session,tied[1].id)).queuePosition,2);
 const tiedClaim=await service.claimJob(req);assert.equal(tiedClaim.id,tied[0].id);await service.completeJob(req,tiedClaim.id,{ok:false,errorCode:'blocked'});
 await query("UPDATE halaldl_fetch.worker_status SET reported_at=now()-interval '2 minutes' WHERE id=1");
 const offlineStatus=await service.publicStatus();assert.equal(offlineStatus.accepting,true);assert.equal(offlineStatus.processing,false);
 const offlineSession=await service.createSession();assert.ok((await service.probeUrl(offlineSession,link,true,false)).queuePosition>0);
 console.log(JSON.stringify({stage:'durable_queue_passed',admittedWhileBusy:8,positionsDecrease:true,oldQueuedJobPreserved:true,confirmationAtTail:true,stableTieOrder:true,offlineAdmission:true}));
 const unknownDuration=randomUUID(),unknownSession=await service.createSession();
 await query("INSERT INTO halaldl_fetch.jobs(id,session_id,source_url,platform,kind,status,tier,rights_ack) VALUES($1,$2,$3,'instagram','probe','probing','anonymous',true)",[unknownDuration,unknownSession,'https://www.instagram.com/reel/fixture/']);
 await service.completeJob(req,unknownDuration,{ok:true,duration:null,formats:[{format_id:'18',ext:'mp4',height:360,vcodec:'avc1',acodec:'aac',filesize:1000}]});
 const unknownResult=await service.jobForSession(unknownSession,unknownDuration);assert.equal(unknownResult.status,'waiting_choice');assert.equal(unknownResult.duration,null);
 await service.confirmDownload(unknownSession,unknownDuration,'v0');
 await query("UPDATE halaldl_fetch.jobs SET status='downloading' WHERE id=$1",[unknownDuration]);
 await assert.rejects(service.completeJob(req,unknownDuration,{ok:true,objectKey:`fetch/${unknownDuration}-${randomUUID()}`,bytes:1000,extension:'mp4',duration:700}),e=>e.code==='too_long');
 await service.completeJob(req,unknownDuration,{ok:true,objectKey:`fetch/${unknownDuration}-${randomUUID()}`,bytes:1000,extension:'mp4',duration:25});
 assert.equal((await service.jobForSession(unknownSession,unknownDuration)).duration,25);
 console.log(JSON.stringify({stage:'unknown_probe_duration_passed',finalDurationVerified:true}));
 // A source with no audio must survive repeated reads and may only select a
 // server-stored silent-video variant. Claims retain that exact delivery mode.
 await query("UPDATE halaldl_fetch.jobs SET status='failed' WHERE status='queued'");
 const silentId=randomUUID(),silentSession=await service.createSession();
 await query("INSERT INTO halaldl_fetch.jobs(id,session_id,source_url,platform,kind,status,tier,rights_ack) VALUES($1,$2,$3,'instagram','probe','probing','anonymous',true)",[silentId,silentSession,'https://www.instagram.com/reel/fixture/']);
 await service.completeJob(req,silentId,{ok:true,duration:null,formats:[{format_id:'dash-1v',ext:'mp4',height:720,vcodec:'vp9',acodec:'none'}]});
 const silentResult=await service.jobForSession(silentSession,silentId);
 assert.equal(silentResult.status,'waiting_choice');assert.equal(silentResult.formats[0].hasAudio,false);assert.equal('selector' in silentResult.formats[0],false);
 await assert.rejects(service.confirmDownload(silentSession,silentId,'--exec'),e=>e.code==='format');
 await service.confirmDownload(silentSession,silentId,silentResult.formats[0].formatId);
 const silentClaim=await service.claimJob(req);assert.equal(silentClaim.id,silentId);assert.equal(silentClaim.deliveryMode,'video_only');assert.equal(silentClaim.formatSelector,'dash-1v');
 await service.completeJob(req,silentId,{ok:true,objectKey:`fetch/${silentId}-${randomUUID()}`,bytes:1000,extension:'mp4',duration:15});
 assert.equal((await service.jobForSession(silentSession,silentId)).deliveryMode,'video_only');
 await assert.rejects(service.downloadLink(a,silentId,true),e=>e.status===404);
 console.log(JSON.stringify({stage:'silent_video_mode_passed',serverStoredSelection:true,claimMode:true,previewOwnershipDenied:true}));
 const expired=randomUUID(),flagged=randomUUID(),old=randomUUID();
 for(const [next,age,flag] of [[expired,0,false],[flagged,0,true],[old,31,false]])await query("INSERT INTO halaldl_fetch.jobs (id,session_id,source_url,platform,kind,status,tier,flagged,object_key,expires_at,created_at) VALUES($1,$2,$3,'vimeo','download','ready','anonymous',$4,$5,now()-interval '1 second',now()-$6*interval '1 day')",[next,a,link,flag,`fetch/${next}-${randomUUID()}`,age]);
 assert.equal((await service.jobForSession(a,expired)).status,'expired');
 await assert.rejects(service.downloadLink(a,expired),e=>e.status===410);
 await assert.rejects(service.jobForSession(a,flagged),e=>e.status===404);
 const cleanup=await service.cleanupExpired(req);assert.equal(cleanup.removed,3);assert.equal(deleted.length,3);
 assert.equal((await query('SELECT count(*) FROM halaldl_fetch.jobs WHERE id=$1',[old])).rows[0].count,'0');
 const result={event:'database_integration_passed',database:url.pathname.slice(1),connections:8,duplicateProbeRequests:6,singleConfirmationFrom:6,sourceThrottleAccepted:10,sourceThrottleDenied:1,atomicQuotaSpent:75,ownershipDenial:true,sameAccountAcrossSessions:true,legacyProGetsFree:true,expiredFilesRemoved:3,oldRecordsRemoved:true,storageAdapter:'Stubbed; real R2 tested independently'};
 console.log(JSON.stringify(result));
}finally{
 clearInterval(upkeep);
 await pool?.end();await rm(generated,{recursive:true,force:true});delete globalThis.__fetchIntegrationDeleted;
}
