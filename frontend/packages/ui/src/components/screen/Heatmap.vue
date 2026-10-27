<script lang="ts">
// Match ScreenLayout: hydration-stable initially, page-local across roots after mount.
let nextHeatmapInstance = 0
</script>

<script setup lang="ts">
import { computed, onMounted, shallowRef, useId, watch } from 'vue'

export interface ScreenHeatmapCell {
  /** Unique and stable within this instance; labels may repeat. */
  key: string | number
  label: string
  value?: number | null
}
export interface ScreenHeatmapBand {
  label: string
  tone: 'cyan' | 'green' | 'amber' | 'red'
}
export interface ScreenHeatmapThreshold extends ScreenHeatmapBand {
  /** Inclusive lower bound. The next greater min is the exclusive upper bound. */
  min: number
}
const props = withDefaults(
  defineProps<{
    cells: readonly ScreenHeatmapCell[]
    thresholds: readonly ScreenHeatmapThreshold[]
    below: ScreenHeatmapBand
    columns?: number
    unit?: string
    unknownLabel?: string
    emptyLabel?: string
    axisStart?: string
    axisEnd?: string
  }>(),
  {
    columns: 6,
    unit: '',
    unknownLabel: '未知',
    emptyLabel: '暂无记录',
    axisStart: '',
    axisEnd: '',
  },
)
const tooltipId = shallowRef(`nv-scr-heatmap-${useId()}`)
onMounted(() => {
  tooltipId.value += `-${++nextHeatmapInstance}`
})
const focusedKey = shallowRef<string | number | null>(null)
const hoveredKey = shallowRef<string | number | null>(null)
const activeKey = computed(() => hoveredKey.value ?? focusedKey.value)
const active = computed(() => props.cells.find((cell) => cell.key === activeKey.value))
// A malformed scale is unknown as a whole: never guess which duplicate wins.
const ordered = computed(() => {
  const sorted = [...props.thresholds].sort((a, b) => a.min - b.min)
  return sorted.every(
    (entry, index) =>
      Number.isFinite(entry.min) && (index === 0 || entry.min > sorted[index - 1]!.min),
  )
    ? sorted
    : null
})
const gridColumns = computed(() =>
  Number.isInteger(props.columns) && props.columns > 0 ? props.columns : 6,
)
const quantity = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 3 })
function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
function display(value: unknown) {
  return finite(value) ? quantity.format(value) + props.unit : '—'
}
function band(value: unknown): ScreenHeatmapBand | null {
  if (!finite(value) || !ordered.value) return null
  return [...ordered.value].reverse().find((entry) => value >= entry.min) ?? props.below
}
function clearFocus(key: string | number) {
  if (focusedKey.value === key) focusedKey.value = null
}
function clearHover(key: string | number) {
  if (hoveredKey.value === key) hoveredKey.value = null
}
function dismiss() {
  focusedKey.value = null
  hoveredKey.value = null
}
watch(
  () => props.cells.map((cell) => cell.key),
  (keys) => {
    if (focusedKey.value !== null && !keys.includes(focusedKey.value)) focusedKey.value = null
    if (hoveredKey.value !== null && !keys.includes(hoveredKey.value)) hoveredKey.value = null
  },
  // Observe in-place removal before a later same-tick insertion reuses its key.
  { flush: 'sync' },
)
</script>

<template>
  <div class="nv-scr-heatmap" data-slot="nv-screen-heatmap">
    <ul class="nv-scr-heatmap-legend" aria-label="分档图例">
      <li v-for="entry in ordered ?? []" :key="entry.min" :class="`nv-scr-heatmap-${entry.tone}`">
        {{ entry.label }}
      </li>
      <li v-if="ordered" :class="`nv-scr-heatmap-${below.tone}`">{{ below.label }}</li>
      <li>{{ unknownLabel }}</li>
    </ul>
    <ul
      class="nv-scr-heatmap-grid"
      :style="{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }"
      aria-label="分档数值"
    >
      <li
        v-for="cell in cells"
        :key="cell.key"
        class="nv-scr-heatmap-cell"
        :class="`nv-scr-heatmap-${band(cell.value)?.tone ?? 'unknown'}`"
        data-heatmap-cell
        tabindex="0"
        :aria-describedby="active?.key === cell.key ? tooltipId : undefined"
        @mouseenter="hoveredKey = cell.key"
        @mouseleave="clearHover(cell.key)"
        @focus="focusedKey = cell.key"
        @blur="clearFocus(cell.key)"
        @keydown.esc="dismiss"
      >
        <span class="nv-scr-heatmap-readable"
          >{{ cell.label }} · <span data-cell-value>{{ display(cell.value) }}</span> ·
          <span data-cell-band>{{ band(cell.value)?.label ?? unknownLabel }}</span></span
        >
        <span v-if="!band(cell.value)" aria-hidden="true">—</span>
      </li>
    </ul>
    <p v-if="!cells.length" class="nv-scr-heatmap-empty" role="status">{{ emptyLabel }}</p>
    <div v-if="axisStart || axisEnd" class="nv-scr-heatmap-axis">
      <span>{{ axisStart }}</span
      ><span>{{ axisEnd }}</span>
    </div>
    <div v-if="active" :id="tooltipId" class="nv-scr-heatmap-tip" role="tooltip">
      {{ active.label }} · {{ display(active.value) }} ·
      {{ band(active.value)?.label ?? unknownLabel }}
    </div>
  </div>
</template>

<style scoped>
@layer nv-components {
  .nv-scr-heatmap {
    min-width: 0;
    color: var(--nv-scr-text);
    font-size: 18px;
  }
  .nv-scr-heatmap-legend,
  .nv-scr-heatmap-grid {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .nv-scr-heatmap-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
    color: var(--nv-scr-muted);
  }
  .nv-scr-heatmap-legend li {
    border-bottom: 4px solid var(--nv-scr-line-2);
    padding-bottom: 4px;
    overflow-wrap: anywhere;
  }
  .nv-scr-heatmap-grid {
    display: grid;
    gap: 6px;
  }
  .nv-scr-heatmap-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    min-height: 44px;
    border: 2px solid var(--nv-scr-line-2);
    border-radius: var(--nv-scr-radius);
    background: var(--nv-scr-bg-accent);
    overflow-wrap: anywhere;
  }
  .nv-scr-heatmap-readable {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  .nv-scr-heatmap .nv-scr-heatmap-cyan {
    border-color: var(--nv-scr-cyan);
    background: color-mix(in srgb, var(--nv-scr-cyan) 15%, var(--nv-scr-bg));
  }
  .nv-scr-heatmap .nv-scr-heatmap-green {
    border-color: var(--nv-scr-green);
    background: color-mix(in srgb, var(--nv-scr-green) 15%, var(--nv-scr-bg));
  }
  .nv-scr-heatmap .nv-scr-heatmap-amber {
    border-color: var(--nv-scr-amber);
    background: color-mix(in srgb, var(--nv-scr-amber) 15%, var(--nv-scr-bg));
  }
  .nv-scr-heatmap .nv-scr-heatmap-red {
    border-color: var(--nv-scr-red);
    background: color-mix(in srgb, var(--nv-scr-red) 15%, var(--nv-scr-bg));
  }
  .nv-scr-heatmap-cell:hover,
  .nv-scr-heatmap-cell:focus-visible {
    outline: 2px solid var(--nv-scr-text);
    outline-offset: 2px;
  }
  .nv-scr-heatmap-axis {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 12px;
    color: var(--nv-scr-muted);
    overflow-wrap: anywhere;
  }
  .nv-scr-heatmap-tip {
    margin-top: 16px;
    padding: 12px;
    border: 1px solid var(--nv-scr-line-2);
    border-radius: var(--nv-scr-radius);
    background: var(--nv-scr-bg);
    overflow-wrap: anywhere;
    font-variant-numeric: tabular-nums;
  }
  .nv-scr-heatmap-empty {
    color: var(--nv-scr-muted);
  }
}
</style>
