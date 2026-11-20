<script setup lang="ts">
import { TabsPanel } from '@ui-sdk/vue/tabs'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Tabs.styles'
import type { NvTabsPanelProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvTabsPanelProps>(), { keepMounted: false })

const sx = computed(() => stylex.props(styles.panel, focus.subtle))
</script>

<template>
  <TabsPanel
    v-bind="$attrs"
    :value="value"
    :keep-mounted="keepMounted"
    :class="[sx.className]"
    :style="[sx.style]"
  >
    <slot />
  </TabsPanel>
</template>
