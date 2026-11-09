import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtemp,readFile,readdir,writeFile,rm} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,join} from 'node:path';
import ts from 'typescript';
import {neonConfig} from '@neondatabase/serverless';
const url=new URL(process.env.FETCH_TEST_DATABASE_URL||'postgres://invalid/invalid');
assert.match(url.pathname,/^\/halaldl_fetch_verify_[a-z0-9_]+$/);
assert.ok(!process.env.DATABASE_URL||new URL(process.env.DATABASE_URL).pathname!==url.pathname);
process.env.DATABASE_URL=url.href;process.env.AUTH_SECRET='recovery-test-only';process.env.WORKER_TOKEN='recovery-test-only';
neonConfig.webSocketConstructor=globalThis.WebSocket;
const root=dirname(dirname(fileURLToPath(import.meta.url))),generated=await mkdtemp(join(root,'.analytics','tick-db-'));
let pool,upkeep;
try{
 for(const name of await readdir(join(root,'src/lib/fetch'))){
  if(!name.endsWith('.ts'))continue;
  const input=(await readFile(join(root,'src/lib/fetch',name),'utf8')).replaceAll('../../../services/fetch-worker/media.mjs',pathToFileURL(join(root,'services/fetch-worker/media.mjs')).href);
  let code=ts.transpileModule(input,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  code=code.replace(/(["'])@\/lib\/fetch\/([a-z-]+)\1/g,'"./$2.mjs"').replace(/(["'])\.\/([a-z-]+)(?:\.ts)?\1/g,'"./$2.mjs"').replaceAll('"next/server"','"next/server.js"').replaceAll('"next/headers"','"next/headers.js"');
  await writeFile(join(generated,name.replace(/\.ts$/,'.mjs')),code);
 }
 await writeFile(join(generated,'storage.mjs'),`export function storageConfigured(){return true} export async function deleteMediaObject(){} export async function presignDownload(key){return 'https://fixture.r2.cloudflarestorage.com/'+key}`);
 const db=await import(pathToFileURL(join(generated,'db.mjs'))),s=await import(pathToFileURL(join(generated,'service.mjs')));

 pool=db.getPool();await db.ensureSchema();const q=(text,values=[])=>pool.query(text,values);
 let routeCode=ts.transpileModule(await readFile(join(root,'src/app/api/worker/route.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 routeCode=routeCode.replace(/(["'])@\/lib\/fetch\/([a-z-]+)\1/g,'"./$2.mjs"').replaceAll('"next/server"','"next/server.js"');
 await writeFile(join(generated,'route.mjs'),routeCode);const route=await import(pathToFileURL(join(generated,'route.mjs')));
 const workerId=randomUUID();const headers={'content-type':'application/json',authorization:'Bearer recovery-test-only','x-halaldl-worker-protocol':'3','x-halaldl-worker-id':workerId};
 const beat={protocolVersion:3,workerId,capacity:2,activeJobs:[],runningJobs:0,waitingJobs:0,memoryFreeMb:12000,diskFreeMb:40000,cpuCount:2,accepting:true,downloadAccepting:true,transcoding:false,detail:'ready'};
 process.env.FETCH_MAX_RUNNING='2';
 const post=async(body,auth=headers)=>route.POST(new Request('https://fixture.example/api/worker',{method:'POST',headers:auth,body:JSON.stringify(body)}));
 assert.deepEqual(await(await post(beat)).json(),{ok:true,activeJobIds:[]});
 upkeep=setInterval(()=>void q('UPDATE halaldl_fetch.worker_status SET reported_at=now() WHERE id=1').catch(()=>{}),5000);
 let wakes=0;const committed=[];const ring=()=>{wakes++;committed.push(q("SELECT count(*) FROM halaldl_fetch.jobs WHERE status='queued'"))};
 const a=await s.createSession(),b=await s.createSession(),link='https://vimeo.com/1084537';
 const duplicates=await Promise.all(Array.from({length:6},()=>s.probeUrl(a,link,true,false,null,ring)));
 assert.equal(wakes,1);for(const r of await Promise.all(committed))assert.ok(Number(r.rows[0].count)>0);
 const downloadId=randomUUID(),format={formatId:'v0',selector:'18',ext:'mp4',mediaType:'video',height:360};
 await q("INSERT INTO halaldl_fetch.jobs(id,session_id,source_url,platform,kind,status,tier,formats) VALUES($1,$2,$3,'vimeo','probe','waiting_choice','anonymous',$4::jsonb)",[downloadId,b,link,JSON.stringify([format])]);
 await s.confirmDownload(b,downloadId,'v0',ring);assert.equal(wakes,2);
 await assert.rejects(s.confirmDownload(b,downloadId,'v0',ring));assert.equal(wakes,2);
 const firstResponse=await post({...beat,claim:true,claimKinds:['download','probe']});assert.equal(firstResponse.status,200);const first=await firstResponse.json();assert.equal(first.job.id,downloadId);assert.deepEqual(first.activeJobIds,[]);
 const activeJobs=[{id:first.job.id,leaseToken:first.job.leaseToken}];
 const second=await(await post({...beat,activeJobs,claim:true,claimKinds:['probe']})).json();assert.equal(second.job.id,duplicates[0].id);assert.deepEqual(second.activeJobIds,[downloadId]);
 activeJobs.push({id:second.job.id,leaseToken:second.job.leaseToken});
 const full=await(await post({...beat,activeJobs,claim:true})).json();assert.equal(full.job,null);assert.equal(full.activeJobIds.length,2);
 for(const claimKinds of [[],['other'],['probe','probe']])assert.equal((await post({...beat,claim:true,claimKinds})).status,400);
 assert.equal((await post({...beat,claim:true},{...headers,authorization:'Bearer wake-only'})).status,401);
 const before=wakes;await assert.rejects(s.probeUrl(await s.createSession(),link,false,false,null,ring));assert.equal(wakes,before);
 console.log(JSON.stringify({stage:'combined_tick_passed',duplicateNotifications:wakes,downloadFirst:true,eligibleKinds:true,activeLeaseIdsPreserved:true,twoSlotsEnforced:true,invalidKindsRejected:true,wakeTokenCannotClaim:true,failedWritesDoNotNotify:true}));
}finally{clearInterval(upkeep);await pool?.end();await rm(generated,{recursive:true,force:true})}
