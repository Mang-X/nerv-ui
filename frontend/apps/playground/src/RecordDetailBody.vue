<script setup lang="ts">
import { NvStatusBadge } from '@nerv-ui/ui'
defineProps<{
  record: {
    id: string
    title: string
    status: string
    amount: number
    unit: string
    time: string
    note: string
  }
}>()
const time = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
</script>
<template>
  <section class="nv-detail-body space-y-4 text-sm">
    <h2 class="text-lg font-semibold">{{ record.title }}</h2>
    <dl class="grid grid-cols-2 gap-4">
      <dt>编号</dt>
      <dd class="font-mono text-xs text-muted-foreground">{{ record.id }}</dd>
      <dt>状态</dt>
      <dd><NvStatusBadge tone="success" :label="record.status" /></dd>
      <dt>记录时间</dt>
      <dd>{{ time(record.time) }}</dd>
      <dt>记录量</dt>
      <dd class="text-right tabular-nums">
        {{ record.amount.toLocaleString(undefined, { maximumFractionDigits: 3 }) }}
        <span class="text-muted-foreground">{{ record.unit }}</span>
      </dd>
    </dl>
    <p class="whitespace-pre-wrap break-words leading-relaxed">{{ record.note }}</p>
  </section>
</template>
