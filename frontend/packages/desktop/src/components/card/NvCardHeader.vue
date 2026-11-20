<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Card.styles'

defineOptions({ inheritAttrs: false })

const sx = computed(() => stylex.props(styles.header))
</script>

<template>
  <div v-bind="$attrs" :class="[sx.className, $attrs.class]" :style="[sx.style, $attrs.style]">
    <slot />
  </div>
</template>
