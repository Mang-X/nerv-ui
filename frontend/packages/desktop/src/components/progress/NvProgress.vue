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
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Progress.styles'
import type { NvProgressProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvProgressProps>(), {
  value: null,
  min: 0,
  max: 100,
  showValue: false,
  size: 'md',
  label: undefined,
})

const rootSx = computed(() => stylex.props(styles.root))
const headSx = computed(() => stylex.props(styles.head))
const labelSx = computed(() => stylex.props(styles.label))
const valueSx = computed(() => stylex.props(styles.value))
const trackSx = computed(() => stylex.props(styles.track, styles[props.size]))
const indicatorSx = computed(() => stylex.props(styles.indicator))
</script>

<template>
  <Progress
    v-bind="omitClassStyle($attrs)"
    :value="value"
    :min="min"
    :max="max"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <div v-if="label || showValue" :class="headSx.className" :style="headSx.style">
      <ProgressLabel v-if="label" :class="labelSx.className" :style="labelSx.style">
        {{ label }}
      </ProgressLabel>
      <ProgressValue
        v-if="showValue"
        v-slot="{ state }"
        :class="valueSx.className"
        :style="valueSx.style"
        >{{ state.text }}</ProgressValue
      >
    </div>
    <ProgressTrack :class="trackSx.className" :style="trackSx.style">
      <ProgressIndicator :class="indicatorSx.className" :style="indicatorSx.style" />
    </ProgressTrack>
  </Progress>
</template>
