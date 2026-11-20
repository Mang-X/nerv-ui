<script setup lang="ts">
import { MenuSeparator } from '@ui-sdk/vue/menu'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './DropdownMenu.styles'

defineOptions({ inheritAttrs: false })

const sx = computed(() => stylex.props(styles.separator))
</script>

<template>
  <MenuSeparator :class="[sx.className, $attrs.class]" :style="[sx.style, $attrs.style]" v-bind="$attrs" />
</template>
