<script setup lang="ts">
import { MenuCheckboxItem, MenuItemIndicator } from '@ui-sdk/vue/menu'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './DropdownMenu.styles'
import type { NvDropdownMenuCheckboxItemProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvDropdownMenuCheckboxItemProps>(), { disabled: false })

const sx = computed(() => stylex.props(styles.item))
const indicatorSx = computed(() => stylex.props(styles.indicatorSlot))
</script>

<template>
  <MenuCheckboxItem
    v-bind="$attrs"
    :value="value"
    :checked="checked"
    :default-checked="defaultChecked"
    :label="label"
    :disabled="disabled"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <MenuItemIndicator :class="indicatorSx.className" :style="indicatorSx.style">
      <NvIcon name="check" :size="14" />
    </MenuItemIndicator>
    <slot />
  </MenuCheckboxItem>
</template>
