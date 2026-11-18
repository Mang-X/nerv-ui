<script setup lang="ts">
import { Input, InputClear, InputGroup } from '@ui-sdk/vue/input'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed, ref, useAttrs } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './MobileInput.styles'
import type { MobileInputMode } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string
    defaultValue?: string
    type?: string
    placeholder?: string
    name?: string
    autocomplete?: string
    inputmode?: MobileInputMode
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    invalid?: boolean
    clearable?: boolean
    clearLabel?: string
  }>(),
  {
    modelValue: undefined,
    defaultValue: undefined,
    type: 'text',
    placeholder: undefined,
    name: undefined,
    autocomplete: undefined,
    inputmode: undefined,
    disabled: false,
    readonly: false,
    required: false,
    invalid: false,
    clearable: true,
    clearLabel: '清除',
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const attrs = useAttrs()
const inner = ref(props.defaultValue ?? '')
const model = computed({
  get: () => (props.modelValue !== undefined ? props.modelValue : inner.value),
  set: (value: string) => {
    inner.value = value
    emit('update:modelValue', value)
  },
})

const groupSx = computed(() =>
  stylex.props(
    styles.group,
    props.invalid && styles.invalid,
    props.disabled && styles.disabled,
    focus.ring,
  ),
)

const inputAttrs = computed(() => {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class' || key === 'style') continue
    out[key] = value
  }
  return out
})
</script>

<template>
  <div
    :class="[stylex.props(styles.root).className, attrs.class]"
    :style="attrs.style"
  >
    <InputGroup :class="groupSx.className" :style="groupSx.style">
      <span v-if="$slots.prefix" :class="stylex.props(styles.adornment).className">
        <slot name="prefix" />
      </span>
      <Input
        v-model="model"
        :class="stylex.props(styles.input).className"
        :type="type"
        :placeholder="placeholder"
        :name="name"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :disabled="disabled"
        :read-only="readonly"
        :required="required"
        :aria-invalid="invalid || undefined"
        v-bind="inputAttrs"
      />
      <span v-if="$slots.suffix" :class="stylex.props(styles.adornment).className">
        <slot name="suffix" />
      </span>
      <InputClear
        v-if="clearable"
        :aria-label="clearLabel"
        :class="stylex.props(styles.clear, focus.ring).className"
      >
        <NvIcon name="close" :size="18" />
      </InputClear>
    </InputGroup>
  </div>
</template>
