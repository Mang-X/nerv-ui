import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
const root=fileURLToPath(new URL('../../../../',import.meta.url)),out=path.join(root,'docs/evidence/t07-p08/raw/responses')
const browserRoot=JSON.parse(fs.readFileSync(path.join(root,'docs/evidence/t07-p08/raw/browser-09.json'))).find(r=>r.stage==='restored-final').resources
const browserNested=JSON.parse(fs.readFileSync(path.join(root,'docs/evidence/t07-p08/raw/browser-13.json'))).find(r=>r.stage==='nested-asset-inventory').resources
const proof=JSON.parse(fs.readFileSync(path.join(root,'docs/evidence/t07-p08/raw/copy-proof.json')))
const results=[];fs.mkdirSync(out,{recursive:true})
for(const [name,directory,base] of [['root',path.join(root,'frontend/apps/playground/dist'),'http://127.0.0.1:4308/'],['nested','/tmp/nerv-ui-p08-nested-dist','http://127.0.0.1:4309/p08/']]){
 const html=fs.readFileSync(path.join(directory,'index.html'),'utf8'),assets=fs.readdirSync(path.join(directory,'assets'))
 const mainJS=html.match(/src="[^"]*\/(assets\/index-[^"]+\.js)"/)?.[1],mainCSS=html.match(/href="[^"]*\/(assets\/index-[^"]+\.css)"/)?.[1]
 assert.ok(mainJS);assert.ok(mainCSS)
 const paths=['index.html',mainJS,mainCSS,...[/^rolldown-runtime-.*\.js$/,/^dhtmlxgantt\.es-.*\.js$/,/^dhtmlxgantt-.*\.css$/,/^inter-latin-wght-normal-.*\.woff2$/].map(re=>{const file=assets.find(a=>re.test(a));assert.ok(file,String(re));return 'assets/'+file})]
 for(const [index,file] of paths.entries()){
  const url=base+(file==='index.html'?'':file),response=await fetch(url),body=Buffer.from(await response.arrayBuffer()),source=fs.readFileSync(path.join(directory,file)),mime=response.headers.get('content-type')
  const observedFreshBrowser=(name==='root'?browserRoot:browserNested).includes(url)
  if(file!== 'index.html'&&!observedFreshBrowser){const laneProof=proof.report.find(p=>p.lane===name);assert.equal(file,laneProof.current.asset);assert.equal(crypto.createHash('sha256').update(body).digest('hex'),laneProof.current.sha256)}
  assert.equal(response.status,200,url);assert.deepEqual(body,source,url)
  assert.match(mime,file.endsWith('.html')?/text\/html/:file.endsWith('.js')?/javascript/:file.endsWith('.css')?/text\/css/:/font\/woff2/)
  const stored=path.join(out,name+'-'+index+path.extname(file));fs.writeFileSync(stored,body)
  results.push({lane:name,url,status:response.status,mime,bytes:body.length,sha256:crypto.createHash('sha256').update(body).digest('hex'),distPath:path.join(directory,file),bodyPath:path.relative(root,stored),bodyEqualsFreshDist:true,observedFreshBrowser,limitedBrowserInheritance:!observedFreshBrowser&&file!=='index.html'})
 }
}
fs.writeFileSync(path.join(root,'docs/evidence/t07-p08/raw/response-identity-final.json'),JSON.stringify(results,null,2)+'\n')
console.log(results.map(({lane,url,status,mime,bytes,sha256})=>({lane,url,status,mime,bytes,sha256})))
