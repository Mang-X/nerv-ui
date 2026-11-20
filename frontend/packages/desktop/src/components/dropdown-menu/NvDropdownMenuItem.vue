<script setup lang="ts">
import { MenuItem } from '@ui-sdk/vue/menu'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './DropdownMenu.styles'
import type { NvDropdownMenuItemProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvDropdownMenuItemProps>(), { disabled: false, destructive: false })

const sx = computed(() => stylex.props(styles.item))
const destructiveSx = computed(() => stylex.props(styles.destructive))
</script>

<template>
  <MenuItem
    v-bind="$attrs"
    :value="value"
    :label="label"
    :disabled="disabled"
    :shortcut="shortcut"
    :destructive="destructive"
    :class="[sx.className, destructive && destructiveSx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <slot />
    <span v-if="shortcut" :class="stylex.props(styles.shortcut).className">{{ shortcut }}</span>
  </MenuItem>
</template>
