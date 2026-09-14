import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const add = (map, key, value) => { if (!map.has(key)) map.set(key, new Set()); map.get(key).add(value); };
export const digest = value => createHash('sha256').update(value).digest('hex');
export const unpack = bytes => { const b=Buffer.from(bytes); if(b.length%4)throw Error('Malformed numbered tablet'); const out=[];for(let i=0;i<b.length;i+=4)out.push(b.readUInt32LE(i));return out; };
export function readUniverse(dbPath, groups, codeIndex) {
  const databaseBytes=readFileSync(dbPath); // Missing input must fail before SQLite can create a file.
  const db=new DatabaseSync(dbPath,{readOnly:true});
  try {
    const integrity=db.prepare('PRAGMA quick_check').get();
    if(Object.values(integrity)[0]!=='ok')throw Error('Numbered database integrity check failed');
    const lines=new Map(),tablets=new Map(),families=new Map(),sources=new Map(),repos=new Map(),lineFamilies=new Map(),lineTablets=new Map(),memberships=new Map();
    for(const l of db.prepare('SELECT n,sha,text FROM line').iterate()) {
      const bytes=Buffer.from(l.text),sha=Buffer.from(l.sha).toString('hex');
      if(digest(bytes)!==sha)throw Error('Line content does not match permanent key digest: '+l.n);
      lines.set(l.n,{n:l.n,sha,text:bytes.toString('utf8'),base64:bytes.toString('base64'),families:new Set(),tablets:new Set()});
    }
    if(lines.size!==codeIndex.lines)throw Error(`Database and code export line counts differ: ${lines.size}/${codeIndex.lines}`);
    for(const t of db.prepare('SELECT n,git_blob,lang,lines,issue FROM tablet').iterate()) {
      const keys=unpack(t.lines);
      for(const n of keys) {if(!lines.has(n))throw Error('Tablet references absent permanent line '+n);add(lineTablets,n,t.n);}
      tablets.set(t.n,{n:t.n,git_blob:t.git_blob,lang:t.lang,issue:t.issue,lines:keys,families:new Set(),sources:new Set()});
    }
    for(const f of db.prepare('SELECT n,lang FROM family').iterate())families.set(f.n,{n:f.n,lang:f.lang,names:new Set(),needs:new Set(),lines:new Set(),tablets:new Set(),sources:new Set(),repos:new Set(),uses:new Map(),usedBy:new Map()});
    for(const s of db.prepare('SELECT * FROM scan').iterate())repos.set(s.repo,{...s,sources:new Set(),families:new Set()});
    for(const o of db.prepare('SELECT repo,commit_sha,path,tablet,seen_utc FROM occurrence ORDER BY repo,commit_sha,path').iterate()) {
      if(!tablets.has(o.tablet)||!/^[a-f0-9]{40}$/.test(o.commit_sha))throw Error('Unresolved or unpinned source occurrence');
      const key=digest(JSON.stringify([o.repo,o.commit_sha,o.path]));
      const source={...o,key,families:new Set()};sources.set(key,source);tablets.get(o.tablet).sources.add(key);
      if(!repos.has(o.repo))repos.set(o.repo,{repo:o.repo,issue:'No current scan record',sources:new Set(),families:new Set()});
      repos.get(o.repo).sources.add(key);
    }
    for(const te of db.prepare('SELECT e.family,e.needs,te.tablet,te.first,te.last,te.name FROM tablet_element te JOIN element e ON e.n=te.element').iterate()) {
      const f=families.get(te.family),t=tablets.get(te.tablet);
      if(!f||!t||te.first<1||te.last<te.first||te.last>t.lines.length)throw Error('Unresolved family occurrence');
      if(te.name)f.names.add(te.name);
      if(te.needs)for(const n of JSON.parse(te.needs))f.needs.add(n);
      f.tablets.add(t.n);t.families.add(f.n);
      for(const n of t.lines.slice(te.first-1,te.last)){f.lines.add(n);add(lineFamilies,n,f.n);}
    }
    for(const t of tablets.values())for(const sourceKey of t.sources){const s=sources.get(sourceKey);for(const n of t.families){s.families.add(n);const f=families.get(n);f.sources.add(sourceKey);f.repos.add(s.repo);repos.get(s.repo).families.add(n);}}
    for(const [sym,keys]of Object.entries(groups)){if(!Array.isArray(keys))throw Error('Invalid group');for(const n of keys){if(!families.has(n))throw Error('Group references absent family '+n);add(memberships,n,sym);}}
    // All candidates are retained. These are lexical name matches, never runtime call proof.
    const definers=new Map();
    for(const f of families.values())for(const name of f.names)if(name!=='(anonymous)'&&name.length>1)add(definers,name,f.n);
    for(const f of families.values())for(const name of f.needs){
      const candidates=[...(definers.get(name)||[])].filter(n=>n!==f.n);
      const same=candidates.filter(n=>[...families.get(n).repos].some(r=>f.repos.has(r)));
      for(const n of (same.length?same:candidates)){add(f.uses,n,name);add(families.get(n).usedBy,f.n,name);}
    }
    return {database_sha256:digest(databaseBytes),lines,tablets,families,sources,repos,lineFamilies,lineTablets,memberships,groups,codeIndex};
  } finally {db.close();}
}
