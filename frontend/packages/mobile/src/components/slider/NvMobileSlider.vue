<script setup lang="ts">
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from '@ui-sdk/vue/slider'
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { styles } from './Slider.styles'
import type { MobileSliderProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MobileSliderProps>(), {
  // Undefined, not false: a default would make the value controlled and the
  // thumb could never move on its own.
  modelValue: undefined,
  defaultValue: undefined,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  readonly: false,
  showValue: false,
  ariaLabel: '滑块',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()

const inner = ref(props.defaultValue ?? props.min)

function onValueChange(value: number | number[]) {
  const next = typeof value === 'number' ? value : value[0] ?? 0
  inner.value = next
  emit('update:modelValue', next)
  emit('change', next)
}
</script>

<template>
  <Slider
    v-bind="$attrs"
    :value="modelValue"
    :default-value="defaultValue ?? min"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :read-only="readonly"
    :class="[stylex.props(styles.root).className, $attrs.class]"
    :style="[stylex.props(styles.root).style, $attrs.style]"
    @value-change="onValueChange"
  >
    <SliderControl :class="stylex.props(styles.control).className">
      <SliderTrack :class="stylex.props(styles.track).className">
        <SliderIndicator :class="stylex.props(styles.indicator).className" />
      </SliderTrack>
      <SliderThumb :aria-label="ariaLabel" :class="stylex.props(styles.thumb).className" />
    </SliderControl>
    <SliderValue
      v-if="showValue"
      v-slot="{ state }"
      :class="stylex.props(styles.value).className"
    >{{ state.text }}</SliderValue>
  </Slider>
</template>
