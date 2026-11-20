<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { glass } from '../../theme/shared.stylex'
import { styles } from './ChartChrome.styles'
import type { ChartTooltipItem } from './chart'

const props = defineProps<{
  visible: boolean
  x: number
  y: number
  title?: string
  items: ChartTooltipItem[]
}>()

const surfaceSx = computed(() => stylex.props(glass.surface, styles.tooltip))
const titleSx = stylex.props(styles.tooltipTitle)
const rowSx = stylex.props(styles.tooltipRow)
const dotSx = stylex.props(styles.tooltipDot)
const labelSx = stylex.props(styles.tooltipLabel)
const valueSx = stylex.props(styles.tooltipValue)
const positionStyle = computed(() => ({ left: `${props.x}px`, top: `${props.y}px` }))
</script>

<template>
  <div
    v-show="visible"
    :class="surfaceSx.className"
    :style="[surfaceSx.style, positionStyle]"
    aria-hidden="true"
  >
    <div v-if="title" :class="titleSx.className">{{ title }}</div>
    <div v-for="(item, index) in items" :key="`${item.label}-${index}`" :class="rowSx.className">
      <span :class="dotSx.className" :style="{ backgroundColor: item.color }" />
      <span :class="labelSx.className">{{ item.label }}</span>
      <span :class="valueSx.className">{{ item.value }}</span>
    </div>
  </div>
</template>
