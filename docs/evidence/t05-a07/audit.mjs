import fs from 'node:fs'
import {execFileSync,spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import assert from 'node:assert/strict'
const cwd='/Users/mang/Project/nerv-ui-worktrees/t05-a07-screen-summary',out='/tmp/nerv-ui-t05-a07/handoff/raw',base='46052f3473e761378145506206ac96304aae0713'
const git=(...args)=>execFileSync('git',args,{cwd}),sha=b=>createHash('sha256').update(b).digest('hex');
const changed=[...new Set([...git('diff','--name-only',base).toString().trim().split('\n'),...git('ls-files','--others','--exclude-standard').toString().trim().split('\n')])].filter(Boolean)
const inputs=git('ls-files').toString().trim().split('\n').filter(p=>/(^|\/)package\.json$|^frontend\/pnpm-(lock|workspace)\.yaml$/.test(p)).map(p=>{const bytes=fs.readFileSync(cwd+'/'+p);assert(bytes.equals(git('show',base+':'+p)),p);return {path:p,bytes:bytes.length,sha256:sha(bytes)}});assert.equal(inputs.length,16)
const vue=['frontend/apps/playground','frontend/packages/ui','frontend/packages/ui-mobile'].map(p=>fs.realpathSync(createRequire(cwd+'/'+p+'/package.json').resolve('vue')));assert.equal(new Set(vue).size,1)
assert(!changed.some(p=>p.startsWith('migration/')||p.includes('/components/ui/')||p.endsWith('/index.ts')||p.endsWith('/tokens.css')||p.endsWith('.css')))
const checks=[];for(const [name,args] of [['fmt',['-C','frontend','exec','vp','fmt','--check',...changed.filter(p=>/\.(vue|ts|md)$/.test(p)).map(p=>cwd+'/'+p)]],['lint',['-C','frontend','exec','vp','lint',...changed.filter(p=>/\.(vue|ts)$/.test(p)).map(p=>p.slice(9))]]]){const r=spawnSync('/tmp/nerv-ui-t05-a07/bin/pnpm',args,{cwd,env:{...process.env,PATH:'/tmp/nerv-ui-t05-a07/bin:'+process.env.PATH},encoding:'utf8'});fs.writeFileSync(out+'/'+name+'.log',r.stdout+r.stderr);checks.push({name,args,exit:r.status});assert.equal(r.status,0,name)}
const diff=spawnSync('git',['diff','--check',base,'--',...changed.filter(p=>/\.(vue|ts|md)$/.test(p))],{cwd,encoding:'utf8'});fs.writeFileSync(out+'/diff-check.log',diff.stdout+diff.stderr);assert.equal(diff.status,0)
fs.writeFileSync(out+'/audit.json',JSON.stringify({base,changed,inputs,vue,checks,diffCheck:diff.status},null,2));console.log({dependencyInputs:inputs.length,vue,changed:changed.length,checks,diffCheck:diff.status})
