<script setup lang="ts">
import { computed } from 'vue'
import type { ScheduleModel, ScheduleTask } from '../../model/types'
import SavedPlanWorkOrderLink from './SavedPlanWorkOrderLink.vue'
import type { SavedPlanCommercial, SavedPlanLinks, SavedPlanNavigateRequest, SavedPlanOrders } from './types'

const props = defineProps<{
  planId: string
  model: ScheduleModel
  orders?: SavedPlanOrders
  commercial?: SavedPlanCommercial
  links?: SavedPlanLinks
  selectedTaskId?: string | null
  navigate?: (request: SavedPlanNavigateRequest) => void | Promise<void>
}>()
const emit = defineEmits<{ select: [taskId: string] }>()

const validOrders = computed(() => props.orders?.planId === props.planId ? props.orders.rows : [])
const currentCommercial = computed(() => props.commercial?.planId === props.planId ? props.commercial : undefined)
const validLinks = computed(() => props.links?.planId === props.planId ? props.links.items : [])
const operationById = computed(() => new Map(props.model.tasks.filter(task => task.type === 'operation' && !task.blockKind).map(task => [task.id, task])))
function tasksFor(order: SavedPlanOrders['rows'][number]): ScheduleTask[] {
  const seen = new Set<string>()
  return order.taskRefs.flatMap(ref => {
    const task = operationById.value.get(ref.taskId)
    if (!task || task.orderId !== ref.orderId || task.operationId !== ref.operationId || ref.orderId !== order.orderId || seen.has(task.id)) return []
    seen.add(task.id)
    return [task]
  }).sort((a, b) => a.operationSequence - b.operationSequence)
}
interface Section { key: string; label: string; orders: SavedPlanOrders['rows']; target?: string; groupKey?: string }
const sections = computed<Section[]>(() => {
  const source = currentCommercial.value
  if (source?.state !== 'ready' || !source.groups.length) return [{ key: 'orders', label: '工单', orders: validOrders.value, target: undefined as string | undefined, groupKey: undefined as string | undefined }]
  const byId = new Map(validOrders.value.map(order => [order.orderId, order]))
  const assigned = new Set<string>()
  const grouped: Section[] = source.groups.map(group => {
    const orders = group.orderIds.flatMap(id => {
      const order = byId.get(id)
      if (!order) return []
      assigned.add(id)
      return [order]
    })
    return { key: group.key, label: group.label, orders, target: group.target, groupKey: group.key }
  })
  const remaining = validOrders.value.filter(order => !assigned.has(order.orderId))
  if (remaining.length) grouped.push({ key: 'ungrouped', label: '未提供关联分组的工单', orders: remaining, target: undefined, groupKey: undefined })
  return grouped
})
function linkTarget(orderId: string) {
  return validLinks.value.find(item => item.orderId === orderId)?.target
}
function progress(order: SavedPlanOrders['rows'][number]) {
  const value = order.progress
  if (!value || value.state === 'unknown') return '进度未知'
  if (value.state === 'forbidden') return '无权读取进度'
  if (value.state === 'unavailable') return '进度暂不可读取'
  if (value.state === 'known') return `${value.completed} / ${value.planned}`
  return '进度未知'
}
</script>

<template>
  <aside class="max-h-[34rem] overflow-y-auto rounded-lg border bg-card xl:w-[19rem] xl:flex-none" aria-label="计划工单与活动">
    <h3 class="sticky top-0 z-10 border-b bg-card px-4 py-3 text-base font-semibold">关联分组 · 工单 · 活动</h3>
    <p v-if="currentCommercial?.state === 'loading'" class="px-4 py-2 text-sm text-muted-foreground">正在读取关联分组</p>
    <p v-else-if="currentCommercial?.state === 'forbidden'" class="px-4 py-2 text-sm text-muted-foreground">无权读取关联分组</p>
    <p v-else-if="currentCommercial?.state === 'unavailable'" class="px-4 py-2 text-sm text-muted-foreground">关联分组暂不可读取</p>
    <p v-else-if="currentCommercial?.state === 'ready' && !currentCommercial.groups.length" class="px-4 py-2 text-sm text-muted-foreground">未关联分组</p>
    <p v-else-if="!currentCommercial" class="px-4 py-2 text-sm text-muted-foreground">关联分组未知</p>
    <section v-for="section in sections" :key="section.key" class="border-t p-3">
      <h4 class="mb-2 text-sm font-semibold">
        <SavedPlanWorkOrderLink
          v-if="section.groupKey"
          :label="section.label" :target="section.target" :navigate="navigate" action="group-link"
          :request="{ kind: 'group', planId, groupKey: section.groupKey }"
        />
        <span v-else>{{ section.label }}</span>
      </h4>
      <div v-for="order in section.orders" :key="order.orderId" class="mb-3 rounded-md border p-2 last:mb-0">
        <div class="flex flex-wrap items-baseline justify-between gap-1">
          <span class="font-medium">{{ order.label }}</span>
          <span v-if="order.statusLabel" class="text-xs text-muted-foreground">{{ order.statusLabel }}</span>
        </div>
        <p class="text-xs text-muted-foreground">进度 {{ progress(order) }}</p>
        <ul class="mt-2 space-y-1">
          <li v-for="task in tasksFor(order)" :key="task.id" :data-task-id="task.id" class="flex items-center justify-between gap-2 rounded px-1" :class="task.id === selectedTaskId ? 'bg-primary/10' : ''">
            <button type="button" class="min-w-0 truncate text-left text-sm hover:underline" :aria-pressed="task.id === selectedTaskId" @click="emit('select', task.id)">{{ task.text }}</button>
            <SavedPlanWorkOrderLink :label="'打开工单'" :target="linkTarget(order.orderId)" :navigate="navigate" action="task-link" :request="{ kind: 'task', planId, taskId: task.id, orderId: order.orderId }" />
          </li>
        </ul>
      </div>
    </section>
  </aside>
</template>
