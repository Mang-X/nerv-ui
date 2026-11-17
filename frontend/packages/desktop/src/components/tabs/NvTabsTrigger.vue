<script setup lang="ts">
import { TabsTab } from '@ui-sdk/vue/tabs'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Tabs.styles'
import type { NvTabsTriggerProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvTabsTriggerProps>(), { disabled: false })

const sx = computed(() => stylex.props(styles.trigger, focus.subtle))
</script>

<template>
  <TabsTab
    v-bind="$attrs"
    :value="value"
    :disabled="disabled"
    :class="[sx.className]"
    :style="[sx.style]"
  >
    <slot />
  </TabsTab>
</template>
