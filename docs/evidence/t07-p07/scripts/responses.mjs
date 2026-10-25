import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
const root=fileURLToPath(new URL('../../../../',import.meta.url)),raw=path.join(root,'docs/evidence/t07-p07/raw')
const revision=process.argv[2]??''
const sha=b=>crypto.createHash('sha256').update(b).digest('hex')
const records=[]
for(const lane of ['root','nested']){
 const input=JSON.parse(await fs.readFile(path.join(raw,'resource-urls-'+lane+revision+'.json'),'utf8'))
 const directory=lane==='root'?path.join(root,'frontend/apps/playground/dist'):'/tmp/nerv-ui-p07-nested-dist'
 await fs.mkdir(path.join(raw,'responses'+revision,lane),{recursive:true})
 for(const url of input.selected){
  const response=await fetch(url),body=Buffer.from(await response.arrayBuffer())
  let relative=decodeURIComponent(new URL(url).pathname)
  relative=lane==='nested'?relative.slice('/p07/'.length):relative.slice(1)
  relative ||= 'index.html'
  const fresh=await fs.readFile(path.join(directory,relative))
  assert.equal(response.status,200,url);assert.deepEqual(body,fresh,url)
  const saved=path.join(raw,'responses'+revision,lane,path.basename(relative))
  await fs.writeFile(saved,body);assert.deepEqual(await fs.readFile(saved),body)
  records.push({lane,url,status:response.status,mime:response.headers.get('content-type'),bytes:body.length,sha256:sha(body),body:path.relative(root,saved),freshDist:path.relative(root,path.join(directory,relative)),bodyEqualsFreshDist:true})
 }
}
await fs.writeFile(path.join(raw,'response-identity'+revision+'.json'),JSON.stringify(records,null,2)+'\n')
console.log({responses:records.length,allEqualFreshDist:true})
