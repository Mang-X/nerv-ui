import fs from 'node:fs'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root=fileURLToPath(new URL('../../../../',import.meta.url))
const paths=['/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-research.md',...['t07-p07-review-r1','t07-p06-review-r2','t07-p05-review-r2','t07-p04-review-r4'].map(p=>'/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-26/'+p+'/review-receipt.md')]
const pointers=paths.map(file=>{const bytes=fs.readFileSync(file);return {path:file,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),scope:'Prior report, not a fresh run or an independent current review'}})
fs.writeFileSync(path.join(root,'docs/evidence/t07-p08/raw/history-pointers.json'),JSON.stringify(pointers,null,2)+'\n')
console.log(pointers)
