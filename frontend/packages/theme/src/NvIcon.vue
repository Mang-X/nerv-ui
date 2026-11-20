<script setup lang="ts">
import { computed } from 'vue'
import { ICON_MARKUP } from './icons'

// markup 只来自 ./icons.ts 的内置常量表，不接受任何用户输入，因此 v-html 在这里
// 是受控的静态内容渲染，而不是注入面。
const props = withDefaults(defineProps<{ name: string; size?: number; strokeWidth?: number }>(), {
  size: 16,
  strokeWidth: 1.25,
})
const markup = computed(() => ICON_MARKUP[props.name] ?? '')
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-html="markup"
  />
</template>
