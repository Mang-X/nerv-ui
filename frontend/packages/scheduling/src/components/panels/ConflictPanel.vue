<script setup lang="ts">
import { Empty, EmptyDescription, EmptyTitle, NvStatusBadge, ScrollArea } from '@nerv-iip/ui'
import { conflictReasonLabel, severityTone } from '../../model/labels'
import type { ScheduleConflict } from '../../model/types'

defineProps<{
  conflicts: ScheduleConflict[]
  labels?: { title?: string; emptyTitle?: string; emptyDescription?: string }
}>()
const emit = defineEmits<{ select: [taskId: string] }>()

function onClick(c: ScheduleConflict) {
  if (c.taskId && !c.selectDisabledReason) emit('select', c.taskId)
}
</script>

<template>
  <section class="flex h-full flex-col" aria-label="冲突">
    <header class="flex items-center justify-between px-3 py-2">
      <h3 class="text-sm font-semibold text-foreground">{{ labels?.title ?? '排程冲突' }}</h3>
      <span class="text-sm text-muted-foreground">{{ conflicts.length }} 项</span>
    </header>
    <Empty v-if="!conflicts.length" class="py-8">
      <EmptyTitle>{{ labels?.emptyTitle ?? '无冲突' }}</EmptyTitle>
      <EmptyDescription>{{
        labels?.emptyDescription ?? '当前没有提供冲突记录。'
      }}</EmptyDescription>
    </Empty>
    <ScrollArea v-else class="flex-1">
      <ul class="flex flex-col gap-1 p-2">
        <li v-for="c in conflicts" :key="c.id">
          <button
            type="button"
            :data-conflict-id="c.id"
            :disabled="!c.taskId || !!c.selectDisabledReason"
            :title="c.selectDisabledReason ?? (!c.taskId ? '无关联活动' : undefined)"
            class="flex w-full flex-col gap-1 rounded-md border border-border bg-card px-3 py-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            @click="onClick(c)"
          >
            <span class="flex items-center gap-2">
              <NvStatusBadge
                :tone="severityTone[c.severity]"
                :label="c.reasonLabel ?? conflictReasonLabel[c.reason]"
              />
              <span class="truncate text-sm text-muted-foreground">{{ c.label ?? c.orderId }}</span>
            </span>
            <span class="text-sm text-foreground">{{ c.message }}</span>
          </button>
        </li>
      </ul>
    </ScrollArea>
  </section>
</template>
