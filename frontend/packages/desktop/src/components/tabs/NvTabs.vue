<script setup lang="ts">
import { Tabs } from '@ui-sdk/vue/tabs'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Tabs.styles'
import type { NvTabsProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvTabsProps>(), {
  orientation: 'horizontal',
  activation: 'automatic',
  loop: true,
})


const sx = computed(() => stylex.props(styles.root))
</script>

<template>
  <Tabs
    v-bind="$attrs"
    :value="value"
    :default-value="defaultValue"
    :orientation="orientation"
    :activation="activation"
    :loop="loop"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <slot />
  </Tabs>
</template>
