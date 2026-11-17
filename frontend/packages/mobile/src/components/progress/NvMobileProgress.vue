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
import { styles } from './Progress.styles'
import type { MobileProgressProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MobileProgressProps>(), {
  value: null,
  min: 0,
  max: 100,
  label: undefined,
  showValue: false,
  size: 'md',
  variant: 'brand',
})

const indicatorSx = computed(() =>
  stylex.props(
    styles.indicator,
    props.variant === 'danger' && styles.indicatorDanger,
    props.variant === 'neutral' && styles.indicatorNeutral,
  ),
)
</script>

<template>
  <Progress
    v-bind="$attrs"
    :value="value"
    :min="min"
    :max="max"
    :class="[stylex.props(styles.root).className, $attrs.class]"
    :style="[stylex.props(styles.root).style, $attrs.style]"
  >
    <div v-if="label || showValue || $slots.label || $slots.value" :class="stylex.props(styles.head).className">
      <ProgressLabel v-if="label || $slots.label" :class="stylex.props(styles.label).className">
        <slot name="label">{{ label }}</slot>
      </ProgressLabel>
      <ProgressValue
        v-if="showValue || $slots.value"
        v-slot="{ state }"
        :class="stylex.props(styles.value).className"
      >
        <slot name="value" :state="state">{{ state.text }}</slot>
      </ProgressValue>
    </div>
    <ProgressTrack :class="stylex.props(styles.track, styles[size]).className">
      <ProgressIndicator :class="indicatorSx.className" :style="indicatorSx.style" />
    </ProgressTrack>
  </Progress>
</template>
