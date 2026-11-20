<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { styles } from './ChartChrome.styles'

defineProps<{
  items: { label: string; color: string; meta?: string }[]
}>()

const legendSx = stylex.props(styles.legend)
const itemSx = stylex.props(styles.legendItem)
const dotSx = stylex.props(styles.legendDot)
const labelSx = stylex.props(styles.legendLabel)
const metaSx = stylex.props(styles.legendMeta)
</script>

<template>
  <div :class="legendSx.className">
    <span v-for="item in items" :key="item.label" :class="itemSx.className">
      <span :class="dotSx.className" :style="{ backgroundColor: item.color }" />
      <span :class="labelSx.className">{{ item.label }}</span>
      <span v-if="item.meta" :class="metaSx.className">{{ item.meta }}</span>
    </span>
  </div>
</template>
