<script setup lang="ts">
import { NavigationMenuTrigger } from '@ui-sdk/vue/navigation-menu'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './NavigationMenu.styles'
import type { NvNavigationMenuTriggerProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvNavigationMenuTriggerProps>(), { disabled: false })

const sx = computed(() => stylex.props(styles.trigger, focus.subtle))

function chevronSx(open: boolean) {
  return stylex.props(styles.chevron, open && styles.chevronOpen)
}
</script>

<template>
  <NavigationMenuTrigger
    v-slot="{ state }"
    v-bind="$attrs"
    :disabled="disabled"
    :class="[sx.className]"
    :style="[sx.style]"
  >
    <slot />
    <NvIcon name="chevron-down"
      :size="14"
      :class="chevronSx(state.open).className"
      :style="chevronSx(state.open).style"
    />
  </NavigationMenuTrigger>
</template>
