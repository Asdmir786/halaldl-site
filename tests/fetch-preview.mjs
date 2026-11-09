// Local-only UI fixture server. Proxy the isolated, credential-free Next preview
// on 4188; never import application DB/storage modules or forward API requests.
import http from 'node:http';
import {randomUUID} from 'node:crypto';
import {classifyFetchUrl} from '../src/lib/fetch/url.ts';
const target='http://127.0.0.1:4188';
let jobs=[],calls=[],scenario='ready',firstRead=true,intakeRejected=false;
const formats=[{formatId:'v0',label:'1080p',ext:'mp4',height:1080,filesize:1908888,mediaType:'video',hasAudio:true,deliveryMode:'video_audio'},{formatId:'v1',label:'720p',ext:'mp4',height:720,filesize:900000,mediaType:'video',hasAudio:true,deliveryMode:'video_audio'},{formatId:'a0',label:'Original audio',ext:'m4a',filesize:300000,mediaType:'audio',hasAudio:true,deliveryMode:'audio'},{formatId:'s0',label:'1080p',ext:'mp4',height:1080,filesize:1600000,mediaType:'video',hasAudio:false,deliveryMode:'video_only'}];
const active=j=>['queued','probing','waiting_choice','downloading'].includes(j.status);
function fixture(status,old=false){return {id:randomUUID(),kind:status==='ready'?'download':'probe',status,platform:'instagram',sourceUrl:old?'https://www.instagram.com/p/DfN0sXwRKGV/':'https://www.instagram.com/p/Ddt1o_Us_ns/',title:old?'Previous reel · test fixture':'ElevenLabs · test fixture',thumbnail:`/__test/thumb-${old?'old':'new'}.svg`,duration:old?19.7:42.988,errorCode:status==='failed'?'blocked':null,formats:status==='waiting_choice'?formats:[],ready:status==='ready',bytes:1908888,extension:'mp4',deliveryMode:'video_audio',createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+3600000).toISOString(),queuePosition:status==='queued'?1:null};}
function reset(state){scenario=state;firstRead=true;intakeRejected=false;calls=[];jobs=[fixture(state==='late_restore'?'ready':state==='offline'?'downloading':state),fixture('ready',true)];if(['idle','offline_idle','accepted_lost','intake_outage'].includes(state))jobs=[];}
reset('ready');
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1:4189');
 const send=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 try{
  if(url.pathname==='/__test/scenario'){reset(url.searchParams.get('state')||'ready');res.writeHead(303,{Location:'/fetch'});res.end();return;}
  if(url.pathname==='/__test/calls'){send({scenario,calls});return;}
  if(url.pathname==='/__test/health'){scenario=url.searchParams.get('available')==='false'?'offline':'ready';send({scenario});return;}
  if(url.pathname.startsWith('/__test/thumb-')){res.writeHead(200,{'Content-Type':'image/svg+xml'});res.end(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100"><rect width="160" height="100" fill="${url.pathname.includes('old')?'#9d5547':'#276a62'}"/><text x="80" y="58" text-anchor="middle" fill="white" font-family="sans-serif" font-size="24">${url.pathname.includes('old')?'OLD':'NEW'}</text></svg>`);return;}
  if(url.pathname.startsWith('/api/')){
   let input='';for await(const chunk of req)input+=chunk;
   const body=input?JSON.parse(input):{};calls.push({method:req.method,path:url.pathname,body});
   if(url.pathname==='/api/fetch/clearance'){send({ok:true});return;}
   if(url.pathname==='/api/fetch/status'){send({available:!scenario.startsWith('offline')&&!intakeRejected,workerConnected:!scenario.startsWith('offline'),canDownload:!scenario.startsWith('offline')&&!intakeRejected,cleared:true,jobId:scenario==='late_restore'?jobs[0]?.id:jobs.find(active)?.id??null,message:'The worker is offline. Try again shortly.',supportedPlatforms:['instagram','vimeo']});return;}
   if(url.pathname==='/api/fetch/history'){send({jobs});return;}
   const id=url.pathname.split('/').at(-1),job=jobs.find(j=>j.id===id);
   if(url.pathname==='/api/fetch/probe'||req.method==='PATCH'){
    if(scenario.startsWith('offline')||scenario==='intake_outage'){intakeRejected=true;send({error:'worker_offline',message:'The worker is offline. Try again shortly.'},503);return;}
    const source=classifyFetchUrl(job?.sourceUrl??body.url).href;
    const next=fixture('queued');next.sourceUrl=source;next.title=null;next.thumbnail=null;jobs.unshift(next);
    setTimeout(()=>{if(next.status==='queued')Object.assign(next,{...fixture('waiting_choice'),id:next.id,sourceUrl:source});},350);
    if(scenario==='accepted_lost'){send({message:'The response was interrupted.'},502);return;}
    send({id:next.id,platform:next.platform,queuePosition:1});return;
   }
   if(url.pathname==='/api/fetch/confirm'){
    const current=jobs.find(j=>j.id===body.jobId);
    if(!current||current.status!=='waiting_choice'){send({message:'Wrong job state.'},409);return;}
    const choice=current.formats.find(f=>f.formatId===body.formatId);current.status='downloading';current.kind='download';current.formats=[];current.quality=choice.label;current.extension=choice.ext;current.bytes=choice.filesize;
    setTimeout(()=>{if(current.status==='downloading')Object.assign(current,{status:'ready',ready:true,deliveryMode:choice.deliveryMode});},800);
    send({queuePosition:1});return;
   }
   if(job){
    if(req.method==='DELETE'){if(!active(job)){send({message:'This job has already finished.'},409);return;}job.status='cancelled';job.ready=false;job.formats=[];send({id,status:'cancelled'});return;}
    if(req.method==='POST'){send({url:`https://fixture.r2.cloudflarestorage.com/test/${id}.mp4`});return;}
    if(scenario==='late_restore'&&firstRead){firstRead=false;const value={...job};setTimeout(()=>send(value),8000);return;}
    send(job);return;
   }
   send({error:'missing',message:'No fixture found.'},404);return;
  }
  if(url.pathname==='/legal/terms'){res.end('Local UI fixture only. This test does not accept a legal agreement or contact live services.');return;}
  const upstream=await fetch(target+req.url,{redirect:'manual'});
  res.writeHead(upstream.status,Object.fromEntries([...upstream.headers].filter(([k])=>!['content-encoding','content-length','transfer-encoding'].includes(k))));
  const content=Buffer.from(await upstream.arrayBuffer());
  res.end(content);
 }catch(error){send({message:error.message,error:error.code},error.status??400);}
});
server.listen(4189,'127.0.0.1',()=>console.log('Isolated UI fixtures: http://127.0.0.1:4189/__test/scenario?state=ready'));
