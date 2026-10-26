import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const root=fileURLToPath(new URL('../../../../',import.meta.url))
for(const name of ['browser-09','browser-10','browser-13','browser-12','browser-15-layout-green']){
 const script=new URL('./'+name+'.mjs',import.meta.url).href
 const args=['docs/evidence/t07-p08/scripts/gate.mjs',name,'.','ego-browser','nodejs','-e',`await import('${script}')`]
 const r=spawnSync('node',args,{cwd:root,stdio:'inherit'});if(r.status!==0){process.exitCode=r.status??1;break}
}
