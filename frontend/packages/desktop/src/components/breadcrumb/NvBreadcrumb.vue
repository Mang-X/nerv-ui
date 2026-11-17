<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Breadcrumb.styles'
import type { NvBreadcrumbProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvBreadcrumbProps>(), { label: '面包屑' })

const navSx = computed(() => stylex.props(styles.nav))
const listSx = computed(() => stylex.props(styles.list))
</script>

<template>
  <nav
    v-bind="$attrs"
    :aria-label="label"
    :class="[navSx.className, $attrs.class]"
    :style="[navSx.style, $attrs.style]"
  >
    <ol :class="listSx.className" :style="listSx.style">
      <slot />
    </ol>
  </nav>
</template>
