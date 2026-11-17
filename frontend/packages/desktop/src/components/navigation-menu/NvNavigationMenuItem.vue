<script setup lang="ts">
import { NavigationMenuItem } from '@ui-sdk/vue/navigation-menu'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './NavigationMenu.styles'

defineOptions({ inheritAttrs: false })

const sx = computed(() => stylex.props(styles.item))
</script>

<template>
  <NavigationMenuItem
    v-bind="$attrs"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <slot />
  </NavigationMenuItem>
</template>
