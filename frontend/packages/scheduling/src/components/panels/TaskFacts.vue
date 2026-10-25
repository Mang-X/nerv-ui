<script setup lang="ts">
import { computed } from 'vue'
import type { ScheduleTask } from '../../model/types'
import { taskFactRows } from '../../model/task-facts'
const props = defineProps<{
  task?: ScheduleTask
  emptyLabel?: string
  relatedLabel?: string
  relatedLabels?: readonly string[]
}>()
const rows = computed(() => (props.task ? taskFactRows(props.task) : []))
const relatedLabels = computed(
  () => new Set(props.relatedLabels ?? ['销售订单', '客户', '商业关联', '前序', '后序']),
)
const facts = computed(() => rows.value.filter(([label]) => !relatedLabels.value.has(label)))
const related = computed(() => rows.value.filter(([label]) => relatedLabels.value.has(label)))
</script>

<template>
  <div class="grid gap-2 text-sm" data-testid="task-decision-facts">
    <p v-if="!task" class="text-sm text-muted-foreground">{{ emptyLabel ?? '未选择工序' }}</p>
    <dl v-else class="grid gap-1.5">
      <div v-for="([label, value], index) in facts" :key="index" class="flex justify-between gap-3">
        <dt class="shrink-0 text-muted-foreground">{{ label }}</dt>
        <dd class="text-right font-medium text-foreground">{{ value }}</dd>
      </div>
    </dl>
    <details v-if="related.length" class="rounded border border-border/60 p-2">
      <summary class="cursor-pointer font-medium">
        {{ relatedLabel ?? '订单 / 客户与前后依赖' }}
      </summary>
      <dl class="mt-2 grid gap-1.5">
        <div
          v-for="([label, value], index) in related"
          :key="index"
          class="flex justify-between gap-3"
        >
          <dt class="shrink-0 text-muted-foreground">{{ label }}</dt>
          <dd class="text-right font-medium text-foreground">{{ value }}</dd>
        </div>
      </dl>
    </details>
  </div>
</template>
