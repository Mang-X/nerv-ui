<script setup lang="ts">
import { SelectContent } from '@ui-sdk/vue/select'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { glass, overlay, presence } from '../../theme/shared.stylex'
import { styles } from './Select.styles'
import type { NvSelectContentProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvSelectContentProps>(), {
  side: 'bottom',
  align: 'start',
})

const sx = computed(() =>
  stylex.props(glass.surface, overlay.panel, presence.fadeZoom, styles.content),
)
</script>

<template>
  <SelectContent
    v-bind="$attrs"
    :side="side"
    :align="align"
    :side-offset="sideOffset ?? 4"
    :class="[sx.className]"
    :style="[sx.style]"
  >
    <slot />
  </SelectContent>
</template>
