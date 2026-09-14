import fs from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {readUniverse,digest} from './universe-model.mjs';
const [db,source,out,commit]=process.argv.slice(2);
if(!db||!source||!out||!/^[a-f0-9]{40}$/.test(commit||''))throw Error('Usage: universe-compact.mjs db source new-output exact-commit');
const json=p=>JSON.parse(readFileSync(path.join(source,p),'utf8'));
const m=readUniverse(db,json('blocks/families.json'),json('code/index.json'));
await fs.mkdir(out,{recursive:false});
let bytesTotal=0,maxBytes=0;const indexes={},files=[],relations=[];await fs.mkdir(path.join(out,'relations'));
async function table(kind,records){
 await fs.mkdir(path.join(out,kind));indexes[kind]=[];let batch=[],bytes=2;
 async function flush(){if(!batch.length)return;const name=`${kind}/${indexes[kind].length}.json`,content=Buffer.from(JSON.stringify(batch));if(content.length>=600000)throw Error('Shard too large');await fs.writeFile(path.join(out,name),content,{flag:'wx'});const entry={path:name,first:batch[0].n,last:batch.at(-1).n,count:batch.length,bytes:content.length,sha256:digest(content)};indexes[kind].push(entry);files.push(entry);bytesTotal+=content.length;maxBytes=Math.max(maxBytes,content.length);batch=[];bytes=2;}
 for(const row of records){
  if(Buffer.byteLength(JSON.stringify(row))>570000){for(const [field,values]of Object.entries(row)){if(!Array.isArray(values)||values.length<1000)continue;const parts=[];for(let i=0;i<values.length;i+=1000){const name='relations/'+relations.length+'.json',content=Buffer.from(JSON.stringify(values.slice(i,i+1000)));if(content.length>=600000)throw Error('Relation shard too large');await fs.writeFile(path.join(out,name),content,{flag:'wx'});const entry={path:name,bytes:content.length,sha256:digest(content)};relations.push(entry);parts.push(name);bytesTotal+=content.length;maxBytes=Math.max(maxBytes,content.length);}row[field]={parts,count:values.length};}}
  const size=Buffer.byteLength(JSON.stringify(row))+1;if(size>580000)throw Error(`Record needs relation partitioning: ${kind}/${row.n} (${size})`);if(bytes+size>580000)await flush();batch.push(row);bytes+=size;}await flush();
}
const sorted=map=>[...map.keys()].sort((a,b)=>typeof a==='number'?a-b:a.localeCompare(b));
await table('line',sorted(m.lines).map(n=>({n,sha256:m.lines.get(n).sha,base64:m.lines.get(n).base64,families:[...(m.lineFamilies.get(n)||[])],tablets:[...(m.lineTablets.get(n)||[])]})));
await table('family',sorted(m.families).map(n=>{const f=m.families.get(n);return {n,names:[...f.names],needs:[...f.needs],lines:[...f.lines],tablets:[...f.tablets],uses:[...f.uses.keys()],used_by:[...f.usedBy.keys()],blocks:[...(m.memberships.get(n)||[])],scope:f.repos.size?'Retained source history':'No retained source occurrence'};}));
await table('tablet',sorted(m.tablets).map(n=>{const t=m.tablets.get(n);return {n,git_blob:t.git_blob,lines:t.lines,families:[...t.families],sources:[...t.sources]};}));
await table('source',sorted(m.sources).map(n=>{const s=m.sources.get(n);return {n,repo:s.repo,commit:s.commit_sha,path:s.path,tablet:s.tablet};}));
await table('block',Object.keys(m.groups).sort().map(n=>({n,families:m.groups[n]})));
await table('repository',sorted(m.repos).map(n=>({n,families:[...m.repos.get(n).families],sources:[...m.repos.get(n).sources]})));
const manifest={schema:'stars-universe-normalized/1',observed_utc:new Date().toISOString(),source_commit:commit,database_sha256:m.database_sha256,counts:{lines:m.lines.size,families:m.families.size,tablets:m.tablets.size,sources:m.sources.size,blocks:Object.keys(m.groups).length,repositories:m.repos.size},scope:'All retained database keys and occurrences; name-match candidates are not verified runtime calls; historical keys have no inferred supersession mapping.',indexes,relations,bytes:bytesTotal,max_file_bytes:maxBytes};
const content=Buffer.from(JSON.stringify(manifest));if(content.length>=600000)throw Error('Manifest too large');if(bytesTotal+content.length>=200000000)throw Error('Universe exceeds 200 MB');await fs.writeFile(path.join(out,'manifest.json'),content,{flag:'wx'});
console.log(JSON.stringify({observed_utc:manifest.observed_utc,counts:manifest.counts,bytes:bytesTotal+content.length,files:files.length+relations.length+1,max_file_bytes:Math.max(maxBytes,content.length),source_commit:commit,database_sha256:m.database_sha256}));
