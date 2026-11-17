<script setup lang="ts">
import { NavigationMenu } from '@ui-sdk/vue/navigation-menu'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './NavigationMenu.styles'
import type { NvNavigationMenuProps } from './types'

// `v-model:value` and any event listener arrive through $attrs and are
// forwarded untouched: ui-sdk treats each attached `onUpdate:*` as a controller.
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvNavigationMenuProps>(), {
  delay: 50,
  closeDelay: 50,
  openOnHover: true,
  closeOnSelect: true,
  orientation: 'horizontal',
  label: '主导航',
})

const sx = computed(() => stylex.props(styles.root))
</script>

<template>
  <NavigationMenu
    v-bind="omitClassStyle($attrs)"
    :value="value"
    :default-value="defaultValue"
    :delay="delay"
    :close-delay="closeDelay"
    :open-on-hover="openOnHover"
    :close-on-select="closeOnSelect"
    :orientation="orientation"
    :aria-label="label"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <slot />
  </NavigationMenu>
</template>
