import fs from 'node:fs'
import assert from 'node:assert/strict'
import {execFileSync,spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
const root=fileURLToPath(new URL('../../../../',import.meta.url)).replace(/\/$/,'')
const records=[]
for(const {pid,cwd,match} of ['/tmp/nerv-ui-p08-root-server.log','/tmp/nerv-ui-p08-nested-server.log'].map(file=>({pid:JSON.parse(fs.readFileSync(file,'utf8')).pid,cwd:root,match:'scripts/serve.mjs'}))){
 const command=spawnSync('ps',['-p',String(pid),'-o','command='],{cwd:root,encoding:'utf8'})
 if(command.status!==0){records.push({pid,alreadyExited:true,psExit:command.status});continue}
 const listing=execFileSync('lsof',['-a','-p',String(pid),'-d','cwd','-Fn'],{cwd:root,encoding:'utf8'})
 const actual=listing.split('\n').find(line=>line.startsWith('n'))?.slice(1)
 assert.equal(actual,cwd);assert.ok(command.stdout.includes(match));
 process.kill(pid,'SIGTERM');records.push({pid,cwd:actual,command:command.stdout.trim(),signal:'SIGTERM'})
}
await new Promise(resolve=>setTimeout(resolve,200))
const ports=[4307,4308,4309].map(port=>{const result=spawnSync('lsof',['-nP','-iTCP:'+port,'-sTCP:LISTEN'],{cwd:root,encoding:'utf8'});assert.equal(result.status,1,result.stdout);return{port,lsofExit:result.status,listener:result.stdout}})
assert.equal(fs.existsSync('/tmp/nerv-ui-p08-vendor-unavailable'),false)
fs.writeFileSync(root+'/docs/evidence/t07-p08/raw/service-cleanup-seal.json',JSON.stringify({records,ports,markerAbsent:true,worktreesRemoved:false},null,2)+'\n')
console.log({records,ports})
