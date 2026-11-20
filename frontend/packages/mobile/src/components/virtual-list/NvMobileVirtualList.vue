<script setup lang="ts" generic="T">
import * as stylex from '@stylexjs/stylex'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { styles } from './VirtualList.styles'

/**
 * 定高虚拟列表：只渲染可见窗口加缓冲行，万级数据也能顺。
 *
 * 必须给一个有界高度（通过 `class` 或 `style`），并给出 `itemHeight`（像素）。
 * 行高固定是这份实现的前提——行高不定就得逐行测量，那是另一套复杂度。
 */
const props = withDefaults(
  defineProps<{ items: T[]; itemHeight: number; buffer?: number }>(),
  { buffer: 6 },
)

defineSlots<{ default: (props: { item: T; index: number }) => unknown }>()

const viewport = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const height = ref(0)

const total = computed(() => props.items.length * props.itemHeight)
const start = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.buffer),
)
const end = computed(() => {
  const visible = Math.ceil(height.value / props.itemHeight) + props.buffer * 2
  return Math.min(props.items.length, start.value + visible)
})
const window = computed(() => props.items.slice(start.value, end.value))
const offsetY = computed(() => start.value * props.itemHeight)

let observer: ResizeObserver | undefined
const measure = () => {
  height.value = viewport.value?.clientHeight ?? 0
}

onMounted(() => {
  measure()
  if (typeof ResizeObserver !== 'undefined' && viewport.value) {
    observer = new ResizeObserver(measure)
    observer.observe(viewport.value)
  }
})
onBeforeUnmount(() => observer?.disconnect())

const sx = computed(() => ({
  viewport: stylex.props(styles.viewport),
  spacer: stylex.props(styles.spacer),
}))
</script>

<template>
  <div
    ref="viewport"
    :class="[sx.viewport.className, $attrs.class]"
    :style="[sx.viewport.style, $attrs.style]"
    @scroll="scrollTop = viewport?.scrollTop ?? 0"
  >
    <div :class="sx.spacer.className" :style="[sx.spacer.style, { height: `${total}px` }]">
      <div :style="{ transform: `translateY(${offsetY}px)` }">
        <div v-for="(item, i) in window" :key="start + i" :style="{ height: `${itemHeight}px` }">
          <slot :item="item" :index="start + i" />
        </div>
      </div>
    </div>
  </div>
</template>
