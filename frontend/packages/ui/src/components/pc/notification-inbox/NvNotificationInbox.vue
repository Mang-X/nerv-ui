<script setup lang="ts">
import { computed, useId } from 'vue'
import NvButton from '../button/NvButton.vue'
import NvStatusBadge from '../status/NvStatusBadge.vue'
import type { NvNotificationItem } from './types'
const props = withDefaults(
  defineProps<{
    title: string
    items?: readonly NvNotificationItem[]
    selectedKey?: string | null
    filter?: string
    filters?: readonly { value: string; label: string }[]
    loading?: boolean
    pendingKeys?: readonly string[]
    error?: string
    emptyText?: string
    missingText?: string
    loadingText?: string
    filterLabel?: string
  }>(),
  {
    emptyText: '暂无通知。',
    missingText: '尚未提供通知。',
    loadingText: '正在加载通知…',
    filterLabel: '通知类型',
  },
)
const emit = defineEmits<{
  'update:selectedKey': [key: string | null]
  'update:filter': [value: string]
  open: [item: NvNotificationItem]
  markRead: [item: NvNotificationItem]
  refresh: []
}>()
defineSlots<{
  meta(props: { item: NvNotificationItem }): unknown
  action(props: { item: NvNotificationItem; pending: boolean }): unknown
  detail(props: { item: NvNotificationItem; pending: boolean }): unknown
  filter(props: { value: string | undefined; change: (value: string) => void }): unknown
}>()
const heading = useId()
const selected = computed(() => props.items?.find((item) => item.key === props.selectedKey))
const pending = (item: NvNotificationItem) =>
  !!props.loading || !!props.pendingKeys?.includes(item.key)
function open(item: NvNotificationItem) {
  emit('update:selectedKey', item.key)
  emit('open', item)
}
function change(value: string) {
  emit('update:filter', value)
}
function changeFilter(event: Event) {
  const target = event.target as HTMLSelectElement
  change(target.value)
  target.value = props.filter ?? ''
}
</script>
<template>
  <section
    data-slot="nv-notification-inbox"
    class="grid min-w-0 gap-4"
    :aria-labelledby="heading"
    :aria-busy="loading || undefined"
  >
    <header class="flex flex-wrap items-center justify-between gap-3">
      <h2 :id="heading" class="text-sm font-semibold">{{ title }}</h2>
      <NvButton
        data-refresh
        variant="outline"
        size="sm"
        :disabled="loading"
        @click="emit('refresh')"
        >刷新</NvButton
      >
    </header>
    <slot name="filter" :value="filter" :change="change">
      <label v-if="filters" class="grid gap-1 text-sm"
        >{{ filterLabel }}
        <select
          class="h-9 rounded-md border bg-background px-3"
          :value="filter ?? ''"
          @change="changeFilter"
        >
          <option v-for="option in filters" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </slot>
    <p v-if="error" role="alert" class="break-anywhere text-sm text-destructive">{{ error }}</p>
    <p v-if="loading" role="status" class="p-4 text-sm text-muted-foreground">{{ loadingText }}</p>
    <template v-else>
      <section
        v-if="selected"
        data-detail
        aria-label="通知详情"
        class="grid min-w-0 gap-3 rounded-lg border bg-card p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <h3 class="break-anywhere text-sm font-semibold">{{ selected.title }}</h3>
          <NvButton variant="ghost" size="sm" @click="emit('update:selectedKey', null)"
            >收起详情</NvButton
          >
        </div>
        <slot name="detail" :item="selected" :pending="pending(selected)">
          <p class="whitespace-pre-wrap break-anywhere text-sm">{{ selected.summary }}</p>
          <p v-if="selected.meta" class="break-anywhere text-sm text-muted-foreground">
            {{ selected.meta }}
          </p>
          <p v-if="selected.code" class="break-anywhere font-mono text-xs">{{ selected.code }}</p>
        </slot>
        <NvButton
          v-if="selected.read === false"
          data-mark
          size="sm"
          :disabled="pending(selected)"
          @click="emit('markRead', selected)"
          >标记已读</NvButton
        >
      </section>
      <ul
        v-if="items?.length"
        class="m-0 list-none divide-y overflow-hidden rounded-lg border bg-card p-0"
      >
        <li v-for="item in items" :key="item.key" class="grid min-w-0 gap-2 p-4">
          <div class="flex items-start justify-between gap-3">
            <button
              data-open
              type="button"
              class="break-anywhere rounded-sm text-left text-sm font-semibold underline-offset-4 outline-none hover:underline focus-visible:ring-1 focus-visible:ring-brand"
              :aria-current="selectedKey === item.key ? 'true' : undefined"
              @click="open(item)"
            >
              {{ item.title }}
            </button>
            <span v-if="item.read !== undefined" class="shrink-0 text-xs text-muted-foreground">{{
              item.read ? '已读' : '未读'
            }}</span>
          </div>
          <p
            v-if="item.summary"
            class="whitespace-pre-wrap break-anywhere text-sm text-muted-foreground"
          >
            {{ item.summary }}
          </p>
          <p v-if="item.code" class="break-anywhere font-mono text-xs">{{ item.code }}</p>
          <div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <NvStatusBadge
              v-for="(status, index) in item.statuses"
              :key="index"
              :label="status.label"
              :tone="status.tone"
            />
            <slot name="meta" :item="item">{{ item.meta }}</slot>
          </div>
          <div class="flex flex-wrap gap-2">
            <NvButton
              v-if="item.read === false"
              data-mark
              variant="ghost"
              size="sm"
              :aria-label="`标记已读：${item.title}`"
              :disabled="pending(item)"
              @click="emit('markRead', item)"
              >标记已读</NvButton
            >
            <slot name="action" :item="item" :pending="pending(item)" />
          </div>
        </li>
      </ul>
      <p v-else-if="!error" class="p-4 text-sm text-muted-foreground">
        {{ items === undefined ? missingText : emptyText }}
      </p>
    </template>
  </section>
</template>
