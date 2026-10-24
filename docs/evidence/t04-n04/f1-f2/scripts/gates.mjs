import { spawnSync } from 'node:child_process'
const root='/Users/mang/Project/nerv-ui-worktrees/t04-n04-mobile-lists'
const dir='/tmp/nerv-ui-t04-n04-fix'
const tests=[
 ['mobile',['-C','frontend/packages/ui-mobile','test']],
 ['mobile-docs',['-C','frontend/packages/ui-mobile','test:docs']],
 ['ui',['-C','frontend/packages/ui','test']],
 ['ui-docs',['-C','frontend/packages/ui','test:docs']],
 ['host',['-C','frontend/apps/playground','test']],
 ['build',['-C','frontend','build']],
]
for(const [name,args] of tests){
 if(name!=='build')args.push('--reporter=default','--reporter=json',`--outputFile=${dir}/raw/${name}.json`)
 const r=spawnSync('node',[`${dir}/run.mjs`,name,'corepack','pnpm@11.22.0',...args],{cwd:root,stdio:'inherit'})
 if(r.status!==0)process.exit(r.status??1)
}
