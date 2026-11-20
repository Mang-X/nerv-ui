<script setup lang="ts">
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Breadcrumb.styles'

defineOptions({ inheritAttrs: false })

const sx = computed(() => stylex.props(styles.separator))
</script>

<template>
  <li
    v-bind="$attrs"
    aria-hidden="true"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <slot>
      <NvIcon name="chevron-right" :size="14" />
    </slot>
  </li>
</template>
