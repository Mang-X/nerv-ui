<script setup lang="ts">
import { SelectTrigger } from '@ui-sdk/vue/select'
import { ChevronDownIcon } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Select.styles'
import type { NvSelectTriggerProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvSelectTriggerProps>(), { disabled: false, hideChevron: false })

const sx = computed(() => stylex.props(styles.trigger, focus.ring))
const chevronSx = computed(() => stylex.props(styles.chevron))
</script>

<template>
  <SelectTrigger
    v-bind="$attrs"
    :disabled="disabled"
    :class="[sx.className]"
    :style="[sx.style]"
  >
    <slot />
    <ChevronDownIcon
      v-if="!hideChevron"
      :size="16"
      aria-hidden="true"
      :class="chevronSx.className"
      :style="chevronSx.style"
    />
  </SelectTrigger>
</template>
