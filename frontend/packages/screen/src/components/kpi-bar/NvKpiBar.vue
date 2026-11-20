<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './KpiBar.styles'
import type { KpiBarSize, KpiItem, KpiTrend } from './types'

const props = withDefaults(
  defineProps<{
    items: KpiItem[]
    size?: KpiBarSize
    ariaLabel?: string
  }>(),
  { size: 'md', ariaLabel: '关键指标' },
)

const rootSx = computed(() => stylex.props(styles.root))

const toneStyles = {
  accent: styles.toneAccent,
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
} as const

const trendStyles = {
  up: styles.trendUp,
  down: styles.trendDown,
  flat: styles.trendFlat,
} as const

const trendGlyphs: Record<KpiTrend, string> = { up: '▲', down: '▼', flat: '—' }

function itemSx() {
  return stylex.props(styles.item, props.size === 'lg' ? styles.lgItem : styles.mdItem)
}

function toneStyle(item: KpiItem) {
  const tone = item.tone
  if (!tone || tone === 'default') return null
  return toneStyles[tone]
}

function valueSx(item: KpiItem) {
  return stylex.props(styles.value, toneStyle(item))
}

function trendSx(trend: KpiTrend) {
  return stylex.props(styles.trend, trendStyles[trend])
}
</script>

<template>
  <div role="list" :aria-label="ariaLabel" :class="rootSx.className" :style="rootSx.style">
    <div
      v-for="(item, index) in items"
      :key="`${item.label}-${index}`"
      role="listitem"
      :class="itemSx().className"
      :style="itemSx().style"
    >
      <slot name="item" :item="item" :index="index">
        <span :class="stylex.props(styles.label).className">{{ item.label }}</span>
        <span :class="stylex.props(styles.valueRow).className">
          <span :class="valueSx(item).className" :style="valueSx(item).style">{{ item.value }}</span>
          <span v-if="item.unit" :class="stylex.props(styles.unit).className">{{ item.unit }}</span>
          <span
            v-if="item.trend"
            :class="trendSx(item.trend).className"
            :style="trendSx(item.trend).style"
            :aria-label="item.trend === 'up' ? '上升' : item.trend === 'down' ? '下降' : '持平'"
          >
            {{ trendGlyphs[item.trend] }}
          </span>
        </span>
        <span v-if="item.hint" :class="stylex.props(styles.hint).className">{{ item.hint }}</span>
      </slot>
    </div>
  </div>
</template>
