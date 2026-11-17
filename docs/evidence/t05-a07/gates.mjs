import fs from 'node:fs'
import {spawnSync} from 'node:child_process'
const cwd='/Users/mang/Project/nerv-ui-worktrees/t05-a07-screen-summary',out='/tmp/nerv-ui-t05-a07/handoff/raw'
for(const [name,pkg,script] of [['ui','@nerv-iip/ui','test'],['mobile','@nerv-iip/ui-mobile','test'],['host','@nerv-iip/playground','test'],['docs-ui','@nerv-iip/ui','test:docs'],['docs-mobile','@nerv-iip/ui-mobile','test:docs']]){
 const args=['-C','frontend','--filter',pkg,script,'--reporter=json','--outputFile='+out+'/'+name+'.json']
 const r=spawnSync('/tmp/nerv-ui-t05-a07/bin/pnpm',args,{cwd,env:{...process.env,PATH:'/tmp/nerv-ui-t05-a07/bin:'+process.env.PATH},encoding:'utf8',maxBuffer:64*1024*1024});fs.writeFileSync(out+'/'+name+'.log',r.stdout+r.stderr);fs.writeFileSync(out+'/'+name+'.exit.json',JSON.stringify({cwd,args,exit:r.status}));console.log({name,exit:r.status});if(r.status!==0)process.exit(r.status??1)
}
