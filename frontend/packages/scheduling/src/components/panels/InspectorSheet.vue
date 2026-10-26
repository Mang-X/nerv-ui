<script setup lang="ts">
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@nerv-iip/ui'
import type { ScheduleTask } from '../../model/types'
import TaskDetailPanel from './TaskDetailPanel.vue'

// Internal compatibility wrapper. Public consumers compose Sheet + TaskDetailPanel.
defineProps<{ task?: ScheduleTask; open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="w-[380px] sm:max-w-[380px]">
      <SheetHeader>
        <SheetTitle>活动详情</SheetTitle>
        <SheetDescription>查看时间安排与状态。</SheetDescription>
      </SheetHeader>
      <TaskDetailPanel :task="task" read-only />
    </SheetContent>
  </Sheet>
</template>
