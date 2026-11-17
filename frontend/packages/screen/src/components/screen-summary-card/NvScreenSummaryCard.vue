<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, useId, useSlots } from 'vue'
import { sparklineGeometry } from '../../charts/geometry'
import NvScreenStatusLight from '../screen-status-light/NvScreenStatusLight.vue'
import NvScreenStatusTag from '../screen-status-tag/NvScreenStatusTag.vue'
import { styles } from './ScreenSummaryCard.styles'
import type {
  SummaryCardVariant,
  SummaryComparison,
  SummaryMetric,
  SummaryStatus,
  SummaryTone,
} from './types'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    /** Code/reference line under the title, e.g. a workshop id. */
    reference?: string
    variant?: SummaryCardVariant
    status?: SummaryStatus
    primary?: SummaryMetric
    comparison?: SummaryComparison[]
    metrics?: SummaryMetric[]
    /** 0–100 decorative fill; only finite values are clamped. */
    progress?: number | null
    /** Sparkline samples; at least two finite values draw a line. */
    trend?: ReadonlyArray<number | null>
    trendLabel?: string
    trendTone?: SummaryTone
    chipsLabel?: string
    chips?: SummaryStatus[]
    note?: string
    noteTone?: SummaryTone
  }>(),
  {
    variant: 'default',
    comparison: () => [],
    metrics: () => [],
    progress: null,
    chips: () => [],
    trendTone: 'accent',
  },
)

const slots = useSlots()

const toneStyles: Record<SummaryTone, stylex.StyleXStyles | null> = {
  default: null,
  accent: styles.toneAccent,
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
}

const fillStyles: Record<SummaryTone, stylex.StyleXStyles | null> = {
  default: null,
  accent: null,
  success: styles.fillSuccess,
  warning: styles.fillWarning,
  danger: styles.fillDanger,
}

const sparkStrokes: Record<SummaryTone, stylex.StyleXStyles> = {
  default: styles.sparkStrokeAccent,
  accent: styles.sparkStrokeAccent,
  success: styles.sparkStrokeSuccess,
  warning: styles.sparkStrokeWarning,
  danger: styles.sparkStrokeDanger,
}

const sparkFills: Record<SummaryTone, stylex.StyleXStyles> = {
  default: styles.sparkFillAccent,
  accent: styles.sparkFillAccent,
  success: styles.sparkFillSuccess,
  warning: styles.sparkFillWarning,
  danger: styles.sparkFillDanger,
}

const uid = `nv-scr-summary-${useId()}`
const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 })

const rootSx = computed(() =>
  stylex.props(styles.root, props.variant === 'feature' && styles.feature),
)

const fill = computed(() => {
  if (props.progress === null || props.progress === undefined) return null
  if (!Number.isFinite(props.progress)) return null
  return Math.max(0, Math.min(100, props.progress))
})

const spark = computed(() => {
  if (!props.trend || props.trend.length < 2) return null
  return sparklineGeometry(props.trend, 240, 56, 4)
})

const sparkLineSx = computed(() =>
  stylex.props(styles.sparkLine, sparkStrokes[props.trendTone]),
)
const sparkAreaSx = computed(() =>
  stylex.props(styles.sparkArea, sparkFills[props.trendTone]),
)

function metricText(metric: SummaryMetric | SummaryComparison): string {
  const value = 'value' in metric ? metric.value : undefined
  if (value === null || value === undefined) return '—'
  const text = typeof value === 'number' ? (Number.isFinite(value) ? formatter.format(value) : '—') : value
  const unit = 'unit' in metric ? metric.unit : undefined
  return unit && text !== '—' ? `${text} ${unit}` : text
}

function metricTone(metric: SummaryMetric | SummaryComparison) {
  return toneStyles[metric.tone ?? 'default']
}
</script>

<template>
  <section :class="rootSx.className" :style="rootSx.style">
    <header :class="stylex.props(styles.header).className">
      <span v-if="slots.icon" :class="stylex.props(styles.icon).className" aria-hidden="true">
        <slot name="icon" />
      </span>
      <div :class="stylex.props(styles.heading).className">
        <h3
          :class="stylex.props(
            styles.title,
            variant === 'feature' && styles.featureTitle,
          ).className"
        >
          {{ title }}
        </h3>
        <p v-if="description" :class="stylex.props(styles.description).className">{{ description }}</p>
      </div>
      <NvScreenStatusLight
        v-if="status"
        :tone="status.tone"
        :label="status.label"
        :class="stylex.props(styles.actions).className"
      />
    </header>
    <span v-if="reference" :class="stylex.props(styles.reference).className">{{ reference }}</span>
    <div v-if="primary || comparison.length" :class="stylex.props(styles.main).className">
      <dl v-if="primary" :class="stylex.props(styles.primary).className" data-summary-primary>
        <dt :class="stylex.props(styles.primaryLabel).className">{{ primary.label }}</dt>
        <dd
          :class="stylex.props(
            styles.primaryValue,
            variant === 'compact' && styles.compactPrimaryValue,
            metricTone(primary),
          ).className"
        >
          {{ metricText(primary) }}
        </dd>
      </dl>
      <dl v-if="comparison.length" :class="stylex.props(styles.comparison).className">
        <div
          v-for="(entry, index) in comparison"
          :key="entry.key ?? `${entry.label}-${index}`"
          :class="stylex.props(styles.comparisonItem).className"
        >
          <dt :class="stylex.props(styles.comparisonLabel).className">{{ entry.label }}</dt>
          <dd :class="stylex.props(styles.comparisonValue, metricTone(entry)).className">
            {{ metricText(entry) }}
          </dd>
        </div>
      </dl>
    </div>
    <dl v-if="metrics.length" :class="stylex.props(styles.metrics).className">
      <div
        v-for="(metric, index) in metrics"
        :key="metric.key ?? `${metric.label}-${index}`"
        :class="stylex.props(styles.metric).className"
        data-summary-metric
      >
        <dt :class="stylex.props(styles.metricLabel).className">{{ metric.label }}</dt>
        <dd :class="stylex.props(styles.metricValue, metricTone(metric)).className">
          {{ metricText(metric) }}
        </dd>
      </div>
    </dl>
    <div v-if="fill !== null" :class="stylex.props(styles.track).className" aria-hidden="true">
      <div
        :class="stylex.props(styles.fill, fillStyles[primary?.tone ?? 'default']).className"
        :style="{ width: `${fill}%` }"
      />
    </div>
    <div
      v-if="spark"
      :class="stylex.props(styles.spark).className"
      :role="trendLabel ? 'img' : undefined"
      :aria-label="trendLabel"
    >
      <svg :viewBox="'0 0 240 56'" preserveAspectRatio="none" :class="stylex.props(styles.sparkSvg).className" aria-hidden="true">
        <path :d="spark.area" :class="sparkAreaSx.className" :style="sparkAreaSx.style" />
        <path :d="spark.line" :class="sparkLineSx.className" :style="sparkLineSx.style" />
        <circle
          :cx="spark.last.x"
          :cy="spark.last.y"
          r="2.2"
          :class="sparkLineSx.className"
          :style="sparkLineSx.style"
        />
      </svg>
    </div>
    <div v-if="chipsLabel || chips.length" :class="stylex.props(styles.footer).className">
      <span v-if="chipsLabel" :class="stylex.props(styles.comparisonLabel).className">{{ chipsLabel }}</span>
      <NvScreenStatusTag
        v-for="(chip, index) in chips"
        :key="`${chip.label}-${index}`"
        :label="chip.label"
        :tone="chip.tone"
        size="sm"
      />
    </div>
    <footer v-if="note || slots.footer" :class="stylex.props(styles.footer).className">
      <slot name="footer">
        <p :class="stylex.props(styles.notice, toneStyles[noteTone ?? 'default']).className">{{ note }}</p>
      </slot>
    </footer>
    <slot />
  </section>
</template>
