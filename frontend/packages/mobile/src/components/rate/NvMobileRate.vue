<script setup lang="ts">
import { Rating, RatingItem } from '@ui-sdk/vue/rating'
import { Star } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { styles } from './Rate.styles'
import type { MobileRateProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MobileRateProps>(), {
  // Undefined, not false: a default would make the score controlled and the
  // stars could never change on their own.
  modelValue: undefined,
  defaultValue: null,
  max: 5,
  step: 1,
  deselectable: false,
  disabled: false,
  readonly: false,
  showValue: false,
  ariaLabel: '评分',
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  change: [value: number | null]
}>()

const inner = ref<number | null>(props.defaultValue)
const current = computed(() =>
  props.modelValue !== undefined ? props.modelValue : inner.value,
)

const iconSx = computed(() =>
  stylex.props(
    props.size === 'sm' && styles.iconSm,
    props.size === 'md' && styles.iconMd,
    props.size === 'lg' && styles.iconLg,
  ),
)

function onValueChange(value: number | null) {
  inner.value = value
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <Rating
    v-bind="$attrs"
    :value="modelValue"
    :default-value="defaultValue"
    :max="max"
    :step="step"
    :deselectable="deselectable"
    :disabled="disabled"
    :read-only="readonly"
    :aria-label="ariaLabel"
    :class="[stylex.props(styles.root).className, $attrs.class]"
    :style="[stylex.props(styles.root).style, $attrs.style]"
    @value-change="onValueChange"
  >
    <RatingItem v-slot="{ state }" :class="stylex.props(styles.item).className">
      <Star
        aria-hidden="true"
        :size="size === 'lg' ? 30 : size === 'sm' ? 18 : 24"
        :fill="state.fill > 0 ? 'currentColor' : 'none'"
        :class="iconSx.className"
      />
    </RatingItem>
  </Rating>
  <span v-if="showValue" :class="stylex.props(styles.value).className">
    {{ current ?? 0 }}/{{ max }}
  </span>
</template>
