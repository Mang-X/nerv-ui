import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { parse } from '../../../../frontend/node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/index.js'
const root=fileURLToPath(new URL('../../../../',import.meta.url))
const base='613f243023e2a756cef5b656d4b690206c273204'
const git=(args,cwd=root)=>execFileSync('git',args,{cwd,encoding:'utf8'}).trim()
const blob=p=>execFileSync('git',['show',base+':'+p],{cwd:root})
const sha=b=>crypto.createHash('sha256').update(b).digest('hex')
const equal=p=>{const current=fs.readFileSync(path.join(root,p)),before=blob(p);assert.deepEqual(current,before,p);return {path:p,bytes:current.length,sha256:sha(current),sameBase:true}}
const lock='frontend/pnpm-lock.yaml',a=parse(blob(lock).toString()),b=parse(fs.readFileSync(path.join(root,lock),'utf8'))
assert.deepEqual(b,a)
assert.equal(Object.keys(b.packages).length,973);assert.equal(Object.keys(b.snapshots).length,973)
const unchanged=[lock,'frontend/pnpm-workspace.yaml','frontend/package.json','frontend/apps/playground/package.json','frontend/apps/playground/vite.config.ts','frontend/tsconfig.json','frontend/packages/ui/package.json','frontend/packages/ui-mobile/package.json','frontend/packages/scheduling/package.json','frontend/packages/scheduling/tsconfig.json','frontend/packages/scheduling/vite.config.ts','frontend/packages/scheduling/vite.mjs','frontend/packages/scheduling/src/components/useEngine.ts','frontend/packages/scheduling/src/engine/dhtmlx/loader.ts','frontend/packages/scheduling/src/components/SchedulingCanvas.vue','frontend/packages/scheduling/src/components/GanttChart.vue','frontend/packages/scheduling/src/components/ResourceSchedulerBoard.vue','frontend/packages/scheduling/src/composables/useSchedulingEdits.ts'].map(equal)
const vendor=['dhtmlxgantt.es.js','dhtmlxgantt.css','dhtmlxgantt.d.ts'].map(n=>equal('frontend/packages/scheduling/vendor/dhtmlx/'+n))
assert.deepEqual(vendor.map(x=>x.bytes),[891743,142723,211538])
const vue=['apps/playground','packages/ui','packages/ui-mobile','packages/scheduling'].map(p=>{const req=createRequire(path.join(root,'frontend',p,'package.json'));return {package:p,path:fs.realpathSync(req.resolve('vue/package.json')),version:req('vue/package.json').version}})
assert.equal(new Set(vue.map(v=>v.path)).size,1);assert.ok(vue.every(v=>v.version==='3.5.39'))
const css=fs.readFileSync(path.join(root,'frontend/packages/scheduling/vendor/dhtmlx/dhtmlxgantt.css'),'utf8')
const dataUrls=[...css.matchAll(/url\((data:[^)]*)\)/g)].map(m=>sha(m[1]))
const licensePath='frontend/node_modules/.pnpm/@fontsource-variable+inter@5.2.8/node_modules/@fontsource-variable/inter/LICENSE'
const license=fs.readFileSync(path.join(root,licensePath))
const enginePath='frontend/packages/scheduling/src/engine/dhtmlx/DhtmlxEngine.ts'
const old=blob(enginePath).toString(),current=fs.readFileSync(path.join(root,enginePath),'utf8')
const section=(s,start,end)=>s.slice(s.indexOf(start),s.indexOf(end,s.indexOf(start)))
const protectedSections=[['mount(', '  private finishMount('],['  private addBaselineLayer(', '  /** 一行(']].map(([start,end])=>{const before=section(old,start,end),after=section(current,start,end);assert.equal(after,before);return {start,end,sha256:sha(after),sameBase:true}})
const changed=git(['diff','--name-only',base]).split('\n')
assert.ok(!changed.some(p=>p.startsWith('migration/')||p.startsWith('frontend/reference-adapters/')||p.startsWith('frontend/reference-tests/')))
const object=cwd=>({cwd,head:git(['rev-parse','HEAD'],cwd),tree:git(['rev-parse','HEAD^{tree}'],cwd),status:git(['status','--porcelain'],cwd),main:git(['rev-parse','main'],cwd),trackingMain:git(['rev-parse','origin/main'],cwd)})
const report={base,lock:{fullObjectDeepEqual:true,byteEqual:true,packages:Object.keys(b.packages).length,snapshots:Object.keys(b.snapshots).length,importers:Object.keys(b.importers),allMetadataOptionalPeerEdgesCompared:true},unchanged,vendor,vue,font:{licenseBytes:license.length,licenseSha256:sha(license),remoteFontFaces:(css.match(/https:\/\/fonts\.gstatic\.com/g)??[]).length,dataUrlHashes:dataUrls},protectedSections,source:object('/Users/mang/.t3/worktrees/Nerv-IIP/t3-5c5dc61d'),root:object('/Users/mang/Project/nerv-ui'),automaticTree:object('/Users/mang/.t3/worktrees/Nerv-IIP/t3-6f0b7613')}
assert.equal(report.source.head,'79b1578f2b75f55709765b5e7882aaf33146c603');assert.equal(report.source.status,'');assert.equal(report.root.status,'')
fs.writeFileSync(path.join(root,'docs/evidence/t07-p07/raw/invariants.json'),JSON.stringify(report,null,2)+'\n')
console.log({packages:973,snapshots:973,vendor:vendor.map(v=>v.bytes),vueIdentity:vue[0],unchanged:unchanged.length})
