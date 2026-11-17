<script setup lang="ts">
import { Input, InputClear, InputGroup } from '@ui-sdk/vue/input'
import { XIcon } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed, ref, useAttrs, useId } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './TouchInput.styles'
import type { TouchInputProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TouchInputProps>(), {
  modelValue: undefined,
  defaultValue: '',
  type: 'text',
  placeholder: undefined,
  label: undefined,
  hint: undefined,
  name: undefined,
  autocomplete: undefined,
  inputMode: undefined,
  disabled: false,
  readOnly: false,
  required: false,
  invalid: false,
  clearable: false,
  clearLabel: '清除',
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const attrs = useAttrs()
const uid = useId()

// Local state carries the uncontrolled case: the field stays usable (and emits)
// when no `v-model` is attached, while the prop always wins once it is.
const inner = ref(props.defaultValue)
const value = computed({
  get: () => props.modelValue ?? inner.value,
  set: (next: string) => {
    inner.value = next
    emit('update:modelValue', next)
  },
})

const fieldId = computed(() => (attrs.id as string | undefined) ?? `nv-touch-input-${uid}`)
const hintId = `nv-touch-input-hint-${uid}`
const forwardedAttrs = computed(() => {
  const rest = omitClassStyle(attrs)
  delete rest.id
  return rest
})

const rootSx = computed(() => stylex.props(styles.root))
const labelSx = computed(() => stylex.props(styles.label))
const groupSx = computed(() =>
  stylex.props(styles.group, focus.ring, props.invalid && styles.invalid),
)
const inputSx = computed(() => stylex.props(styles.input))
const affixSx = computed(() => stylex.props(styles.affix))
const clearSx = computed(() => stylex.props(styles.clear, focus.ring))
const hintSx = computed(() => stylex.props(styles.hint, props.invalid && styles.hintInvalid))
</script>

<template>
  <div :class="[rootSx.className, $attrs.class]" :style="[rootSx.style, $attrs.style]">
    <label v-if="label" :for="fieldId" :class="labelSx.className" :style="labelSx.style">
      {{ label }}
    </label>
    <InputGroup :class="groupSx.className" :style="groupSx.style">
      <span v-if="$slots.prefix" :class="affixSx.className" :style="affixSx.style">
        <slot name="prefix" />
      </span>
      <Input
        v-model="value"
        v-bind="forwardedAttrs"
        :id="fieldId"
        :type="type"
        :placeholder="placeholder"
        :name="name"
        :autocomplete="autocomplete"
        :inputmode="inputMode"
        :disabled="disabled"
        :read-only="readOnly"
        :required="required"
        :aria-invalid="invalid || undefined"
        :aria-describedby="hint ? hintId : undefined"
        :class="inputSx.className"
        :style="inputSx.style"
      />
      <span v-if="$slots.suffix" :class="affixSx.className" :style="affixSx.style">
        <slot name="suffix" />
      </span>
      <InputClear
        v-if="clearable"
        :aria-label="clearLabel"
        :class="clearSx.className"
        :style="clearSx.style"
      >
        <XIcon :size="24" aria-hidden="true" />
      </InputClear>
    </InputGroup>
    <p v-if="hint || $slots.hint" :id="hintId" :class="hintSx.className" :style="hintSx.style">
      <slot name="hint">{{ hint }}</slot>
    </p>
  </div>
</template>
