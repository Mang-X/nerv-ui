<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, useId } from 'vue'
import { styles } from './Sparkline.styles'

/**
 * 迷你折线。少于两个点时不画。折线用 non-scaling-stroke，无论容器怎么拉伸都是细线。
 * 纯展示，`aria-hidden`——数据含义应由调用方在旁边用文字给出。
 */
const props = withDefaults(
  defineProps<{
    data?: number[]
    /** 折线下方是否填一层渐隐面积。 */
    area?: boolean
    /** 线条颜色；默认用大屏强调色。 */
    color?: string
  }>(),
  { area: false, data: () => [8, 11, 9, 14, 12, 17, 15, 21, 19, 24, 22, 28] },
)

const W = 240
const H = 56

const geom = computed(() => {
  const d = props.data
  if (!d || d.length < 2) return null
  const min = Math.min(...d)
  const max = Math.max(...d)
  const span = max - min || 1
  // 两个方向相反的有限极值相减会溢出，只有这种情形才改成先各自减半再算比例，
  // 普通值与相邻/次正规值的结果不变。
  const ratio = Number.isFinite(span)
    ? (v: number) => (v - min) / span
    : (v: number) => (v / 2 - min / 2) / (max / 2 - min / 2)
  const stepX = W / (d.length - 1)
  const y = (v: number) => 6 + (1 - ratio(v)) * (H - 12)
  const pts = d.map((v, i) => `${(i * stepX).toFixed(1)} ${y(v).toFixed(1)}`)
  return {
    line: `M${pts.join(' L')}`,
    areaD: `M${pts.join(' L')} L${W} ${H} L0 ${H} Z`,
    lastX: (d.length - 1) * stepX,
    lastY: y(d[d.length - 1]),
  }
})

const uid = useId()
const sx = computed(() => ({
  root: stylex.props(props.color ? null : styles.root),
  line: stylex.props(styles.line),
  dot: stylex.props(styles.dot),
}))
</script>

<template>
  <svg
    v-if="geom"
    :class="sx.root.className"
    :style="[sx.root.style, props.color ? { stroke: props.color } : undefined]"
    :viewBox="`0 0 ${W} ${H}`"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs v-if="props.area">
      <linearGradient :id="`${uid}-fill`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="props.color ?? 'currentColor'" stop-opacity="0.16" />
        <stop offset="1" :stop-color="props.color ?? 'currentColor'" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path v-if="props.area" :d="geom.areaD" :fill="`url(#${uid}-fill)`" stroke="none" />
    <path :d="geom.line" :class="sx.line.className" :style="sx.line.style" />
    <circle :cx="geom.lastX" :cy="geom.lastY" r="2.5" :class="sx.dot.className" :style="sx.dot.style" />
  </svg>
</template>
