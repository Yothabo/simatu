#!/usr/bin/env node
/**
 * Curates African/South African Unsplash photo candidates for Simatu's 18 parent
 * discovery tiles. Outputs a review catalogue only; does not modify the UI.
 * Run: npm run images:unsplash-curate
 * Key: UNSPLASH_ACCESS_KEY or VITE_UNSPLASH_ACCESS_KEY in .env.local/.env
 */
import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const TAXONOMY=path.join(ROOT,'src/systems/homepage/discover/discovery-taxonomy.ts');
const CACHE_FILE=path.join(ROOT,'.unsplash-discovery-cache.json');
const OUTPUT_FILE=path.join(ROOT,'discovery-parent-images.generated.json');
const MAX_REQUESTS=Number(process.env.UNSPLASH_BATCH_LIMIT||18);
const HOURLY_LIMIT=Number(process.env.UNSPLASH_HOURLY_LIMIT||50);
const KEY=readEnv('UNSPLASH_ACCESS_KEY')||readEnv('VITE_UNSPLASH_ACCESS_KEY');
if(!KEY){console.error('Missing Unsplash Access Key in .env.local/.env');process.exit(1);}
if(!fs.existsSync(TAXONOMY)){console.error('Taxonomy file not found:',TAXONOMY);process.exit(1);}
const source=fs.readFileSync(TAXONOMY,'utf8');
const markets=parseMarkets(source);
const cache=loadCache();cache.search||={};cache.requestTimestamps||=[];
const queries={
fashion:'South African contemporary fashion streetwear Johannesburg African street style',
spaces:'South African contemporary interior design modern African home interior',
technology:'African technology creative workspace modern electronics lifestyle',
culture:'African contemporary culture art heritage South Africa vibrant photography',
living:'South African everyday lifestyle home essentials products modern home',
beauty:'African beauty skincare cosmetics editorial South Africa',
sports:'South African sport fitness outdoor athletic lifestyle action photography',
food:'South African cuisine food market vibrant local food photography',
automotive:'South African automotive lifestyle modern cars urban road photography',
pets:'South African pets dogs cats animal lifestyle photography',
kids:'African family children joyful play kids lifestyle South Africa',
creative:'African artist creative studio art making colorful South Africa',
events:'South African celebration event wedding party vibrant photography',
hobbies:'African hobby collection creative leisure collectibles photography',
services:'South African local service professional at work authentic photography',
travel:'South Africa travel landscape destination adventure photography',
business:'African entrepreneur small business owner workspace South Africa',
digital:'African digital creator laptop software creative technology workspace'
};
const entries=markets.map(m=>({...m,query:queries[m.id]||('African South African '+m.category+' lifestyle photography'),queryKey:'parent-africa:'+m.id}));
const cutoff=Date.now()-3600000;cache.requestTimestamps=cache.requestTimestamps.filter(t=>t>cutoff);
const budget=Math.max(0,HOURLY_LIMIT-cache.requestTimestamps.length),limit=Math.min(MAX_REQUESTS,budget);let fetched=0;
for(const entry of entries){
 if(Array.isArray(cache.search[entry.queryKey])&&cache.search[entry.queryKey].length)continue;
 if(fetched>=limit)break;
 const url=new URL('https://api.unsplash.com/search/photos');
 url.searchParams.set('query',entry.query);url.searchParams.set('per_page','30');url.searchParams.set('orientation','landscape');url.searchParams.set('content_filter','high');
 const res=await fetch(url,{headers:{Authorization:'Client-ID '+KEY,'Accept-Version':'v1'}});
 if(!res.ok){console.error('Unsplash failed:',entry.category,res.status);if(res.status===429)break;continue;}
 const body=await res.json();
 cache.search[entry.queryKey]=(body.results||[]).map(p=>({id:p.id,url:p.urls?.regular||p.urls?.small,description:p.alt_description||p.description||'',photographer:p.user?.name||'',photographerUrl:p.user?.links?.html||'',photoUrl:p.links?.html||'',tags:(p.tags||[]).map(t=>t.title).filter(Boolean),color:p.color||''})).filter(p=>p.id&&p.url);
 fetched++;cache.requestTimestamps.push(Date.now());saveCache(cache);console.log('Fetched',entry.category,'('+fetched+'/'+limit+')');
}
const selected={},used=new Set();
for(const entry of entries){
 const candidates=cache.search[entry.queryKey]||[];
 const ranked=candidates.map(photo=>({photo,score:scorePhoto(photo,entry.query,entry.category)})).sort((a,b)=>b.score-a.score);
 const choice=ranked.find(({photo})=>!used.has(photo.id));
 if(!choice){selected[entry.id]={status:'needs-review',query:entry.query,category:entry.category};continue;}
 used.add(choice.photo.id);selected[entry.id]={...choice.photo,query:entry.query,category:entry.category,title:entry.title,relevanceScore:choice.score,status:'candidate-review'};
}
const output={generatedAt:new Date().toISOString(),source:'Unsplash API',visualDirection:'African/South African contemporary lifestyle',totalMarkets:entries.length,fetchedMarkets:entries.filter(e=>(cache.search[e.queryKey]||[]).length).length,selectedUniquePhotos:Object.values(selected).filter(p=>p.id).length,pendingQueries:entries.filter(e=>!(cache.search[e.queryKey]||[]).length).map(e=>e.category),photos:selected};
fs.writeFileSync(OUTPUT_FILE,JSON.stringify(output,null,2)+'\n');saveCache(cache);
console.log('\nReview catalogue:',OUTPUT_FILE,'\nUnique candidates:',output.selectedUniquePhotos+'/'+entries.length,'\nPending queries:',output.pendingQueries.length,'\nCandidates require review; they are not auto-applied.');
function parseMarkets(text){const re=/\{ id: '([^']+)', image: image\('[^']+'\), alt: '([^']+)', category: '([^']+)', title: '([^']+)' \}/g;return [...text.matchAll(re)].map(m=>({id:m[1],alt:m[2],category:m[3],title:m[4]}));}
function scorePhoto(photo,query,category){const words=new Set(tokenize(query)),cats=tokenize(category),tags=tokenize([photo.description,...(photo.tags||[])].join(' '));let score=0;for(const w of words)if(tags.has(w))score+=4;for(const w of cats)if(tags.has(w))score+=2;if(photo.description)score++;for(const w of ['african','africa','south','johannesburg','cape','durban','pretoria','local','township'])if(tags.has(w))score+=3;return score;}
function tokenize(v){return String(v).toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>2);}
function loadCache(){try{return JSON.parse(fs.readFileSync(CACHE_FILE,'utf8'));}catch{return{search:{},requestTimestamps:[]};}}
function saveCache(v){fs.writeFileSync(CACHE_FILE,JSON.stringify(v,null,2)+'\n');}
function readEnv(name){if(process.env[name])return process.env[name];for(const file of ['.env.local','.env']){const p=path.join(ROOT,file);if(!fs.existsSync(p))continue;const line=fs.readFileSync(p,'utf8').split(/\r?\n/).find(r=>r.trim().startsWith(name+'='));if(line){const value=line.slice(line.indexOf('=')+1).trim().replace(/^['"]|['"]$/g,'');if(value)return value;}}return'';}
