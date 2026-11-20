<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Breadcrumb.styles'
import type { NvBreadcrumbLinkProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvBreadcrumbLinkProps>(), {
  href: undefined,
  current: false,
})

const sx = computed(() => stylex.props(styles.link, focus.subtle, props.current && styles.current))
</script>

<template>
  <a
    v-if="href && !current"
    v-bind="$attrs"
    :href="href"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <slot />
  </a>
  <span
    v-else
    v-bind="$attrs"
    :aria-current="current ? 'page' : undefined"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <slot />
  </span>
</template>
