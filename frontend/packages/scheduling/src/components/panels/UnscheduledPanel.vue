<script setup lang="ts">
import {
  NvButton,
  Empty,
  EmptyDescription,
  EmptyTitle,
  NvStatusBadge,
  ScrollArea,
} from '@nerv-iip/ui'
import { conflictReasonLabel } from '../../model/labels'
import type { UnscheduledItem } from '../../model/types'

defineProps<{
  items: UnscheduledItem[]
  readOnly?: boolean
  labels?: { title?: string; emptyTitle?: string; emptyDescription?: string }
}>()
defineEmits<{ fix: [orderId: string, operationId: string] }>()
</script>

<template>
  <section class="flex h-full flex-col" aria-label="未排产">
    <header class="flex items-center justify-between px-3 py-2">
      <h3 class="text-sm font-semibold text-foreground">{{ labels?.title ?? '未排产工序' }}</h3>
      <span class="text-sm text-muted-foreground">{{ items.length }} 项</span>
    </header>
    <Empty v-if="!items.length" class="py-8">
      <EmptyTitle>{{ labels?.emptyTitle ?? '全部已排产' }}</EmptyTitle>
      <EmptyDescription>{{
        labels?.emptyDescription ?? '当前未提供待安排记录。'
      }}</EmptyDescription>
    </Empty>
    <ScrollArea v-else class="flex-1">
      <ul class="flex flex-col gap-1 p-2">
        <li
          v-for="item in items"
          :key="`${item.orderId}:${item.operationId}`"
          class="flex flex-col gap-1 rounded-md border border-border bg-card px-3 py-2"
        >
          <span class="flex items-center gap-2">
            <NvStatusBadge
              tone="warning"
              :label="item.reasonLabel ?? conflictReasonLabel[item.reason]"
            />
            <span class="truncate text-sm text-muted-foreground">{{
              item.groupLabel ?? item.orderId
            }}</span>
          </span>
          <span v-if="item.label" class="text-sm font-medium">{{ item.label }}</span>
          <span class="text-sm text-foreground">{{ item.message }}</span>
          <NvButton
            size="sm"
            variant="outline"
            class="mt-1 self-start"
            :disabled="readOnly || !!item.actionDisabledReason"
            :title="readOnly ? '当前为只读' : item.actionDisabledReason"
            @click="$emit('fix', item.orderId, item.operationId)"
          >
            {{ item.actionLabel ?? '去处理' }}
          </NvButton>
          <span
            v-if="item.actionDisabledReason || readOnly"
            class="text-sm text-muted-foreground"
            >{{ readOnly ? '当前为只读' : item.actionDisabledReason }}</span
          >
        </li>
      </ul>
    </ScrollArea>
  </section>
</template>
