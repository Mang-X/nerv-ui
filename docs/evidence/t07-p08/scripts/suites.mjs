import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const root=fileURLToPath(new URL('../../../../',import.meta.url))
const commands=[['scheduling-final','frontend/packages/scheduling','pnpm','test','--reporter=json','--outputFile=../../../docs/evidence/t07-p08/raw/scheduling-final.json'],['host-final','frontend/apps/playground','pnpm','test','--reporter=json','--outputFile=../../../docs/evidence/t07-p08/raw/host-final.json'],['docs-source-final','frontend','pnpm','--filter','@nerv-iip/ui','test:docs','--reporter=json','--outputFile=../../../docs/evidence/t07-p08/raw/docs-source-final.json']]
let failed=false
for(const args of commands){ const r=spawnSync('node',['docs/evidence/t07-p08/scripts/gate.mjs',...args],{cwd:root,stdio:'inherit'}); if(r.status!==0)failed=true }
process.exitCode=failed?1:0
