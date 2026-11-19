<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { componentCovers, shapeProps, styles } from './covers'

/**
 * 组件封面：一张 120×80 的结构示意图，画在淡品牌色底上。
 *
 * 图形由 `covers.ts` 按组件 slug 提供；没有登记的组件画一个空面板，
 * 不是错误页——新增组件页时忘了补封面，卡片仍然可点、可读。
 */
const props = defineProps<{ slug: string }>()

const shapes = computed(() => componentCovers[props.slug]?.map(shapeProps) ?? [])
const sx = stylex.props(styles.plate)
const svgSx = stylex.props(styles.svg)
</script>

<template>
  <div :class="sx.className" :style="sx.style" aria-hidden="true">
    <svg :class="svgSx.className" :style="svgSx.style" viewBox="0 0 120 80" fill="none">
      <template v-for="(shape, index) in shapes" :key="index">
        <rect
          v-if="shape.type === 'rect'"
          :x="shape.x"
          :y="shape.y"
          :width="shape.w"
          :height="shape.h"
          :rx="shape.rx"
          :fill="shape.fill ? 'currentColor' : 'none'"
          :stroke="shape.fill ? 'none' : 'currentColor'"
          :stroke-width="shape.fill ? 0 : 1.25"
          :opacity="shape.opacity"
        />
        <circle
          v-else-if="shape.type === 'circle'"
          :cx="shape.cx"
          :cy="shape.cy"
          :r="shape.r"
          :fill="shape.fill ? 'currentColor' : 'none'"
          :stroke="shape.fill ? 'none' : 'currentColor'"
          :stroke-width="shape.fill ? 0 : 1.25"
          :opacity="shape.opacity"
        />
        <path
          v-else-if="shape.type === 'path'"
          :d="shape.d"
          :fill="shape.fill ? 'currentColor' : 'none'"
          :stroke="shape.fill ? 'none' : 'currentColor'"
          :stroke-width="shape.fill ? 0 : shape.width"
          stroke-linejoin="round"
          stroke-linecap="round"
          :opacity="shape.opacity"
        />
        <line
          v-else
          :x1="shape.x1"
          :y1="shape.y1"
          :x2="shape.x2"
          :y2="shape.y2"
          stroke="currentColor"
          stroke-width="1.25"
          stroke-linecap="round"
          :opacity="shape.opacity"
        />
      </template>
    </svg>
  </div>
</template>
