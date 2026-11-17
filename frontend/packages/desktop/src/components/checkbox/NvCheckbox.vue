<script setup lang="ts">
import { Checkbox, CheckboxIndicator } from '@ui-sdk/vue/checkbox'
import { CheckIcon, MinusIcon } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed, useId } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Checkbox.styles'
import type { NvCheckedState, NvCheckboxProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvCheckboxProps>(), { disabled: false, required: false })


const generatedId = useId()
const fieldId = computed(() => props.id ?? `nv-checkbox-${generatedId}`)

const rootSx = computed(() => stylex.props(styles.root))
const boxSx = computed(() => stylex.props(styles.box, focus.ring))
const indicatorSx = computed(() => stylex.props(styles.indicator))
const labelSx = computed(() => stylex.props(styles.label))
</script>

<template>
  <div :class="[rootSx.className, $attrs.class]" :style="[rootSx.style, $attrs.style]">
    <Checkbox
      v-bind="omitClassStyle($attrs)"
      :id="fieldId"
      :checked="checked"
      :default-checked="defaultChecked"
      :disabled="disabled"
      :required="required"
      :name="name"
      :class="boxSx.className"
      :style="boxSx.style"
    >
      <CheckboxIndicator :class="indicatorSx.className" :style="indicatorSx.style">
        <MinusIcon v-if="checked === 'indeterminate'" :size="12" aria-hidden="true" />
        <CheckIcon v-else :size="12" aria-hidden="true" />
      </CheckboxIndicator>
    </Checkbox>
    <label v-if="$slots.default || label" :for="fieldId" :class="labelSx.className" :style="labelSx.style">
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>
