<script setup lang="ts">
import { Switch, SwitchThumb } from '@ui-sdk/vue/switch'
import * as stylex from '@stylexjs/stylex'
import { computed, useAttrs } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './MobileSwitch.styles'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
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

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const checked = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const trackSx = computed(() =>
  stylex.props(styles.track, focus.ring, checked.value && styles.trackChecked),
)
</script>

<template>
  <label :class="stylex.props(styles.row).className">
    <span v-if="$slots.default" :class="stylex.props(styles.label).className">
      <slot />
    </span>
    <Switch
      v-bind="{ ...attrs, class: undefined, style: undefined }"
      :checked="checked"
      :disabled="disabled"
      :read-only="readonly"
      :required="required"
      :name="name"
      :value="value"
      :class="trackSx.className"
      :style="trackSx.style"
      @checked-change="checked = $event"
    >
      <SwitchThumb :class="stylex.props(styles.thumb, checked && styles.thumbChecked).className" />
    </Switch>
  </label>
</template>
