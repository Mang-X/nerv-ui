import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const root=fileURLToPath(new URL('../../../../',import.meta.url))
const commands=[['build-root-final','frontend','pnpm','build'],['build-nested-final','frontend','pnpm','--filter','@nerv-iip/playground','exec','vp','build','--base=/p08/','--outDir=/tmp/nerv-ui-p08-nested-dist']]
for(const args of commands){const r=spawnSync('node',['docs/evidence/t07-p08/scripts/gate.mjs',...args],{cwd:root,stdio:'inherit'});if(r.status!==0){process.exitCode=r.status??1;break}}
