<script setup lang="ts">
import { TabsList } from '@ui-sdk/vue/tabs'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Tabs.styles'

defineOptions({ inheritAttrs: false })

const sx = computed(() => stylex.props(styles.list))
</script>

<template>
  <TabsList v-bind="$attrs" :class="[sx.className]" :style="[sx.style]">
    <slot />
  </TabsList>
</template>
