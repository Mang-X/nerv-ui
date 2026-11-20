<script setup lang="ts">
import { Checkbox, CheckboxIndicator } from '@ui-sdk/vue/checkbox'
import type { CheckedState } from '@ui-sdk/vue/checkbox'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './MobileCheckbox.styles'

const props = withDefaults(
  defineProps<{
    modelValue?: CheckedState
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    name?: string
    value?: string
  }>(),
  {
    modelValue: undefined,
    disabled: false,
    readonly: false,
    required: false,
    name: undefined,
    value: undefined,
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: CheckedState] }>()

const checked = computed({
  get: () => props.modelValue,
  set: (value: CheckedState) => emit('update:modelValue', value),
})

const boxSx = computed(() =>
  stylex.props(
    styles.box,
    focus.ring,
    checked.value !== false && styles.boxChecked,
  ),
)
</script>

<template>
  <label :class="stylex.props(styles.row, disabled && styles.rowDisabled).className">
    <Checkbox
      v-slot="{ state }"
      :checked="checked"
      :disabled="disabled"
      :read-only="readonly"
      :required="required"
      :name="name"
      :value="value"
      :class="boxSx.className"
      :style="boxSx.style"
      @checked-change="checked = $event"
    >
      <CheckboxIndicator :class="stylex.props(styles.indicator).className">
        <NvIcon name="minus" v-if="state.indeterminate" :size="16" />
        <NvIcon name="check" v-else-if="state.checked" :size="16" />
      </CheckboxIndicator>
    </Checkbox>
    <span v-if="$slots.default" :class="stylex.props(styles.label).className">
      <slot />
    </span>
  </label>
</template>
