<script setup lang="ts">
import type { DraftTaskFeedback } from '../../model/types'
import { scheduleTime } from '../../model/factory-time'
defineProps<{ feedback?: DraftTaskFeedback; timezone?: string }>()
</script>
<template>
  <div class="grid gap-1 p-2 text-sm" data-testid="draft-operation-feedback">
    <p class="font-medium">草案即时反馈</p>
    <p v-if="!feedback" class="text-muted-foreground">尚未提供校验反馈。</p>
    <template v-else>
      <p v-if="!feedback.issues.length" class="text-muted-foreground">未记录待核对问题。</p>
      <ul v-else class="grid gap-1">
        <li
          v-for="(issue, index) in feedback.issues"
          :key="index"
          :class="issue.kind === 'unknown' ? 'text-muted-foreground' : 'text-warning'"
        >
          {{ issue.message
          }}<span v-if="issue.startUtc && issue.endUtc" class="block tabular-nums"
            >{{ scheduleTime(issue.startUtc, timezone) }} 至
            {{ scheduleTime(issue.endUtc, timezone) }}</span
          >
        </li>
      </ul>
      <p v-if="feedback.due">
        交期差 ·
        {{
          feedback.due.status === 'onTime'
            ? '按期'
            : Number.isFinite(feedback.due.deltaMinutes)
              ? `${feedback.due.status === 'early' ? '提前' : '延期'} ${Math.round(Math.abs(feedback.due.deltaMinutes))} 分钟`
              : '未知'
        }}<span class="block">方案交期 · {{ scheduleTime(feedback.due.dueUtc, timezone) }}</span>
      </p>
      <p v-else class="text-muted-foreground">未记录可核对的交期。</p>
    </template>
  </div>
</template>
