<script setup lang="ts">
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue as SliderValuePart,
} from '@ui-sdk/vue/slider'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Slider.styles'
import type { NvSliderProps, NvSliderValue } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvSliderProps>(), {
  disabled: false,
  readOnly: false,
  orientation: 'horizontal',
  showValue: false,
})


const thumbCount = computed(() => {
  if (Array.isArray(props.value)) return Math.max(props.value.length, 1)
  if (Array.isArray(props.defaultValue)) return Math.max(props.defaultValue.length, 1)
  return 1
})

const rootSx = computed(() => stylex.props(styles.root))
const controlSx = computed(() => stylex.props(styles.control))
const trackSx = computed(() => stylex.props(styles.track))
const indicatorSx = computed(() => stylex.props(styles.indicator))
const thumbSx = computed(() => stylex.props(styles.thumb))
const valueSx = computed(() => stylex.props(styles.value))
</script>

<template>
  <Slider
    v-bind="omitClassStyle($attrs)"
    :value="value"
    :default-value="defaultValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :read-only="readOnly"
    :orientation="orientation"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <SliderControl :class="controlSx.className" :style="controlSx.style">
      <SliderTrack :class="trackSx.className" :style="trackSx.style">
        <SliderIndicator :class="indicatorSx.className" :style="indicatorSx.style" />
      </SliderTrack>
      <SliderThumb
        v-for="index in thumbCount"
        :key="index"
        :index="index - 1"
        :aria-label="label"
        :class="thumbSx.className"
        :style="thumbSx.style"
      />
    </SliderControl>
    <SliderValuePart v-if="showValue" :class="valueSx.className" :style="valueSx.style" />
  </Slider>
</template>
