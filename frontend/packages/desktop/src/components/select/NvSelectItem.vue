<script setup lang="ts">
import { SelectItem, SelectItemIndicator, SelectItemText } from '@ui-sdk/vue/select'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Select.styles'
import type { NvSelectItemProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvSelectItemProps>(), { disabled: false })

const sx = computed(() => stylex.props(styles.item, focus.subtle))
const textSx = computed(() => stylex.props(styles.itemText))
const indicatorSx = computed(() => stylex.props(styles.indicator))
</script>

<template>
  <SelectItem
    v-bind="$attrs"
    :value="value"
    :label="label"
    :disabled="disabled"
    :class="[sx.className]"
    :style="[sx.style]"
  >
    <SelectItemText :class="textSx.className" :style="textSx.style">
      <slot>{{ label }}</slot>
    </SelectItemText>
    <SelectItemIndicator :class="indicatorSx.className" :style="indicatorSx.style">
      <NvIcon name="check" :size="14" />
    </SelectItemIndicator>
  </SelectItem>
</template>
