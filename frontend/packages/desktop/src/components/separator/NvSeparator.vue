<script setup lang="ts">
import { Separator } from '@ui-sdk/vue/separator'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Separator.styles'
import type { NvSeparatorProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvSeparatorProps>(), {
  orientation: 'horizontal',
  decorative: false,
})

const sx = computed(() => stylex.props(styles.root, styles[props.orientation]))
</script>

<template>
  <Separator
    v-bind="omitClassStyle($attrs)"
    :orientation="orientation"
    :decorative="decorative"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  />
</template>
