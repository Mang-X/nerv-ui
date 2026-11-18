<script setup lang="ts">
import { TabsIndicator, TabsList } from '@ui-sdk/vue/tabs'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Tabs.styles'

defineOptions({ inheritAttrs: false })

const listSx = computed(() => stylex.props(styles.list))
const indicatorSx = computed(() => stylex.props(styles.indicator))
</script>

<template>
  <TabsList v-bind="$attrs" :class="[listSx.className]" :style="[listSx.style]">
    <!-- ui-sdk 量出当前标签盒子并写入 --active-tab-*，滑动由 indicator 的 transition 完成。 -->
    <TabsIndicator :class="indicatorSx.className" :style="indicatorSx.style" />
    <slot />
  </TabsList>
</template>
