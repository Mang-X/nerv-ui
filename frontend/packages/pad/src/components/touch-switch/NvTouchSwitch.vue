<script setup lang="ts">
import { Switch, SwitchThumb } from '@ui-sdk/vue/switch'
import * as stylex from '@stylexjs/stylex'
import { computed, ref, useAttrs } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './TouchSwitch.styles'
import type { TouchSwitchProps } from './types'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const props = withDefaults(defineProps<TouchSwitchProps>(), {
  modelValue: undefined,
  defaultChecked: false,
  disabled: false,
  readOnly: false,
  required: false,
  name: undefined,
  value: undefined,
  label: undefined,
  labelPosition: 'start',
  ariaLabel: undefined,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

// Local state carries the uncontrolled case; the prop wins once a caller
// attaches `v-model`. The wrapper stays the single source for the switch.
const inner = ref(props.defaultChecked)
const checked = computed({
  get: () => props.modelValue ?? inner.value,
  set: (next: boolean) => {
    inner.value = next
    emit('update:modelValue', next)
  },
})

const trackSx = computed(() => stylex.props(styles.track, focus.ring))
const thumbSx = computed(() => stylex.props(styles.thumb))
const rootSx = computed(() => stylex.props(styles.root, props.disabled && styles.disabled))
const labelSx = computed(() => stylex.props(styles.label))
</script>

<template>
  <label :class="rootSx.className" :style="rootSx.style">
    <span v-if="labelPosition === 'start' && (label || $slots.default)" :class="labelSx.className">
      <slot>{{ label }}</slot>
    </span>
    <Switch
      v-model="checked"
      :name="name"
      :value="value"
      :disabled="disabled"
      :read-only="readOnly"
      :required="required"
      :aria-label="ariaLabel ?? (attrs['aria-label'] as string | undefined)"
      :class="trackSx.className"
      :style="trackSx.style"
    >
      <SwitchThumb :class="thumbSx.className" :style="thumbSx.style" />
    </Switch>
    <span v-if="labelPosition === 'end' && (label || $slots.default)" :class="labelSx.className">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
