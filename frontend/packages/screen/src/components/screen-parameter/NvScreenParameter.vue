<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, ref, watch } from 'vue'
import NvScreenSparkline from '../screen-sparkline/NvScreenSparkline.vue'
import { styles } from './Parameter.styles'

/**
 * 大屏指标卡：标题、当前值、可选区间说明，加一条可取样折线。
 *
 * 取样交互（指针移动显示光标、方向键/Home/End 取值）是这里的**数据读取**行为，
 * ui-sdk 没有对应原语（它不是「一个控件的值」而是「读一段序列里的某一格」），
 * 所以保留手写；但焦点、hint 与状态播报都按无障碍约定写足。
 */
const props = defineProps<{
  label: string
  value: number | null
  unit?: string
  range?: string
  samples: number[]
  sampleLabels?: string[]
  color?: string
}>()

const index = ref<number | null>(null)

watch(
  () => [props.samples, props.sampleLabels, props.label, props.value, props.unit, props.range],
  () => {
    index.value = null
  },
  { deep: true, flush: 'sync' },
)

const series = computed(() => (props.samples.every(Number.isFinite) ? props.samples : []))

const selected = computed(() => {
  if (index.value === null) return null
  const i = index.value
  return {
    value: props.samples[i],
    label: props.sampleLabels?.[i] ?? `${i + 1} / ${props.samples.length}`,
    percent: props.samples.length === 1 ? 50 : (i / (props.samples.length - 1)) * 100,
  }
})

function format(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: 3 })
    : '—'
}

function point(event: PointerEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  if (!props.samples.length || !Number.isFinite(rect.width) || rect.width <= 0) {
    index.value = null
    return
  }
  index.value = Math.max(
    0,
    Math.min(
      props.samples.length - 1,
      Math.round(((event.clientX - rect.left) / rect.width) * (props.samples.length - 1)),
    ),
  )
}

function key(event: KeyboardEvent) {
  if (!props.samples.length || !['Home', 'End', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    return
  }
  event.preventDefault()
  const last = props.samples.length - 1
  index.value =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? last
        : Math.max(0, Math.min(last, (index.value ?? 0) + (event.key === 'ArrowLeft' ? -1 : 1)))
}

const sx = computed(() => ({
  root: stylex.props(styles.root),
  header: stylex.props(styles.header),
  label: stylex.props(styles.label),
  value: stylex.props(styles.value),
  unit: stylex.props(styles.unit),
  range: stylex.props(styles.range),
  plot: stylex.props(styles.plot),
  cursor: stylex.props(styles.cursor),
  sample: stylex.props(styles.sample),
}))
</script>

<template>
  <section :class="sx.root.className" :style="sx.root.style" data-slot="nv-screen-parameter" :aria-label="label">
    <header :class="sx.header.className" :style="sx.header.style">
      <h4 :class="sx.label.className" :style="sx.label.style">{{ label }}</h4>
      <b :class="sx.value.className" :style="sx.value.style" data-current>{{ format(props.value) }}</b>
      <span v-if="unit" :class="sx.unit.className" :style="sx.unit.style">{{ unit }}</span>
    </header>
    <p v-if="range" :class="sx.range.className" :style="sx.range.style">{{ range }}</p>
    <div
      data-plot
      :class="sx.plot.className"
      :style="sx.plot.style"
      tabindex="0"
      role="group"
      :aria-label="`${label} 趋势，方向键取值，Home/End 首尾`"
      @pointermove="point"
      @pointerleave="index = null"
      @blur="index = null"
      @keydown="key"
    >
      <NvScreenSparkline :data="series" :color="color" area />
      <i v-if="selected" data-cursor :class="sx.cursor.className" :style="[sx.cursor.style, { left: `${selected.percent}%` }]" />
    </div>
    <p v-if="selected" data-sample role="status" :class="sx.sample.className" :style="sx.sample.style">
      <span>{{ selected.label }}</span><b>{{ format(selected.value) }}</b>
      <span v-if="unit">{{ unit }}</span>
    </p>
  </section>
</template>
