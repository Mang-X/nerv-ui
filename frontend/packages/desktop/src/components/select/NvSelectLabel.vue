<script setup lang="ts">
import { SelectLabel } from '@ui-sdk/vue/select'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Select.styles'
import type { NvSelectLabelProps } from './types'

defineOptions({ inheritAttrs: false })

defineProps<NvSelectLabelProps>()

const sx = computed(() => stylex.props(styles.label))
</script>

<template>
  <SelectLabel v-bind="$attrs" :id="id" :class="[sx.className]" :style="[sx.style]">
    <slot />
  </SelectLabel>
</template>
