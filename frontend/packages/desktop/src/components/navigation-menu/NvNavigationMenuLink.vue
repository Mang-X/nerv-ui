<script setup lang="ts">
import { NavigationMenuLink } from '@ui-sdk/vue/navigation-menu'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './NavigationMenu.styles'
import type { NvNavigationMenuLinkProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvNavigationMenuLinkProps>(), {
  href: undefined,
  current: false,
  closeOnSelect: undefined,
})

const sx = computed(() => stylex.props(styles.link, focus.subtle))
</script>

<template>
  <NavigationMenuLink
    v-bind="$attrs"
    :href="href"
    :current="current"
    :close-on-select="closeOnSelect"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <slot />
  </NavigationMenuLink>
</template>
