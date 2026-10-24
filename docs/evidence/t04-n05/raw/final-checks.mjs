import fs from 'node:fs'
import {spawnSync,execFileSync} from 'node:child_process'
const root='/Users/mang/Project/nerv-ui-worktrees/t04-n05-mobile-feedback',out='/tmp/nerv-ui-t04-n05'
const env={...process.env,PATH:out+'/bin:'+process.env.PATH};const checks=[]
function run(name,args){const r=spawnSync(out+'/bin/pnpm',['-C','frontend',...args],{cwd:root,env,maxBuffer:30e6});fs.writeFileSync(out+'/'+name+'.log',Buffer.concat([r.stdout??Buffer.alloc(0),r.stderr??Buffer.alloc(0)]));checks.push({name,args,exit:r.status});fs.writeFileSync(out+'/checks.json',JSON.stringify(checks,null,2));console.log(name,r.status);if(r.status!==0)process.exit(r.status??1)}
run('final-mobile-behavior',['--filter','@nerv-iip/ui-mobile','exec','vp','test','run','src','--exclude','src/nvui-doc-coverage.contract.test.ts','--exclude','src/nvui-naming.contract.test.ts','--reporter=default','--reporter=json','--outputFile='+out+'/mobile.json'])
run('final-mobile-naming',['--filter','@nerv-iip/ui-mobile','exec','vp','test','run','src/nvui-naming.contract.test.ts'])
run('final-mobile-staticdocs',['--filter','@nerv-iip/ui-mobile','test:docs'])
run('final-ui',['--filter','@nerv-iip/ui','test'])
run('final-ui-staticdocs',['--filter','@nerv-iip/ui','test:docs'])
run('final-host',['--filter','@nerv-iip/playground','exec','vp','test','run','src','--reporter=default','--reporter=json','--outputFile='+out+'/host.json'])
const paths=execFileSync('git',['ls-files','--modified','--others','--exclude-standard'],{cwd:root,encoding:'utf8'}).trim().split('\n');const manual=paths.filter(p=>/\.(md|vue|ts)$/.test(p)&&!p.startsWith('docs/evidence/')).map(p=>root+'/'+p)
run('final-scoped-fmt',['exec','vp','fmt','--check',...manual])
run('final-scoped-lint',['exec','vp','lint',...manual.filter(p=>/\.(vue|ts)$/.test(p))])
