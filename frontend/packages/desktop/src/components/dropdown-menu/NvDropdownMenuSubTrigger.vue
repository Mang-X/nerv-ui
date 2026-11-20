<script setup lang="ts">
import { MenuSubTrigger } from '@ui-sdk/vue/menu'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './DropdownMenu.styles'

defineOptions({ inheritAttrs: false })

const sx = computed(() => stylex.props(styles.item))
</script>

<template>
  <MenuSubTrigger :class="[sx.className, $attrs.class]" :style="[sx.style, $attrs.style]" v-bind="$attrs">
    <slot />
    <NvIcon name="chevron-right" :size="14" />
  </MenuSubTrigger>
</template>
