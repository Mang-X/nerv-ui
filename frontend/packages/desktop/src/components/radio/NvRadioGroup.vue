<script setup lang="ts">
import { RadioGroup } from '@ui-sdk/vue/radio'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Radio.styles'
import type { NvRadioGroupProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvRadioGroupProps>(), { value: undefined, 
  disabled: false,
  readOnly: false,
  required: false,
})


const sx = computed(() => stylex.props(styles.group))
</script>

<template>
  <RadioGroup
    v-bind="$attrs"
    :value="value"
    :default-value="defaultValue"
    :disabled="disabled"
    :read-only="readOnly"
    :required="required"
    :name="name"
    :class="[sx.className]"
    :style="[sx.style]"
  >
    <slot />
  </RadioGroup>
</template>
