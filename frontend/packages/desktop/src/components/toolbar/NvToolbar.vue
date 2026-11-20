<script setup lang="ts">
import { Toolbar } from '@ui-sdk/vue/toolbar'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Toolbar.styles'
import type { NvToolbarProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvToolbarProps>(), {
  orientation: undefined,
  loop: undefined,
  disabled: false,
})

const sx = computed(() => stylex.props(styles.root))
</script>

<template>
  <Toolbar
    v-bind="omitClassStyle($attrs)"
    :orientation="orientation"
    :loop="loop"
    :disabled="disabled"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <slot />
  </Toolbar>
</template>
