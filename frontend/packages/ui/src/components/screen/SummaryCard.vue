<script setup lang="ts">
import { computed } from 'vue'
import ScreenPanel from './ScreenPanel.vue'
import StatusLight from './StatusLight.vue'
import StatusTag from './StatusTag.vue'
import Sparkline from './Sparkline.vue'

export type ScreenSummaryTone = 'cyan' | 'green' | 'amber' | 'red'
export interface ScreenSummaryMetric {
  key: string | number
  label: string
  value?: number | string | null
  unit?: string
  tone?: ScreenSummaryTone
}
export interface ScreenSummaryStatus {
  label: string
  tone: ScreenSummaryTone
}
export interface ScreenSummaryItem extends ScreenSummaryStatus {
  key: string | number
}
const props = withDefaults(
  defineProps<{
    identity: string | number
    title: string
    variant: 'launcher' | 'health' | 'line'
    description?: string
    reference?: string
    status?: ScreenSummaryStatus
    primary?: ScreenSummaryMetric
    comparison?: readonly ScreenSummaryMetric[]
    metrics: readonly ScreenSummaryMetric[]
    /** Host percentage; only the decorative fill is clamped. */
    progress?: number | null
    trend?: number[]
    trendLabel?: string
    chipsLabel?: string
    chips?: readonly ScreenSummaryItem[]
    dots?: readonly ScreenSummaryItem[]
    notice?: ScreenSummaryStatus
    actionLabel?: string
  }>(),
  { comparison: () => [], chips: () => [], dots: () => [] },
)
const emit = defineEmits<{ action: [identity: string | number] }>()
const formatter = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 3 })
function value(metric: ScreenSummaryMetric) {
  const v = metric.value
  const text = typeof v === 'number' ? (Number.isFinite(v) ? formatter.format(v) : '—') : (v ?? '—')
  return `${text}${metric.unit && text !== '—' ? ` ${metric.unit}` : ''}`
}
const fill = computed(() =>
  typeof props.progress === 'number' && Number.isFinite(props.progress)
    ? Math.max(0, Math.min(100, props.progress))
    : null,
)
</script>

<template>
  <ScreenPanel
    class="nv-scr-summary"
    :class="[`nv-scr-summary-${variant}`, notice?.tone === 'red' ? 'nv-scr-summary-alert' : '']"
    :accent="notice?.tone === 'red' ? 'red' : undefined"
  >
    <header class="nv-scr-summary-head">
      <span v-if="$slots.icon" class="nv-scr-summary-icon" aria-hidden="true"
        ><slot name="icon"
      /></span>
      <div class="nv-scr-summary-heading">
        <h3>{{ title }}</h3>
        <p v-if="description">{{ description }}</p>
      </div>
      <StatusLight v-if="status" :tone="status.tone" :label="status.label" />
    </header>
    <span v-if="reference" class="nv-scr-summary-ref">{{ reference }}</span>
    <div v-if="primary || comparison.length" class="nv-scr-summary-main">
      <dl
        v-if="primary"
        data-summary-primary
        :class="primary.tone ? `nv-scr-summary-tone-${primary.tone}` : undefined"
      >
        <dt>{{ primary.label }}</dt>
        <dd>{{ value(primary) }}</dd>
      </dl>
      <dl v-if="comparison.length" class="nv-scr-summary-comparison">
        <div
          v-for="metric in comparison"
          :key="metric.key"
          :class="metric.tone ? `nv-scr-summary-tone-${metric.tone}` : undefined"
        >
          <dt>{{ metric.label }}</dt>
          <dd>{{ value(metric) }}</dd>
        </div>
      </dl>
    </div>
    <div v-if="fill !== null" class="nv-scr-summary-track" aria-hidden="true">
      <i
        data-summary-progress
        :style="{ width: `${fill}%` }"
        :class="primary?.tone ? `nv-scr-summary-tone-${primary.tone}` : undefined"
      />
    </div>
    <dl class="nv-scr-summary-metrics">
      <div
        v-for="metric in metrics"
        :key="metric.key"
        data-summary-metric
        :class="metric.tone ? `nv-scr-summary-tone-${metric.tone}` : undefined"
      >
        <dt>{{ metric.label }}</dt>
        <dd data-summary-value>{{ value(metric) }}</dd>
      </div>
    </dl>
    <div
      v-if="trend !== undefined"
      class="nv-scr-summary-trend"
      :role="trendLabel ? 'img' : undefined"
      :aria-label="trendLabel"
    >
      <Sparkline :data="trend" :color="`var(--nv-scr-${status?.tone ?? 'cyan'})`" />
    </div>
    <div v-if="chipsLabel || chips.length" class="nv-scr-summary-chips">
      <p v-if="chipsLabel">{{ chipsLabel }}</p>
      <StatusTag
        v-for="chip in chips"
        :key="chip.key"
        class="nv-scr-summary-chip"
        :tone="chip.tone"
        :label="chip.label"
      />
    </div>
    <footer v-if="dots.length || notice" class="nv-scr-summary-foot">
      <ul v-if="dots.length" class="nv-scr-summary-dots">
        <li v-for="dot in dots" :key="dot.key" data-summary-dot>
          <StatusLight :tone="dot.tone" :label="dot.label" />
        </li>
      </ul>
      <p v-if="notice" class="nv-scr-summary-notice" :class="`nv-scr-summary-tone-${notice.tone}`">
        {{ notice.label }}
      </p>
    </footer>
    <button
      v-if="actionLabel"
      type="button"
      class="nv-scr-summary-action nv-focusable"
      :aria-label="`${actionLabel}：${title}`"
      @click="emit('action', identity)"
    >
      {{ actionLabel }}<span aria-hidden="true"> →</span>
    </button>
  </ScreenPanel>
</template>

<style scoped>
@layer nv-components {
  .nv-scr-summary {
    min-width: 0;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .nv-scr-summary-head {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 12px;
  }
  .nv-scr-summary-heading {
    flex: 1;
    min-width: 100px;
  }
  .nv-scr-summary h3 {
    margin: 0;
    color: var(--nv-scr-text);
    font-size: 21px;
    font-weight: 600;
  }
  .nv-scr-summary p {
    margin: 0;
  }
  .nv-scr-summary-heading p {
    margin-top: 5px;
    font-size: 14px;
    color: var(--nv-scr-muted);
  }
  .nv-scr-summary-icon {
    flex: none;
    display: grid;
    place-items: center;
    color: var(--nv-scr-cyan);
  }
  .nv-scr-summary.nv-scr-summary-launcher {
    padding: 30px 32px 24px;
  }
  .nv-scr-summary.nv-scr-summary-launcher h3 {
    font-size: 26px;
  }
  .nv-scr-summary.nv-scr-summary-launcher .nv-scr-summary-icon {
    width: 54px;
    height: 54px;
    border: 1px solid var(--nv-scr-line-2);
    border-radius: var(--nv-scr-radius);
  }
  .nv-scr-summary-ref {
    font:
      12px ui-monospace,
      monospace;
    color: var(--nv-scr-muted);
  }
  .nv-scr-summary dl {
    margin: 0;
  }
  .nv-scr-summary dt {
    font-size: 13px;
    color: var(--nv-scr-muted);
  }
  .nv-scr-summary dd {
    margin: 4px 0 0;
    font-size: 23px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .nv-scr-summary-main {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }
  .nv-scr-summary [data-summary-primary] dd {
    font-size: 46px;
    line-height: 1.1;
  }
  .nv-scr-summary-comparison {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .nv-scr-summary-comparison > div {
    display: flex;
    gap: 12px;
    align-items: baseline;
    flex-wrap: wrap;
  }
  .nv-scr-summary-comparison dd {
    font-size: 16px;
  }
  .nv-scr-summary-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 12px;
  }
  .nv-scr-summary.nv-scr-summary-launcher .nv-scr-summary-metrics {
    display: flex;
    flex-direction: column;
  }
  .nv-scr-summary.nv-scr-summary-launcher [data-summary-metric] {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid var(--nv-scr-divider);
  }
  .nv-scr-summary.nv-scr-summary-launcher [data-summary-value] {
    font-size: 32px;
  }
  .nv-scr-summary.nv-scr-summary-health .nv-scr-summary-metrics {
    padding-top: 12px;
    border-top: 1px solid var(--nv-scr-divider);
  }
  .nv-scr-summary.nv-scr-summary-health [data-summary-value] {
    font-size: 19px;
  }
  .nv-scr-summary-track {
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background: var(--nv-scr-divider);
  }
  .nv-scr-summary-track i {
    display: block;
    height: 100%;
    background: var(--nv-scr-cyan);
    transition: width 0.6s var(--nv-scr-ease-emphasized);
  }
  .nv-scr-summary-trend {
    min-height: 36px;
    height: 56px;
  }
  .nv-scr-summary-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    margin-top: auto;
  }
  .nv-scr-summary-chips > p {
    flex-basis: 100%;
    font-size: 13px;
    color: var(--nv-scr-faint);
  }
  .nv-scr-summary-chip {
    height: auto;
    min-height: 27px;
    padding-block: 5px;
    line-height: 1.3;
  }
  .nv-scr-summary-foot {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 12px;
  }
  .nv-scr-summary-dots {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .nv-scr-summary-notice {
    font-size: 13px;
    color: var(--nv-scr-muted);
  }
  .nv-scr-summary-action {
    margin-top: auto;
    padding: 14px 0 0;
    border: 0;
    border-top: 1px solid var(--nv-scr-divider);
    background: transparent;
    color: var(--nv-scr-muted);
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition:
      color var(--nv-duration-base, 220ms) var(--nv-scr-ease),
      transform var(--nv-duration-fast, 150ms) var(--nv-scr-ease);
  }
  .nv-scr-summary-action:hover {
    color: var(--nv-scr-cyan);
  }
  .nv-scr-summary-action:active {
    transform: scale(0.985);
  }
  .nv-scr-summary :is(h3, p, dt, dd, span, button) {
    overflow-wrap: anywhere;
  }
  .nv-scr-summary .nv-scr-summary-tone-cyan {
    color: var(--nv-scr-cyan);
  }
  .nv-scr-summary .nv-scr-summary-tone-green {
    color: var(--nv-scr-green);
  }
  .nv-scr-summary .nv-scr-summary-tone-amber {
    color: var(--nv-scr-amber);
  }
  .nv-scr-summary .nv-scr-summary-tone-red {
    color: var(--nv-scr-red);
  }
  .nv-scr-summary-track i.nv-scr-summary-tone-green {
    background: var(--nv-scr-green);
  }
  .nv-scr-summary-track i.nv-scr-summary-tone-amber {
    background: var(--nv-scr-amber);
  }
  .nv-scr-summary-track i.nv-scr-summary-tone-red {
    background: var(--nv-scr-red);
  }
  .nv-scr-summary.nv-scr-summary-alert::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    box-shadow: 0 0 16px -4px var(--nv-scr-red);
    animation: nv-scr-summary-alert 2.6s ease-in-out infinite;
  }
  @keyframes nv-scr-summary-alert {
    50% {
      opacity: 0.35;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .nv-scr-summary.nv-scr-summary-alert::after {
      animation: none;
    }
    .nv-scr-summary-track i,
    .nv-scr-summary-action {
      transition: none;
    }
  }
}
</style>
