import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
const directory=fileURLToPath(new URL('../raw/',import.meta.url))
const report=[]
for(const file of fs.readdirSync(directory).filter(f=>f.endsWith('.json'))){
 const data=JSON.parse(fs.readFileSync(path.join(directory,file),'utf8'))
 if(!Array.isArray(data.testResults))continue
 const cases=data.testResults.flatMap(t=>t.assertionResults.map(a=>({file:t.name,name:a.fullName,status:a.status,failureMessages:a.failureMessages??null})))
 const suites=data.testResults.map(t=>({name:t.name,status:t.status,message:t.message??null,discovery:t.assertionResults.length}))
 report.push({file,success:data.success??null,discovery:data.numTotalTests??null,passed:data.numPassedTests??null,failed:data.numFailedTests??null,pending:data.numPendingTests??null,failedSuites:data.numFailedTestSuites??null,
  unhandledCount:data.unhandledCount??null,unhandledErrors:data.unhandledErrors??null,errors:data.errors??null,reason:data.reason??null,numRuntimeErrorTestSuites:data.numRuntimeErrorTestSuites??null,cases,suites})
}
for(const name of ['scheduling-seal.json','host-seal.json','docs-source-seal.json']){
 const r=report.find(r=>r.file===name);assert.ok(r,name);assert.equal(r.success,true,name);assert.ok(r.discovery>0);assert.equal(r.failed,0);assert.equal(r.failedSuites,0);assert.equal(r.cases.length,r.discovery)
}
fs.writeFileSync(path.join(directory,'validation.json'),JSON.stringify(report,null,2)+'\n')
console.log(report.map(({file,discovery,passed,failed,pending,failedSuites,unhandledCount,success})=>({file,discovery,passed,failed,pending,failedSuites,unhandledCount,success})))
