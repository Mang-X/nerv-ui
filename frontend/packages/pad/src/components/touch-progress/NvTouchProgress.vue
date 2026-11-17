<script setup lang="ts">
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from '@ui-sdk/vue/progress'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './TouchProgress.styles'
import type { TouchProgressProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TouchProgressProps>(), {
  value: null,
  min: 0,
  max: 100,
  label: undefined,
  showValue: false,
  size: 'lg',
  tone: 'brand',
})

const rootSx = computed(() => stylex.props(styles.root))
const headSx = computed(() => stylex.props(styles.head))
const labelSx = computed(() => stylex.props(styles.label))
const valueSx = computed(() => stylex.props(styles.value))
const trackSx = computed(() => stylex.props(styles.track, styles[props.size]))
const indicatorSx = computed(() =>
  stylex.props(
    styles.indicator,
    props.tone === 'danger' && styles.danger,
    props.tone === 'neutral' && styles.neutral,
  ),
)
</script>

<template>
  <Progress
    v-bind="$attrs"
    :value="value"
    :min="min"
    :max="max"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <div
      v-if="label || showValue || $slots.label || $slots.value"
      :class="headSx.className"
      :style="headSx.style"
    >
      <ProgressLabel v-if="label || $slots.label" :class="labelSx.className" :style="labelSx.style">
        <slot name="label">{{ label }}</slot>
      </ProgressLabel>
      <ProgressValue
        v-if="showValue || $slots.value"
        v-slot="{ state }"
        :class="valueSx.className"
        :style="valueSx.style"
      >
        <slot name="value" :state="state">{{ state.text }}</slot>
      </ProgressValue>
    </div>
    <ProgressTrack :class="trackSx.className" :style="trackSx.style">
      <ProgressIndicator :class="indicatorSx.className" :style="indicatorSx.style" />
    </ProgressTrack>
  </Progress>
</template>
