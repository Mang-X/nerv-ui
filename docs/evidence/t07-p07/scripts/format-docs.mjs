import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const root=fileURLToPath(new URL('../../../../',import.meta.url))
const check=process.argv.includes('--check'),files=process.argv.slice(2).filter(p=>p!=='--check')
for(const file of files){
  const absolute=path.resolve(root,file),before=fs.readFileSync(absolute,'utf8')
  const result=spawnSync('corepack',['pnpm','exec','vp','fmt','--stdin-filepath='+path.basename(file)],{cwd:path.join(root,'frontend'),input:before,encoding:'utf8',maxBuffer:8*1024*1024})
  assert.equal(result.status,0,result.stderr)
  assert.ok(result.stdout.startsWith('# '),result.stdout.slice(0,150))
  if(check)assert.equal(result.stdout,before,file)
  else fs.writeFileSync(absolute,result.stdout)
  console.log({file,exit:result.status,unchanged:result.stdout===before,check})
}
