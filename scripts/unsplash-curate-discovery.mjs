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
fashion:'South African streetwear fashion full outfit urban style clothing model Johannesburg',
spaces:'modern African interior design stylish living room contemporary home decor natural materials',
technology:'African tech professional modern computer workstation electronics coding studio',
culture:'South African contemporary art gallery crafts design cultural festival colorful art',
living:'modern home lifestyle kitchen decor furniture home accessories product photography',
beauty:'African skincare beauty makeup products cosmetics portrait natural beauty editorial',
sports:'South African athletes running gym training football basketball fitness action',
food:'South African food plated cuisine braai street food market fresh ingredients',
automotive:'modern cars SUV vehicle interior exterior automotive photography South Africa',
pets:'domestic dog puppy cat kitten pet owner playing companion animal photography',
kids:'South African children family lifestyle playground toys kids clothing joyful activity',
creative:'African creative artist painting illustration pottery craft design studio',
events:'South African celebration party wedding concert event decor guests',
hobbies:'hobby collections model building board games photography crafts leisure objects',
services:'South African hair stylist barber mechanic electrician professional service provider working',
travel:'South African travel landscape safari mountains coastline city destination scenic photography',
business:'South African entrepreneur small business shop owner working retail storefront office',
digital:'digital products laptop tablet software interface graphic design online creator workspace'
};
const entries=markets.map(m=>({...m,query:queries[m.id]||('African South African '+m.category+' lifestyle photography'),queryKey:'parent-africa:'+m.id}));
const categoryTerms={
fashion:['fashion','clothing','streetwear','outfit','style','wear','model'],
spaces:['interior','home','living','room','furniture','decor','design'],
technology:['technology','computer','electronics','coding','laptop','workspace','tech'],
culture:['art','culture','heritage','craft','gallery','festival','museum'],
living:['home','kitchen','furniture','decor','living','household','product'],
beauty:['beauty','skincare','skin','makeup','cosmetics','hair','portrait'],
sports:['sport','sports','fitness','athlete','running','gym','football','basketball','training'],
food:['food','cuisine','meal','dish','restaurant','cooking','market','braai'],
automotive:['car','cars','vehicle','automotive','motor','driving','suv'],
pets:['pet','pets','dog','dogs','puppy','cat','cats','kitten','animal'],
kids:['kid','kids','child','children','family','play','toy','school'],
creative:['art','artist','creative','painting','craft','illustration','pottery','studio'],
events:['event','party','celebration','wedding','concert','festival','guests'],
hobbies:['hobby','collection','collecting','craft','game','gaming','model','leisure'],
services:['service','professional','barber','hairdresser','mechanic','electrician','repair','working'],
travel:['travel','landscape','destination','mountain','beach','coast','safari','city'],
business:['business','entrepreneur','shop','store','retail','office','owner','startup'],
digital:['digital','software','interface','laptop','tablet','app','online','website','design']
};
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
 const ranked=candidates.map(photo=>({photo,score:scorePhoto(photo,entry.query,entry.category,entry.id)})).sort((a,b)=>b.score-a.score);
 const choice=ranked.find(({photo,score})=>!used.has(photo.id)&&score>=5);
 if(!choice){selected[entry.id]={status:'needs-review',query:entry.query,category:entry.category};continue;}
 used.add(choice.photo.id);selected[entry.id]={...choice.photo,query:entry.query,category:entry.category,title:entry.title,relevanceScore:choice.score,status:'candidate-review'};
}
const output={generatedAt:new Date().toISOString(),source:'Unsplash API',visualDirection:'African/South African contemporary lifestyle',totalMarkets:entries.length,fetchedMarkets:entries.filter(e=>(cache.search[e.queryKey]||[]).length).length,selectedUniquePhotos:Object.values(selected).filter(p=>p.id).length,pendingQueries:entries.filter(e=>!(cache.search[e.queryKey]||[]).length).map(e=>e.category),photos:selected};
fs.writeFileSync(OUTPUT_FILE,JSON.stringify(output,null,2)+'\n');saveCache(cache);
console.log('\nReview catalogue:',OUTPUT_FILE,'\nUnique candidates:',output.selectedUniquePhotos+'/'+entries.length,'\nPending queries:',output.pendingQueries.length,'\nCandidates require review; they are not auto-applied.');
function parseMarkets(text){const re=/\{ id: '([^']+)', image: image\('[^']+'\), alt: '([^']+)', category: '([^']+)', title: '([^']+)' \}/g;return [...text.matchAll(re)].map(m=>({id:m[1],alt:m[2],category:m[3],title:m[4]}));}
function scorePhoto(photo,query,category,id){
 const text=tokenize([photo.description,...(photo.tags||[])].join(' '));
 const terms=categoryTerms[id]||tokenize(category);
 let score=0;
 for(const term of terms)if(text.has(term))score+=5;
 const queryTerms=tokenize(query);
 for(const term of queryTerms)if(text.has(term)&&!terms.includes(term))score+=1;
 const mismatch={
 pets:['wild','wolf','lion','elephant','zoo','safari'],
 kids:['adult','man','woman','portrait'],
 food:['car','vehicle','fashion','building'],
 automotive:['food','portrait','animal'],
 sports:['umbrella','architecture','building'],
 services:['wildlife','elephant','safari','landscape'],
 business:['wildlife','animal','safari','barbed','fence'],
 living:['mask','skull','wildlife','animal'],
 technology:['wildlife','animal','food'],
 digital:['wildlife','animal','food']
 }[id]||[];
 for(const term of mismatch)if(text.has(term))score-=6;
 return score;
}
function tokenize(v){return new Set(String(v).toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>2));}
function loadCache(){try{return JSON.parse(fs.readFileSync(CACHE_FILE,'utf8'));}catch{return{search:{},requestTimestamps:[]};}}
function saveCache(v){fs.writeFileSync(CACHE_FILE,JSON.stringify(v,null,2)+'\n');}
function readEnv(name){if(process.env[name])return process.env[name];for(const file of ['.env.local','.env']){const p=path.join(ROOT,file);if(!fs.existsSync(p))continue;const line=fs.readFileSync(p,'utf8').split(/\r?\n/).find(r=>r.trim().startsWith(name+'='));if(line){const value=line.slice(line.indexOf('=')+1).trim().replace(/^['"]|['"]$/g,'');if(value)return value;}}return'';}
