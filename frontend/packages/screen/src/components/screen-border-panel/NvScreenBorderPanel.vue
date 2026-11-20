<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, useSlots } from 'vue'
import { styles } from './BorderPanel.styles'

/**
 * 大屏装饰面板：带顶部缺口、四角短标记与可选标题的分区容器。
 * 纯装饰容器，无交互。
 */
const props = defineProps<{ title?: string }>()
const slots = useSlots()

const rootSx = computed(() => stylex.props(styles.root))
const notchSx = computed(() => stylex.props(styles.notch))
const headerSx = computed(() => stylex.props(styles.header))
const titleSx = computed(() => stylex.props(styles.title))
const bodySx = computed(() => stylex.props(styles.body))
const cornerSx = computed(() => stylex.props(styles.corner))
const showHeader = computed(() => Boolean(props.title || slots.title))
</script>

<template>
  <section :class="rootSx.className" :style="rootSx.style">
    <span :class="notchSx.className" :style="notchSx.style" />
    <span :class="cornerSx.className" :style="[cornerSx.style, { top: -1, left: -1, borderTopLeftRadius: 16 }]" />
    <span :class="cornerSx.className" :style="[cornerSx.style, { top: -1, right: -1, borderTopRightRadius: 16 }]" />
    <span :class="cornerSx.className" :style="[cornerSx.style, { bottom: -1, left: -1, borderBottomLeftRadius: 16 }]" />
    <span :class="cornerSx.className" :style="[cornerSx.style, { bottom: -1, right: -1, borderBottomRightRadius: 16 }]" />
    <div v-if="showHeader" :class="headerSx.className" :style="headerSx.style">
      <span :class="titleSx.className" :style="titleSx.style">
        <slot name="title">{{ props.title }}</slot>
      </span>
    </div>
    <div :class="bodySx.className" :style="bodySx.style">
      <slot />
    </div>
  </section>
</template>
