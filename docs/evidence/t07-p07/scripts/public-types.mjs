import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root=fileURLToPath(new URL('../../../../',import.meta.url)),out='/tmp/nerv-ui-p07-public-consumer'
fs.mkdirSync(path.join(out,'node_modules/@nerv-iip'),{recursive:true})
for(const [name,target] of [['scheduling','packages/scheduling'],['ui','packages/ui']]) {
  const p=path.join(out,'node_modules/@nerv-iip',name)
  if(!fs.existsSync(p))fs.symlinkSync(path.join(root,'frontend',target),p)
}
const vue=path.join(out,'node_modules/vue')
if(fs.existsSync(vue)||fs.lstatSync(vue,{throwIfNoEntry:false}))fs.unlinkSync(vue)
fs.symlinkSync(fs.realpathSync(path.join(root,'frontend/packages/scheduling/node_modules/vue')),vue)
fs.writeFileSync(path.join(out,'tsconfig.json'),JSON.stringify({extends:path.join(root,'frontend/tsconfig.base.json'),compilerOptions:{types:[path.join(root,'frontend/node_modules/vite/dist/vite/client.d.ts')],composite:false},include:['Consumer.vue']},null,2))
fs.writeFileSync(path.join(out,'Consumer.vue'),`<script setup lang="ts">
import { shallowRef, useTemplateRef } from 'vue'
import { ResourceSchedulerBoard, type ScheduleModel, type TaskDragPayload } from '@nerv-iip/scheduling'
const model=shallowRef<ScheduleModel>()
const board=useTemplateRef<InstanceType<typeof ResourceSchedulerBoard>>('board')
const legacy:TaskDragPayload={taskId:'activity',operationId:'operation',startUtc:'2026-10-25T08:00:00Z',endUtc:'2026-10-25T10:00:00Z',kind:'move'}
const explicit:TaskDragPayload={...legacy,resourceId:'original-equipment',kind:'reassign',assignment:{dimension:'team',id:'target-team',label:'Target team'}}
const unassigned:NonNullable<TaskDragPayload['assignment']>={dimension:'team',id:null,label:'Unassigned'}
function onProposal(p:TaskDragPayload){const destination:string|null|undefined=p.assignment?.id;void destination;void explicit;void unassigned;board.value?.command({kind:'setReadOnly',readOnly:true})}
</script>
<template><ResourceSchedulerBoard ref="board" :model="model" group-by="team" lane-order="name" :read-only="false" @task-drag-end="onProposal" /></template>
`)
console.log(out)
