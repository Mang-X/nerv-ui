<script setup lang="ts">
import { shallowRef } from 'vue'
import { SchedulingToolbar, SchedulingLegend, TaskFacts, TaskDetailPanel, ChangeSummaryPanel, ConflictPanel, UnscheduledPanel, type ScheduleTask, type ScheduleModel, type ScheduleChange, type TimeScale, type LaneOrder } from '@nerv-iip/scheduling'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@nerv-iip/ui'
const model=shallowRef<ScheduleModel>()
const task=shallowRef<ScheduleTask>()
const changes=shallowRef<ScheduleChange[]>([])
const scale=shallowRef<TimeScale>('hour')
const order=shallowRef<LaneOrder>('name')
function lock(id:string, locked:boolean){void id;void locked}
function fix(group:string, operation:string){void group;void operation}
function select(id:string){void id}
const oldTask:ScheduleTask={id:'a',orderId:'g',operationId:'o',operationSequence:1,type:'operation',text:'Activity',startUtc:'2026-11-02T00:00:00Z',endUtc:'2026-11-02T02:00:00Z',locked:false,hasConflict:false}
const newTask:ScheduleTask={...oldTask,display:{groupLabel:'Group',resourceLabel:'Space',priorityLabel:'Priority',blockLabel:'Reserved',blockDescription:'Host reserved window'}}
void newTask
</script>
<template>
<SchedulingToolbar :scale="scale" :read-only="false" :can-undo="true" :can-redo="false" :dirty="true" :busy="false" searchable :group-dimensions="[{key:'team',label:'Group'}]" :lane-order="order" :labels="{release:'Confirm'}" :disabled-reasons="{redo:'No redo',scale:'Unavailable'}" @scale-change="scale=$event" @lane-order-change="order=$event" />
<SchedulingLegend :model="model" :scale="scale" view="resource" group-by="team" :lane-order="order" :now="0" :hidden-groups="[]" :toggleable-groups="['category']" :block-labels="{maintenance:'Reserved'}" />
<TaskFacts :task="task" empty-label="No selection" :related-labels="['Relation']" related-label="Relations" />
<TaskDetailPanel :task="task" :read-only="false" lock-disabled-reason="Pending" :labels="{empty:'No selection',lock:'Lock',unlock:'Unlock',resource:'Space',changeover:'Preparation'}" @toggle-lock="lock" />
<ChangeSummaryPanel :changes="changes" :labels="{filter:'Search'}" @select="select" />
<ConflictPanel :conflicts="[]" :labels="{title:'Notices'}" @select="select" />
<UnscheduledPanel :items="[]" :read-only="true" :labels="{title:'Waiting'}" @fix="fix" />
<Sheet :open="false"><SheetContent><SheetHeader><SheetTitle>Details</SheetTitle><SheetDescription>Selected activity</SheetDescription></SheetHeader><TaskDetailPanel :task="task" read-only /></SheetContent></Sheet>
</template>
