import fs from 'node:fs'
import path from 'node:path'
import {execFileSync,spawnSync} from 'node:child_process'
const cwd='/Users/mang/Project/nerv-ui-worktrees/t05-a07-screen-summary';
const files=[...new Set([...execFileSync('git',['diff','--name-only'],{cwd,encoding:'utf8'}).trim().split('\n'),...execFileSync('git',['ls-files','--others','--exclude-standard'],{cwd,encoding:'utf8'}).trim().split('\n')])].filter(f=>f&&/\.(vue|ts|md)$/.test(f));
fs.writeFileSync('/tmp/nerv-ui-t05-a07/handoff/raw/maintenance-files.json',JSON.stringify(files,null,2));
const write=process.argv.includes('--write'),args=['-C','frontend','exec','vp','fmt',write?'--write':'--check',...files.map(f=>path.join(cwd,f))];const r=spawnSync('/tmp/nerv-ui-t05-a07/bin/pnpm',args,{cwd,env:{...process.env,PATH:'/tmp/nerv-ui-t05-a07/bin:'+process.env.PATH},encoding:'utf8'});fs.writeFileSync('/tmp/nerv-ui-t05-a07/handoff/raw/'+(process.argv[2]||'fmt')+'.log',r.stdout+r.stderr);console.log({files,args,exit:r.status,output:(r.stdout+r.stderr).slice(-1000)});process.exit(r.status??1)
