<script setup lang="ts">
import { scheduleTime } from '../../model/factory-time'
import type { SchedulingDayEntry } from './types'

defineProps<{
  entries: readonly SchedulingDayEntry[]
  date: string
  groupLabel: string
  timezone: string
  title: string
  planLabel?: string
  statusLabel?: string
}>()

function time(value: string, timezone: string) {
  return scheduleTime(value, timezone, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
function quantity(value: number | null | undefined, unit?: string) {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${value.toLocaleString('zh-CN', { maximumFractionDigits: 3 })}${unit ? ` ${unit}` : ''}`
}
</script>

<template>
  <article class="nv-day-sheet" data-day-sheet>
    <header class="nv-day-sheet-header">
      <h2>{{ title }}</h2>
      <p>{{ date }} · {{ groupLabel }} · {{ timezone || '时区未解析' }}</p>
      <p v-if="planLabel || statusLabel">{{ planLabel || '—' }} · {{ statusLabel || '—' }}</p>
    </header>
    <p v-if="entries.length === 0" role="status">该日与所选分组没有安排。</p>
    <table v-else>
      <thead>
        <tr>
          <th scope="col">活动</th>
          <th scope="col">分组 / 资源</th>
          <th scope="col">起止时间</th>
          <th scope="col" class="nv-day-number">数量</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="entry in entries"
          :key="JSON.stringify([entry.semanticKey, entry.assignmentId])"
          :data-semantic-key="entry.semanticKey"
          :data-assignment-id="entry.assignmentId"
        >
          <td>
            <strong>{{ entry.label }}</strong
            ><small v-if="entry.orderLabel || entry.operationLabel"
              >{{ entry.orderLabel || '—' }} · {{ entry.operationLabel || '—'
              }}<span v-if="entry.operationSequence != null">
                · 第 {{ entry.operationSequence }} 道</span
              ></small
            >
          </td>
          <td>
            {{ entry.groupLabel }}<small>{{ entry.resourceLabel || '—' }}</small>
          </td>
          <td>
            <template v-if="entry.segments?.length"
              ><p v-for="(segment, index) in entry.segments" :key="index">
                <time :datetime="segment.startUtc">{{ time(segment.startUtc, timezone) }}</time> 至
                <time :datetime="segment.endUtc">{{ time(segment.endUtc, timezone) }}</time>
              </p></template
            >
            <p v-else>
              <time :datetime="entry.startUtc">{{ time(entry.startUtc, timezone) }}</time> 至
              <time :datetime="entry.endUtc">{{ time(entry.endUtc, timezone) }}</time>
            </p>
          </td>
          <td class="nv-day-number">{{ quantity(entry.quantity, entry.unit) }}</td>
        </tr>
      </tbody>
    </table>
  </article>
</template>
