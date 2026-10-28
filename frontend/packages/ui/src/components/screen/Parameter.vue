<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Sparkline from './Sparkline.vue'
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
const selected = computed(() =>
  index.value === null
    ? null
    : {
        value: props.samples[index.value],
        label: props.sampleLabels?.[index.value] ?? `${index.value + 1} / ${props.samples.length}`,
        percent: props.samples.length === 1 ? 50 : (index.value / (props.samples.length - 1)) * 100,
      },
)
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
  if (!props.samples.length || !['Home', 'End', 'ArrowLeft', 'ArrowRight'].includes(event.key))
    return
  event.preventDefault()
  index.value =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? props.samples.length - 1
        : Math.max(
            0,
            Math.min(
              props.samples.length - 1,
              (index.value ?? 0) + (event.key === 'ArrowLeft' ? -1 : 1),
            ),
          )
}
</script>
<template>
  <section class="nv-scr-parameter text-sm" data-slot="nv-screen-parameter" :aria-label="label">
    <header class="flex flex-wrap items-baseline gap-2">
      <h4 class="min-w-0 flex-1 break-words font-medium">{{ label }}</h4>
      <b data-current class="text-right text-lg tabular-nums">{{ format(value) }}</b>
      <span v-if="unit">{{ unit }}</span>
    </header>
    <p v-if="range" class="break-words">{{ range }}</p>
    <div
      data-plot
      class="nv-scr-parameter-plot"
      tabindex="0"
      role="group"
      :aria-label="`${label}趋势，方向键取值，Home/End 首尾`"
      @pointermove="point"
      @pointerleave="index = null"
      @blur="index = null"
      @keydown="key"
    >
      <Sparkline :data="series" :color="color" area />
      <i
        v-if="selected"
        data-cursor
        class="nv-scr-parameter-cursor"
        :style="{ left: `${selected.percent}%` }"
      />
    </div>
    <p
      v-if="selected"
      data-sample
      role="status"
      class="flex flex-wrap justify-end gap-2 text-right tabular-nums"
    >
      <span>{{ selected.label }}</span
      ><b>{{ format(selected.value) }}</b
      ><span v-if="unit">{{ unit }}</span>
    </p>
  </section>
</template>
<style scoped>
@layer nv-components {
  .nv-scr-parameter {
    padding: 14px;
    border: 1px solid var(--nv-scr-line-2);
    border-radius: var(--nv-scr-radius);
    background: var(--nv-scr-panel-b);
    color: var(--nv-scr-text);
    overflow-wrap: anywhere;
  }
  .nv-scr-parameter p {
    color: var(--nv-scr-muted);
  }
  .nv-scr-parameter-plot {
    position: relative;
    height: 68px;
    margin-block: 12px;
  }
  .nv-scr-parameter-plot:focus-visible {
    outline: 2px solid var(--nv-scr-cyan);
    outline-offset: 4px;
  }
  .nv-scr-parameter-cursor {
    position: absolute;
    inset-block: 0;
    width: 1px;
    background: var(--nv-scr-text);
    pointer-events: none;
  }
}
</style>
