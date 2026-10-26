<script setup lang="ts">
import {
  Empty,
  EmptyDescription,
  EmptyTitle,
  NvInput,
  NvStatusBadge,
  ScrollArea,
} from '@nerv-iip/ui'
import { computed, shallowRef } from 'vue'
import { scheduleTime } from '../../model/factory-time'
import { changeTone, changeTypeLabel } from '../../model/labels'
import type { ScheduleChange, ScheduleTask } from '../../model/types'

const props = defineProps<{
  changes: ScheduleChange[]
  baseTasks?: ScheduleTask[]
  tasks?: ScheduleTask[]
  labels?: { title?: string; filter?: string; emptyTitle?: string; emptyDescription?: string }
}>()
const orderFilter = shallowRef('')
const filteredChanges = computed(() => {
  const query = orderFilter.value.trim().toLocaleLowerCase()
  return props.changes
    .filter((change) =>
      `${change.groupLabel ?? change.orderId} ${change.label ?? ''}`
        .toLocaleLowerCase()
        .includes(query),
    )
    .map((change) => {
      const before = findTask(props.baseTasks, change)
      const after = findTask(props.tasks, change)
      return { ...change, before, after }
    })
})
function findTask(tasks: ScheduleTask[] | undefined, change: ScheduleChange) {
  // An explicit identity stays authoritative even after removal (including an empty id).
  // Only historical records with no identity may use the unique legacy association.
  if (change.taskId !== undefined) return tasks?.find((task) => task.id === change.taskId)
  const matches = tasks?.filter(
    (task) => task.orderId === change.orderId && task.operationId === change.operationId,
  )
  return matches?.length === 1 ? matches[0] : undefined
}
function formatTime(value: string, task?: ScheduleTask) {
  if (task?.timezone !== undefined)
    return scheduleTime(value, task.timezone, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}
const emit = defineEmits<{ select: [taskId: string] }>()

function selectionReason(c: ScheduleChange) {
  if (c.selectDisabledReason) return c.selectDisabledReason
  if (!c.taskId) return '无关联活动'
  if (props.tasks && !findTask(props.tasks, c)) return '该活动当前不可查看'
}
function onClick(c: ScheduleChange) {
  if (c.taskId && !selectionReason(c)) emit('select', c.taskId)
}
</script>

<template>
  <section class="flex h-full flex-col" aria-label="变更摘要">
    <header class="flex items-center justify-between px-3 py-2">
      <h3 class="text-sm font-semibold text-foreground">{{ labels?.title ?? '变更摘要' }}</h3>
      <span class="text-sm text-muted-foreground"
        >{{ filteredChanges.length }} / {{ changes.length }} 项</span
      >
    </header>
    <NvInput
      v-model="orderFilter"
      :aria-label="labels?.filter ?? '筛选工单'"
      :placeholder="labels?.filter ?? '输入工单号筛选'"
      class="mx-3 mb-2 w-auto"
    />
    <Empty v-if="!changes.length" class="py-8">
      <EmptyTitle>{{ labels?.emptyTitle ?? '暂无变更' }}</EmptyTitle>
      <EmptyDescription>{{
        labels?.emptyDescription ?? '当前没有提供调整记录。'
      }}</EmptyDescription>
    </Empty>
    <Empty v-else-if="!filteredChanges.length" class="py-8">
      <EmptyTitle>没有匹配的变更</EmptyTitle>
      <EmptyDescription>调整或清空筛选后查看。</EmptyDescription>
    </Empty>
    <ScrollArea v-else class="flex-1">
      <ul class="flex flex-col gap-1 p-2">
        <li
          v-for="(c, i) in filteredChanges"
          data-change-row
          :key="`${c.taskId ?? `${c.orderId}:${c.operationId}`}:${c.changeType}:${i}`"
        >
          <button
            type="button"
            :data-change-task="c.taskId"
            :disabled="!!selectionReason(c)"
            :title="selectionReason(c)"
            class="flex w-full flex-col gap-2 rounded-md border border-border bg-card px-3 py-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            @click="onClick(c)"
          >
            <span class="flex w-full flex-wrap items-center gap-2">
              <NvStatusBadge
                :tone="changeTone[c.changeType]"
                :label="c.typeLabel ?? changeTypeLabel[c.changeType]"
              />
              <span class="flex-1 text-sm font-medium text-foreground">{{
                c.label ?? c.after?.text ?? c.before?.text ?? '活动'
              }}</span>
              <span class="text-sm text-muted-foreground">{{ c.groupLabel ?? c.orderId }}</span>
            </span>
            <span v-if="tasks" class="grid gap-1 text-sm text-muted-foreground">
              <span
                >资源：{{ c.before?.display?.resourceLabel ?? c.before?.resourceId ?? '未排' }} →
                {{ c.after?.display?.resourceLabel ?? c.after?.resourceId ?? '未排' }}</span
              >
              <span>
                原时间：<template v-if="c.before"
                  ><time :datetime="c.before.startUtc">{{
                    formatTime(c.before.startUtc, c.before)
                  }}</time>
                  ～
                  <time :datetime="c.before.endUtc">{{
                    formatTime(c.before.endUtc, c.before)
                  }}</time></template
                ><template v-else>未排</template>
              </span>
              <span>
                新时间：<template v-if="c.after"
                  ><time :datetime="c.after.startUtc">{{
                    formatTime(c.after.startUtc, c.after)
                  }}</time>
                  ～
                  <time :datetime="c.after.endUtc">{{
                    formatTime(c.after.endUtc, c.after)
                  }}</time></template
                ><template v-else>未排</template>
              </span>
            </span>
            <span class="text-sm text-foreground">原因：{{ c.message }}</span>
          </button>
        </li>
      </ul>
    </ScrollArea>
  </section>
</template>
