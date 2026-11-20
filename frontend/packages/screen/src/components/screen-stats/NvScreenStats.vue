<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './ScreenStats.styles'
import type { ScreenStatItem, ScreenStatTone, ScreenStatsSize } from './types'

const props = withDefaults(
  defineProps<{
    items: ScreenStatItem[]
    size?: ScreenStatsSize
    /** Fixed column count; omit to auto-fit based on item count. */
    columns?: number
    ariaLabel?: string
  }>(),
  { size: 'md', ariaLabel: '统计条' },
)

const toneStyles: Record<ScreenStatTone, stylex.StyleXStyles | null> = {
  default: null,
  accent: styles.accent,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
}

const rootSx = computed(() => stylex.props(styles.root))

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${
    Number.isInteger(props.columns) && (props.columns ?? 0) > 0
      ? props.columns
      : Math.max(1, props.items.length)
  }, minmax(0, 1fr))`,
}))

function itemSx(index: number) {
  return stylex.props(styles.item, props.size === 'lg' ? styles.lg : styles.md, index > 0 && styles.itemDivider)
}

function valueSx(item: ScreenStatItem) {
  return stylex.props(
    styles.value,
    props.size === 'lg' && styles.lgValue,
    toneStyles[item.tone ?? 'default'],
  )
}
</script>

<template>
  <div
    role="list"
    :aria-label="ariaLabel"
    :class="rootSx.className"
    :style="[rootSx.style, gridStyle]"
  >
    <div
      v-for="(item, index) in items"
      :key="item.key ?? `${item.label}-${index}`"
      role="listitem"
      :class="itemSx(index).className"
      :style="itemSx(index).style"
    >
      <span :class="stylex.props(styles.label).className">{{ item.label }}</span>
      <span :class="stylex.props(styles.valueRow).className">
        <span :class="valueSx(item).className" :style="valueSx(item).style">{{ item.value }}</span>
        <span v-if="item.unit" :class="stylex.props(styles.unit).className">{{ item.unit }}</span>
      </span>
      <span v-if="item.hint" :class="stylex.props(styles.hint).className">{{ item.hint }}</span>
    </div>
  </div>
</template>
