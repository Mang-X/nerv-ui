<script setup lang="ts">
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
