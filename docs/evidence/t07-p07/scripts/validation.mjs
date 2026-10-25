import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
const root=fileURLToPath(new URL('../../../../',import.meta.url)),raw=path.join(root,'docs/evidence/t07-p07/raw')
const sha=b=>crypto.createHash('sha256').update(b).digest('hex')
const reports=['scheduling-final-02','host-final','docs-source-final'].map(name=>{
 const r=JSON.parse(fs.readFileSync(path.join(raw,name+'.json'),'utf8')),tests=r.testResults.flatMap(s=>s.assertionResults.map(t=>({file:s.name,name:t.fullName,status:t.status,failures:t.failureMessages})))
 const passed=tests.filter(t=>t.status==='passed').length,skipped=tests.filter(t=>t.status==='skipped').length,failed=tests.filter(t=>t.status==='failed').length
 assert.equal(tests.length,r.numTotalTests);assert.equal(passed,r.numPassedTests);assert.equal(skipped,r.numPendingTests);assert.equal(failed,0);assert.equal(r.success,true)
 return {name,discovery:r.numTotalTests,passed,skipped,failed,success:r.success,numRuntimeErrorTestSuites:r.numRuntimeErrorTestSuites??null,unhandledCount:r.unhandledCount??null,unhandledErrors:r.unhandledErrors??null,errors:r.errors??null,reason:r.reason??null,tests}
})
assert.deepEqual(reports.map(r=>[r.discovery,r.passed,r.skipped]),[[169,165,4],[298,298,0],[6,6,0]])
const gates=JSON.parse(fs.readFileSync(path.join(raw,'gates.json'),'utf8'))
const build=gates.find(g=>g.name==='build-root-final-formatted')
const source=['frontend/packages/scheduling/src/engine/dhtmlx/DhtmlxEngine.ts','frontend/packages/scheduling/src/engine/engine.ts','frontend/packages/scheduling/src/model/resource-projection.ts','frontend/apps/playground/src/ResourceEditingDemo.vue','frontend/apps/playground/src/App.vue','frontend/apps/playground/src/ResourceScheduleDemo.vue'].map(p=>{
 const file=path.join(root,p),bytes=fs.readFileSync(file),stat=fs.statSync(file)
 assert.ok(stat.mtimeMs<=Date.parse(build.started),p)
 return {path:p,bytes:bytes.length,sha256:sha(bytes),mtime:stat.mtime.toISOString(),unchangedAfterFinalBuildStarted:true}
})
const bodies=JSON.parse(fs.readFileSync(path.join(raw,'response-identity-final.json'),'utf8'))
assert.equal(bodies.length,14)
for(const body of bodies){const bytes=fs.readFileSync(path.join(root,body.body));assert.equal(sha(bytes),body.sha256);assert.equal(bytes.length,body.bytes);assert.equal(body.bodyEqualsFreshDist,true)}
const report={reports,totals:{behaviorDiscovery:467,behaviorPassed:463,behaviorSkipped:4,docsPassed:6},stubConformanceExecution:0,source,finalResponses:bodies.length,gates,unrun:['independent-review','CI','docs10','packed11','device','old-consumers13/15','parent8-combination','SDK/APS','production-release','commercial-authorization','native-80/125-zoom'],inherited:['unchanged UI/mobile behavior suites','P02 pure and P03 prepared public-host lanes','pre-copy current-round browser matrix, limited by exact copy-only main-JS difference']}
fs.writeFileSync(path.join(raw,'validation.json'),JSON.stringify(report,null,2)+'\n')
console.log(report.totals)
