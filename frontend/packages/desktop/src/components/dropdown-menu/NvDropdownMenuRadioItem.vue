<script setup lang="ts">
import { MenuItemIndicator, MenuRadioItem } from '@ui-sdk/vue/menu'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './DropdownMenu.styles'
import type { NvDropdownMenuRadioItemProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvDropdownMenuRadioItemProps>(), { disabled: false })

const sx = computed(() => stylex.props(styles.item))
const indicatorSx = computed(() => stylex.props(styles.indicatorSlot))
</script>

<template>
  <MenuRadioItem
    v-bind="$attrs"
    :value="value"
    :label="label"
    :disabled="disabled"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <MenuItemIndicator :class="indicatorSx.className" :style="indicatorSx.style">
      <NvIcon name="check" :size="14" />
    </MenuItemIndicator>
    <slot />
  </MenuRadioItem>
</template>
