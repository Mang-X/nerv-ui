<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, shallowRef } from 'vue'
import type { Line, XYContainerConfigInterface } from '@unovis/ts'
import { PlotbandLabelPosition } from '@unovis/ts'
import {
  VisAxis,
  VisCrosshair,
  VisLine,
  VisPlotband,
  VisTooltip,
  VisXYContainer,
} from '@unovis/vue'
import { cn, cssColor, escapeHtml } from '../../../lib/utils'

/**
 * Pro — multi-series line chart on unovis (e.g. plan vs. actual). Each series
 * maps to a chart token by default; legend + crosshair tooltip included.
 */
export interface LineSeries {
  key: string
  label: string
  color?: string
}
export interface NvLineBand {
  id: string
  axis: 'x' | 'y'
  from: number
  to: number
  label: string
  tone?: 'info' | 'warning' | 'danger' | 'neutral'
}
export interface NvLineMarker {
  id: string
  /** Row index: xKey is a display label, including duplicate labels. */
  index: number
  seriesKey: string
  label: string
  href?: string
}
type Row = Record<string, number | string>

const props = withDefaults(
  defineProps<{
    data: Row[]
    xKey: string
    series: LineSeries[]
    bands?: NvLineBand[]
    markers?: NvLineMarker[]
    height?: number
    valueSuffix?: string
    class?: HTMLAttributes['class']
  }>(),
  { height: 260, valueSuffix: '' },
)

const emit = defineEmits<{
  markerClick: [marker: NvLineMarker, event: MouseEvent | KeyboardEvent]
}>()
const line = shallowRef<{ component?: Line<Row> }>()
const plot = shallowRef<{ left: number; top: number; width: number; height: number }>()
const revision = shallowRef(0)
const onRenderComplete: XYContainerConfigInterface<Row>['onRenderComplete'] = (
  _svg,
  margin,
  _bleed,
  _cw,
  _ch,
  width,
  height,
) => {
  plot.value = { left: margin.left ?? 0, top: margin.top ?? 0, width, height }
  revision.value++
}
const tones = {
  info: 'var(--nv-brand)',
  warning: 'var(--nv-warning)',
  danger: 'var(--destructive)',
  neutral: 'var(--muted-foreground)',
}
// Normalize extreme annotated values before the shared producer scale sees them.
// This avoids overflowing d3's finite-domain subtraction; labels/tooltips retain host units.
const divisor = computed(() => {
  if (!props.bands && !props.markers) return 1
  let magnitude = 1
  for (const row of props.data)
    for (const series of props.series) {
      const value = Number(row[series.key])
      if (Number.isFinite(value)) magnitude = Math.max(magnitude, Math.abs(value))
    }
  return magnitude > 1e150 ? magnitude : 1
})
const validBands = computed(() => {
  void revision.value
  const component = line.value?.component
  if (!component || !props.data.length || !props.series.length) return []
  return (props.bands ?? []).flatMap((band) => {
    if (!Number.isFinite(band.from) || !Number.isFinite(band.to)) return []
    const domain = (band.axis === 'x' ? component.xScale : component.yScale).domain().map(Number)
    const factor = band.axis === 'y' ? divisor.value : 1
    const lo = Math.max(Math.min(...domain), Math.min(band.from / factor, band.to / factor))
    const hi = Math.min(Math.max(...domain), Math.max(band.from / factor, band.to / factor))
    return lo > hi ? [] : [{ ...band, from: lo, to: hi }]
  })
})
const positionedMarkers = computed(() => {
  void revision.value
  const component = line.value?.component
  const rect = plot.value
  if (!component || !rect) return []
  return (props.markers ?? []).flatMap((marker) => {
    const row = props.data[marker.index]
    if (
      !Number.isInteger(marker.index) ||
      !row ||
      !props.series.some((s) => s.key === marker.seriesKey)
    )
      return []
    const value = row[marker.seriesKey]
    if (value === '' || value == null || !Number.isFinite(Number(value))) return []
    const x = component.xScale(marker.index)
    const y = component.yScale(Number(value) / divisor.value)
    if (![x, y].every(Number.isFinite) || x < 0 || x > rect.width || y < 0 || y > rect.height)
      return []
    return [{ ...marker, x: x + rect.left, y: y + rect.top }]
  })
})
const safeHref = (href?: string) => (href && /^#[^\s]+$/.test(href) ? href : undefined)
const activate = (id: string, event: MouseEvent | KeyboardEvent) => {
  const current = props.markers?.find((marker) => marker.id === id)
  if (current) emit('markerClick', current, event)
}

const palette = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]
const colors = computed(() => props.series.map((s, i) => s.color ?? palette[i % palette.length]))

const x = (_d: Row, i: number) => i
const yAccessors = computed(() =>
  props.series.map(
    (s) => (d: Row) =>
      (d[s.key] === '' || d[s.key] == null) && (props.bands || props.markers)
        ? NaN
        : Number(d[s.key]) / divisor.value,
  ),
)
const xTickFormat = (i: number) => String(props.data[i]?.[props.xKey] ?? '')
const tooltipTemplate = (d: Row) => {
  const rows = props.series
    .map(
      (s, i) =>
        `<div class="nv-vis-row"><span class="nv-vis-dot" style="background:${escapeHtml(cssColor(colors.value[i]))}"></span><span>${escapeHtml(s.label)}</span><b>${escapeHtml(d[s.key])}${escapeHtml(props.valueSuffix)}</b></div>`,
    )
    .join('')
  return `<div class="nv-vis-card"><div class="nv-vis-head">${escapeHtml(d[props.xKey])}</div>${rows}</div>`
}
</script>

<template>
  <div :class="cn('nv-chart', props.class)">
    <div class="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
      <span
        v-for="(s, i) in series"
        :key="s.key"
        class="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        <span class="size-2 rounded-full" :style="{ background: colors[i] }" />
        {{ s.label }}
      </span>
    </div>
    <div class="nv-line-plot">
      <VisXYContainer
        :data="data"
        aria-label="折线趋势"
        :on-render-complete="onRenderComplete"
        :duration="bands || markers ? 0 : undefined"
        :height="height"
        :margin="{ top: 8, right: 12, bottom: 4, left: 8 }"
      >
        <VisLine
          :duration="bands || markers ? 0 : undefined"
          ref="line"
          :x="x"
          :y="yAccessors"
          :color="colors"
          :line-width="2"
        />
        <VisPlotband
          v-for="band in validBands"
          :key="band.id"
          :axis="band.axis"
          :from="band.from"
          :to="band.to"
          :label-text="band.label"
          :label-position="PlotbandLabelPosition.TopInside"
          :label-offset-y="4"
          label-color="var(--foreground)"
          :color="`color-mix(in oklch, ${tones[band.tone ?? 'neutral']} 12%, transparent)`"
          :exclude-from-domain-calculation="true"
          :duration="0"
        />
        <VisAxis
          :duration="bands || markers ? 0 : undefined"
          type="x"
          :tick-format="xTickFormat"
          :num-ticks="data.length"
          :grid-line="false"
          :tick-line="false"
          :domain-line="false"
        />
        <VisAxis
          :duration="bands || markers ? 0 : undefined"
          :tick-format="divisor === 1 ? undefined : (v: number) => String(v * divisor)"
          type="y"
          :num-ticks="4"
          :tick-line="false"
          :domain-line="false"
        />
        <VisCrosshair :color="colors" :template="tooltipTemplate" />
        <VisTooltip />
      </VisXYContainer>
      <component
        v-for="marker in positionedMarkers"
        :key="marker.id"
        :is="safeHref(marker.href) ? 'a' : 'button'"
        :href="safeHref(marker.href)"
        :type="safeHref(marker.href) ? undefined : 'button'"
        data-slot="nv-line-marker"
        :data-marker-id="marker.id"
        class="nv-line-marker text-xs"
        :aria-label="marker.label"
        :title="marker.label"
        :style="{ left: `${marker.x}px`, top: `${marker.y}px` }"
        @click="activate(marker.id, $event)"
        @keydown.space.prevent="($event.currentTarget as HTMLElement).click()"
        >●</component
      >
    </div>
    <ul
      v-if="validBands.length"
      class="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground"
      aria-label="范围说明"
    >
      <li v-for="band in validBands" :key="band.id">{{ band.label }}</li>
    </ul>
  </div>
</template>

<style scoped>
@layer nv-components {
  .nv-line-plot {
    position: relative;
  }
  .nv-line-marker {
    position: absolute;
    transform: translate(-50%, -50%);
    color: var(--nv-brand);
    background: var(--card);
    border: 1px solid var(--nv-brand);
    border-radius: var(--radius);
    padding: 2px 4px;
    cursor: pointer;
  }
  .nv-line-marker:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  .nv-chart {
    width: 100%;
    --vis-axis-grid-color: var(--border);
    --vis-axis-tick-label-color: var(--muted-foreground);
    --vis-axis-tick-label-font-size: 11px;
    --vis-axis-font-family: var(--font-sans);
    --vis-crosshair-line-stroke-color: color-mix(in oklch, var(--foreground) 30%, transparent);
    --vis-crosshair-circle-stroke-color: var(--card);
    --vis-tooltip-background-color: var(--nv-glass-bg);
    --vis-tooltip-text-color: var(--popover-foreground);
    --vis-tooltip-border-color: var(--nv-glass-border);
    --vis-tooltip-padding: 0;
    --vis-tooltip-border-radius: 8px;
  }
  .nv-chart :deep([class*='-tooltip']) {
    backdrop-filter: var(--nv-glass-filter);
    -webkit-backdrop-filter: var(--nv-glass-filter);
    box-shadow: var(--nv-glass-shadow);
  }
  .nv-chart :deep(.nv-vis-card) {
    min-width: 9rem;
    padding: 8px 10px;
    font-size: 12px;
  }
  .nv-chart :deep(.nv-vis-head) {
    margin-bottom: 6px;
    font-weight: 600;
  }
  .nv-chart :deep(.nv-vis-row) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 0;
  }
  .nv-chart :deep(.nv-vis-row b) {
    margin-left: auto;
    font-variant-numeric: tabular-nums;
  }
  .nv-chart :deep(.nv-vis-dot) {
    width: 8px;
    height: 8px;
    border-radius: 9999px;
  }
}
</style>
