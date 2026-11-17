<script setup lang="ts">
import { Rating, RatingItem } from '@ui-sdk/vue/rating'
import { StarIcon } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Rating.styles'
import type { NvRatingProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvRatingProps>(), {
  max: 5,
  step: 1,
  loop: false,
  deselectable: undefined,
  disabled: undefined,
  readOnly: undefined,
  required: undefined,
  getValueLabel: (value: number) => `${value} 星`,
})

const rootSx = computed(() => stylex.props(styles.root))
const itemSx = computed(() => stylex.props(styles.item))
const iconSx = computed(() => stylex.props(styles.icon))
</script>

<template>
  <Rating
    v-bind="omitClassStyle($attrs)"
    :value="value"
    :default-value="defaultValue"
    :max="max"
    :step="step"
    :deselectable="deselectable"
    :disabled="disabled"
    :read-only="readOnly"
    :required="required"
    :name="name"
    :form="form"
    :loop="loop"
    :aria-label="ariaLabel"
    :get-value-label="getValueLabel"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <RatingItem v-slot="{ state }" :class="itemSx.className" :style="itemSx.style">
      <StarIcon
        aria-hidden="true"
        :fill="state.fill === 1 ? 'currentColor' : 'none'"
        :class="iconSx.className"
        :style="iconSx.style"
      />
    </RatingItem>
  </Rating>
</template>
