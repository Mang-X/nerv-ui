<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Donut.styles'
import type { ScreenDonutSegment } from './types'

/**
 * 环形占比图。发丝底环加语义色弧段（段间留缝），中心 slot 放主数字，
 * 右侧是内置图例。纯展示——每段的名称与数值在图例中以文字给出，
 * 不靠颜色单独承载信息。
 */
const props = withDefaults(
  defineProps<{
    segments: ScreenDonutSegment[]
    size?: number
    thickness?: number
    /** 右侧内置图例；关掉后自行排版。 */
    legend?: boolean
  }>(),
  { size: 118, thickness: 11, legend: true },
)

const R = 52
const C = 2 * Math.PI * R
/** 段间缝（弧长 px）。 */
const GAP = 2.5

// 先按峰值归一化再求和：直接相加时有限值也可能溢出。
const peak = computed(() => props.segments.reduce((n, s) => Math.max(n, s.value), 0))
const total = computed(() =>
  peak.value > 0 ? props.segments.reduce((n, s) => n + s.value / peak.value, 0) : 0,
)

const arcs = computed(() => {
  let acc = 0
  const visible = props.segments.filter((s) => s.value > 0)
  return props.segments.map((s) => {
    const frac = total.value > 0 ? s.value / peak.value / total.value : 0
    const len = Math.max(0, frac * C - (visible.length > 1 ? GAP : 0))
    const arc = { ...s, len, offset: -acc * C }
    acc += frac
    return arc
  })
})

const sx = computed(() => ({
  root: stylex.props(styles.root),
  ring: stylex.props(styles.ring),
  centerSlot: stylex.props(styles.centerSlot),
  swatch: stylex.props(styles.swatch),
  figure: stylex.props(styles.figure),
  legend: stylex.props(styles.legend),
  legendRow: stylex.props(styles.legendRow),
  legendLabel: stylex.props(styles.legendLabel),
  legendValue: stylex.props(styles.legendValue),
}))
</script>

<template>
  <div :class="sx.root.className" :style="sx.root.style">
    <div :class="sx.figure.className" :style="[sx.figure.style, { width: size, height: size }]">
      <svg :viewBox="`0 0 120 120`" :width="size" :height="size" aria-hidden="true">
        <circle cx="60" cy="60" :r="R" :stroke-width="thickness" :class="sx.ring.className" :style="sx.ring.style" />
        <circle
          v-for="(a, i) in arcs"
          :key="i"
          cx="60"
          cy="60"
          :r="R"
          :stroke="a.color"
          :stroke-dasharray="`${a.len} ${C - a.len}`"
          :stroke-dashoffset="a.offset"
          fill="none"
          :stroke-width="thickness"
        />
      </svg>
      <div :class="sx.centerSlot.className" :style="sx.centerSlot.style">
        <slot name="center" />
      </div>
    </div>
    <div v-if="legend" :class="sx.legend.className" :style="sx.legend.style">
      <div v-for="(s, i) in segments" :key="i" :class="sx.legendRow.className" :style="sx.legendRow.style">
        <span :class="sx.swatch.className" :style="[sx.swatch.style, { backgroundColor: s.color }]" aria-hidden="true" />
        <span :class="sx.legendLabel.className" :style="sx.legendLabel.style">{{ s.label }}</span>
        <span :class="sx.legendValue.className" :style="sx.legendValue.style">{{ s.value }}</span>
      </div>
    </div>
    <slot />
  </div>
</template>
