<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './ScreenStatusCard.styles'
import type { StatusCardMetric, StatusCardTone } from './types'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    /** Big state word, e.g. 运行中 / 待机 / 报警. */
    state: string
    /** Small caption above the state word. */
    stateLabel?: string
    /** Numeric readout shown beside the state, e.g. a rate. */
    value?: string | number
    unit?: string
    hint?: string
    tone?: StatusCardTone
    metrics?: StatusCardMetric[]
    /** 0–100 fill; non-finite input is clamped, never rendered as NaN. */
    progress?: number | null
    progressLabel?: string
    footerLabel?: string
    footerValue?: string | number
    label?: string
  }>(),
  {
    tone: 'default',
    metrics: () => [],
    progress: null,
    label: '状态卡',
  },
)

const barStyles: Record<StatusCardTone, stylex.StyleXStyles | null> = {
  default: null,
  accent: styles.barAccent,
  success: styles.barSuccess,
  warning: styles.barWarning,
  danger: styles.barDanger,
}

const textStyles: Record<StatusCardTone, stylex.StyleXStyles | null> = {
  default: null,
  accent: styles.textAccent,
  success: styles.textSuccess,
  warning: styles.textWarning,
  danger: styles.textDanger,
}

const fillStyles: Record<StatusCardTone, stylex.StyleXStyles> = {
  default: styles.fillAccent,
  accent: styles.fillAccent,
  success: styles.fillSuccess,
  warning: styles.fillWarning,
  danger: styles.fillDanger,
}

const rootSx = computed(() => stylex.props(styles.root, barStyles[props.tone]))
const stateSx = computed(() => stylex.props(styles.value, textStyles[props.tone]))
const fill = computed(() => {
  if (props.progress === null || props.progress === undefined) return null
  if (!Number.isFinite(props.progress)) return null
  return Math.max(0, Math.min(100, props.progress))
})

function metricToneStyle(tone: StatusCardTone | undefined) {
  return textStyles[tone ?? 'default']
}
</script>

<template>
  <section :class="rootSx.className" :style="rootSx.style" role="group" :aria-label="label">
    <header :class="stylex.props(styles.header).className">
      <div :class="stylex.props(styles.heading).className">
        <h3 :class="stylex.props(styles.title).className">{{ title }}</h3>
        <p v-if="subtitle" :class="stylex.props(styles.subtitle).className">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" :class="stylex.props(styles.actions).className">
        <slot name="actions" />
      </div>
    </header>
    <slot name="badge" />
    <div :class="stylex.props(styles.stateBlock).className">
      <span :class="stylex.props(styles.stateLabel).className">{{ stateLabel ?? '当前状态' }}</span>
      <div :class="stylex.props(styles.valueRow).className">
        <span :class="stateSx.className" :style="stateSx.style">{{ state }}</span>
        <template v-if="value !== undefined">
          <span :class="stylex.props(styles.value).className">{{ value }}</span>
          <span v-if="unit" :class="stylex.props(styles.unit).className">{{ unit }}</span>
        </template>
      </div>
      <span v-if="hint" :class="stylex.props(styles.hint).className">{{ hint }}</span>
    </div>
    <dl v-if="metrics.length" :class="stylex.props(styles.metrics).className">
      <div
        v-for="(metric, index) in metrics"
        :key="metric.key ?? `${metric.label}-${index}`"
        :class="stylex.props(styles.metric).className"
      >
        <dt :class="stylex.props(styles.metricLabel).className">{{ metric.label }}</dt>
        <dd :class="stylex.props(styles.metricValue, metricToneStyle(metric.tone)).className">
          {{ metric.value }}<span v-if="metric.unit"> {{ metric.unit }}</span>
        </dd>
      </div>
    </dl>
    <div v-if="fill !== null" :class="stylex.props(styles.progress).className">
      <div :class="stylex.props(styles.progressHead).className">
        <span>{{ progressLabel ?? '进度' }}</span>
        <span>{{ Math.round(fill) }}%</span>
      </div>
      <div
        :class="stylex.props(styles.track).className"
        role="progressbar"
        :aria-valuemin="0"
        :aria-valuemax="100"
        :aria-valuenow="Math.round(fill)"
        :aria-label="progressLabel ?? '进度'"
      >
        <div
          :class="stylex.props(styles.fill, fillStyles[tone]).className"
          :style="{ width: `${fill}%` }"
        />
      </div>
    </div>
    <slot />
    <footer
      v-if="footerLabel || footerValue !== undefined || $slots.footer"
      :class="stylex.props(styles.footer).className"
    >
      <slot name="footer">
        <span>{{ footerLabel }}</span>
        <span v-if="footerValue !== undefined" :class="stylex.props(styles.footerValue).className">
          {{ footerValue }}
        </span>
      </slot>
    </footer>
  </section>
</template>
