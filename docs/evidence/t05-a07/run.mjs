import fs from 'node:fs'
import {spawnSync} from 'node:child_process'
const cwd='/Users/mang/Project/nerv-ui-worktrees/t05-a07-screen-summary',out='/tmp/nerv-ui-t05-a07/handoff/raw'
const [name,...args]=process.argv.slice(2)
const r=spawnSync('/tmp/nerv-ui-t05-a07/bin/pnpm',args,{cwd,env:{...process.env,PATH:'/tmp/nerv-ui-t05-a07/bin:'+process.env.PATH},encoding:'utf8',maxBuffer:64*1024*1024})
fs.writeFileSync(out+'/'+name+'.log',r.stdout+r.stderr)
fs.writeFileSync(out+'/'+name+'.exit.json',JSON.stringify({cwd,args,exit:r.status,error:r.error?.message}))
console.log(JSON.stringify({name,exit:r.status,tail:(r.stdout+r.stderr).slice(-1100)}));process.exit(r.status??1)
