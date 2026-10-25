import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import {fileURLToPath} from 'node:url'
const root=fileURLToPath(new URL('../../../../',import.meta.url)),raw=path.join(root,'docs/evidence/t07-p08/raw'),sha=b=>crypto.createHash('sha256').update(b).digest('hex')
const prior=JSON.parse(fs.readFileSync(path.join(raw,'response-identity-browser.json')))
const report=[]
for(const [lane,dir] of [['root',path.join(root,'frontend/apps/playground/dist')],['nested','/tmp/nerv-ui-p08-nested-dist']]){
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),file=html.match(/src="[^"]*\/(assets\/index-[^"]+\.js)"/)?.[1];assert.ok(file)
 const old=fs.readFileSync(path.join(raw,'summary-phase-before-'+lane+'.js'),'utf8'),current=fs.readFileSync(path.join(dir,file),'utf8')
 const normalizedReferences=[]
 function normalize(s){return s.replace(/(?:OfficePreview|PdfPreview)-[A-Za-z0-9_-]+\.(?:js|css)/g,value=>{normalizedReferences.push(value);return value.replace(/-[A-Za-z0-9_-]+(?=\.(?:js|css)$)/,'-CHUNK')})}
 const a=normalize(old),b=normalize(current);let first=0,last=0
 while(first<Math.min(a.length,b.length)&&a[first]===b[first])first++
 while(last<Math.min(a.length-first,b.length-first)&&a[a.length-1-last]===b[b.length-1-last])last++
 const before=a.slice(first,a.length-last),after=b.slice(first,b.length-last)
 assert.equal(before,'');assert.match(after,/^&&[A-Za-z_$][\w$]*\.type!==["']order["']$/)
 const other=prior.filter(r=>r.lane===lane&&!r.url.includes('/assets/index-')&&!r.url.endsWith('/')).map(r=>{
  const asset='assets/'+new URL(r.url).pathname.split('/').at(-1),bytes=fs.readFileSync(path.join(dir,asset));assert.equal(sha(bytes),r.sha256);return{asset,sha256:r.sha256,sameBytes:true}
 })
 report.push({lane,old:{sha256:sha(old),bytes:Buffer.byteLength(old)},current:{asset:file,sha256:sha(current),bytes:Buffer.byteLength(current)},semanticDelta:{before,after,onlyInsertion:true},normalizedReferences:[...new Set(normalizedReferences)],other})
}
const result={report,scope:'Only the summary-exclusion predicate changed after the browser matrix. Prior P08 library/studio fixtures contain no order summary tasks; resource continuous overlays do not use this helper. Inherit only those prior sequences with this proof. The new stale-summary counterexample is a public unit lane, not fresh browser or vendor conformance. No statement that all chunks or all possible models are equivalent.'}
fs.writeFileSync(path.join(raw,'copy-proof.json'),JSON.stringify(result,null,2)+'\n');console.log(result)
