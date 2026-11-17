import fs from 'node:fs'
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {createRequire} from 'node:module'
import {createHash} from 'node:crypto'
const root='/Users/mang/Project/nerv-ui-worktrees/t04-n05-mobile-feedback',base='382e7641427cf2190ba39ea01229e28610aa113a'
const git=(...args)=>execFileSync('git',args,{cwd:root})
const paths=git('ls-files').toString().trim().split('\n').filter(p=>p.endsWith('package.json')||p.endsWith('pnpm-lock.yaml')||p.endsWith('pnpm-workspace.yaml'))
const inputs=paths.map(p=>{const b=fs.readFileSync(root+'/'+p);assert(b.equals(git('show',base+':'+p)),p);return{path:p,sha256:createHash('sha256').update(b).digest('hex'),equal:true}})
const dirs=['frontend/packages/ui','frontend/packages/ui-mobile','frontend/apps/playground'];const reqs=dirs.map(d=>createRequire(root+'/'+d+'/package.json'));const vue=reqs.map((r,i)=>({package:dirs[i],realpath:fs.realpathSync(r.resolve('vue')),version:r('vue').version,sameObject:r('vue')===reqs[0]('vue')}));assert(vue.every(v=>v.sameObject&&v.realpath===vue[0].realpath))
const comps=['notice-bar/NoticeBar','result/Result','empty/Empty','error-retry/ErrorRetry','badge/Badge','toast/MobileToast','avatar/MobileAvatar','tag/Tag','skeleton/MobileSkeleton','progress/MobileProgress','image/MobileImage']
const source='79b1578f2b75f55709765b5e7882aaf33146c603';const sourceChecks=comps.map(c=>{const p='frontend/packages/ui-mobile/src/components/'+c+'.vue',b=fs.readFileSync(root+'/'+p),s=execFileSync('git',['show',source+':'+p],{cwd:'/Users/mang/.t3/worktrees/Nerv-IIP/t3-5c5dc61d'});return{path:p,sourceSha256:createHash('sha256').update(s).digest('hex'),currentSha256:createHash('sha256').update(b).digest('hex'),equal:b.equals(s)}})
console.log(JSON.stringify({base,inputs,vue,source,sourceChecks},null,2))
