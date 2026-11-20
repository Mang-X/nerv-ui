<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Breadcrumb.styles'

defineOptions({ inheritAttrs: false })

const sx = computed(() => stylex.props(styles.item))
</script>

<template>
  <li v-bind="$attrs" :class="[sx.className, $attrs.class]" :style="[sx.style, $attrs.style]">
    <slot />
  </li>
</template>
