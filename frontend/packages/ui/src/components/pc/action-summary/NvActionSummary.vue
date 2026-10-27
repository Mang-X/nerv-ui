<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { AlertTriangleIcon, ArrowRightIcon, PlugZapIcon, RefreshCwIcon } from '@lucide/vue'
import { cn } from '../../../lib/utils'
import NvButton from '../button/NvButton.vue'
import NvCard from '../card/NvCard.vue'
import Skeleton from '../../ui/skeleton/Skeleton.vue'

export type NvActionSummaryState = 'pending' | 'error' | 'unavailable' | 'data' | 'empty'
export type NvActionSummaryTone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral'
export interface NvActionSummaryItem {
  key: string | number
  primary: string
  secondary: string
}

const props = withDefaults(
  defineProps<{
    title: string
    description: string
    icon: Component
    state: NvActionSummaryState
    count?: number | null
    unit?: string
    tone?: NvActionSummaryTone
    badge?: string
    items?: readonly NvActionSummaryItem[]
    emptyTitle: string
    emptyHint: string
    errorTitle: string
    errorHint: string
    unavailableTitle: string
    unavailableHint: string
    retryLabel?: string
    actionLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { tone: 'brand', items: () => [], retryLabel: '重试' },
)

const emit = defineEmits<{ retry: []; action: [] }>()

const toneTint: Record<NvActionSummaryTone, string> = {
  brand: 'bg-brand/10 text-brand-strong',
  success: 'bg-success/10 text-success-strong',
  warning: 'bg-warning/15 text-warning-strong',
  danger: 'bg-destructive/10 text-destructive-strong',
  neutral: 'bg-muted text-muted-foreground',
}
const toneText: Record<NvActionSummaryTone, string> = {
  brand: 'text-brand-strong',
  success: 'text-success-strong',
  warning: 'text-warning-strong',
  danger: 'text-destructive-strong',
  neutral: 'text-muted-foreground',
}
const trusted = computed(() => props.state === 'data' || props.state === 'empty')
const visibleItems = computed(() => (props.state === 'data' ? props.items.slice(0, 4) : []))
const readout = computed(() =>
  trusted.value &&
  typeof props.count === 'number' &&
  Number.isSafeInteger(props.count) &&
  props.count >= 0
    ? String(props.count)
    : '—',
)
</script>

<template>
  <NvCard
    data-slot="nv-action-summary"
    :data-state="state"
    :class="cn('h-[19rem] min-w-0 gap-0 overflow-hidden p-0', props.class)"
  >
    <div class="flex items-start gap-3 px-5 pt-5">
      <span :class="cn('grid size-10 flex-none place-items-center rounded-[10px]', toneTint[tone])">
        <component :is="icon" class="size-5" aria-hidden="true" />
      </span>
      <div class="min-w-0 flex-1">
        <div class="flex items-baseline gap-2">
          <h2 class="truncate text-sm font-semibold text-foreground">{{ title }}</h2>
          <span
            v-if="badge && trusted"
            :class="cn('shrink-0 text-xs font-semibold', toneText[tone])"
            >{{ badge }}</span
          >
        </div>
        <p class="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{{ description }}</p>
      </div>
      <Skeleton
        v-if="state === 'pending'"
        class="h-7 w-12 shrink-0 rounded-md"
        aria-hidden="true"
      />
      <p
        v-else
        data-slot="nv-action-summary-count"
        class="shrink-0 text-3xl font-semibold leading-none tabular-nums tracking-tight"
        :class="readout === '—' && 'text-muted-foreground'"
        :aria-label="readout === '—' ? '数据不可用' : undefined"
      >
        {{ readout
        }}<span
          v-if="readout !== '—' && unit"
          class="ml-0.5 text-sm font-medium text-muted-foreground"
          >{{ unit }}</span
        >
      </p>
    </div>

    <div class="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto border-t">
      <ul v-if="state === 'pending'" class="flex flex-col divide-y" aria-hidden="true">
        <li v-for="row in 3" :key="row" class="flex items-center justify-between gap-3 px-5 py-3">
          <Skeleton class="h-4 w-32 rounded" />
          <Skeleton class="h-3 w-20 rounded" />
        </li>
      </ul>

      <div
        v-else-if="state === 'error'"
        class="flex min-h-0 flex-1 flex-col items-center gap-1 px-6 py-2 text-center"
        role="alert"
      >
        <div class="flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-y-auto">
          <span
            class="mt-auto grid size-10 shrink-0 place-items-center rounded-full bg-destructive/10"
            ><AlertTriangleIcon class="size-5 text-destructive-strong" aria-hidden="true"
          /></span>
          <p class="shrink-0 text-sm font-medium text-destructive-strong">{{ errorTitle }}</p>
          <p class="mb-auto shrink-0 text-sm leading-6 text-muted-foreground">{{ errorHint }}</p>
        </div>
        <NvButton size="sm" type="button" variant="outline" class="shrink-0" @click="emit('retry')"
          ><RefreshCwIcon aria-hidden="true" />{{ retryLabel }}</NvButton
        >
      </div>

      <div
        v-else-if="state === 'unavailable'"
        class="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-4 text-center"
        role="alert"
      >
        <span class="grid size-10 shrink-0 place-items-center rounded-full bg-muted"
          ><PlugZapIcon class="size-5 text-muted-foreground" aria-hidden="true"
        /></span>
        <p class="text-sm font-medium text-foreground">{{ unavailableTitle }}</p>
        <p class="text-sm leading-6 text-muted-foreground">{{ unavailableHint }}</p>
      </div>

      <ul
        v-else-if="state === 'data' && visibleItems.length"
        class="flex shrink-0 flex-col divide-y"
      >
        <li
          v-for="item in visibleItems"
          :key="item.key"
          data-slot="nv-action-summary-item"
          class="flex min-w-0 items-baseline justify-between gap-3 px-5 py-2.5"
        >
          <span class="min-w-0 truncate text-sm font-medium text-foreground">{{
            item.primary
          }}</span>
          <span class="max-w-[45%] shrink-0 truncate text-xs tabular-nums text-muted-foreground">{{
            item.secondary
          }}</span>
        </li>
      </ul>

      <div
        v-else-if="state === 'data'"
        class="flex flex-1 items-center justify-center px-6 py-4 text-center"
      >
        <p class="text-sm text-muted-foreground">暂无最近预览</p>
      </div>

      <div
        v-else
        class="flex flex-1 flex-col items-center justify-center gap-1 px-6 py-4 text-center"
      >
        <p class="text-sm font-medium text-foreground">{{ emptyTitle }}</p>
        <p class="line-clamp-2 text-sm leading-6 text-muted-foreground">{{ emptyHint }}</p>
      </div>
    </div>

    <button
      v-if="actionLabel"
      type="button"
      :aria-label="actionLabel"
      class="group flex w-full shrink-0 items-center justify-between gap-2 border-t px-5 py-3 text-left text-sm font-medium text-brand-strong transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      @click="emit('action')"
    >
      <span class="truncate">{{ actionLabel }}</span>
      <ArrowRightIcon
        class="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </button>
  </NvCard>
</template>
