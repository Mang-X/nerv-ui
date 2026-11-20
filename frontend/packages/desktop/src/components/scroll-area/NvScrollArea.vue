<script setup lang="ts">
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from '@ui-sdk/vue/scroll-area'
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { focus } from '../../theme/shared.stylex'
import { styles } from './ScrollArea.styles'
import type { NvScrollAreaProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvScrollAreaProps>(), {
  orientation: 'vertical',
  type: 'auto',
  scrollHideDelay: undefined,
  stickToEnd: undefined,
  height: undefined,
  maxHeight: undefined,
  label: undefined,
  virtual: false,
  itemSize: 32,
  itemCount: 0,
  overscan: 4,
})

const showsVertical = computed(
  () => props.orientation === 'vertical' || props.orientation === 'both',
)
const showsHorizontal = computed(
  () => props.orientation === 'horizontal' || props.orientation === 'both',
)

const rootSx = computed(() => stylex.props(styles.root))
const viewportSx = computed(() => stylex.props(styles.viewport, focus.subtle))
const contentSx = computed(() => stylex.props(styles.content))
const verticalScrollbarSx = computed(() => stylex.props(styles.scrollbar, styles.scrollbarVertical))
const horizontalScrollbarSx = computed(() =>
  stylex.props(styles.scrollbar, styles.scrollbarHorizontal),
)
const thumbSx = computed(() => stylex.props(styles.thumb))
const cornerSx = computed(() => stylex.props(styles.corner))

const sizeStyle = computed(() => ({
  height: props.height === undefined ? undefined : cssSize(props.height),
  maxHeight: props.maxHeight === undefined ? undefined : cssSize(props.maxHeight),
}))

function cssSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}

/**
 * 虚拟滚动：高度按 `itemCount * itemSize` 撑出一个占位块，只渲染窗口内的行。
 * 行内容由 `#item="{ index }"` 插槽提供，滚动位置直接读 viewport 的 scrollTop。
 */
const windowed = computed(() => props.virtual && props.itemCount > 0)
const totalSize = computed(() => props.itemCount * props.itemSize)
const scrollTop = ref(0)
const viewportHeight = ref(0)

const startIndex = computed(() => {
  if (!windowed.value) return 0
  return Math.max(0, Math.floor(scrollTop.value / props.itemSize) - props.overscan)
})
const endIndex = computed(() => {
  if (!windowed.value) return 0
  const visible = Math.ceil(viewportHeight.value / props.itemSize) || 1
  return Math.min(props.itemCount, startIndex.value + visible + props.overscan * 2)
})
const windowRows = computed(() => {
  const rows: number[] = []
  for (let index = startIndex.value; index < endIndex.value; index++) rows.push(index)
  return rows
})

function onViewportScroll(event: Event) {
  const el = event.target as HTMLElement | null
  if (!el) return
  scrollTop.value = el.scrollTop
  viewportHeight.value = el.clientHeight
}
</script>

<template>
  <ScrollArea
    v-bind="omitClassStyle($attrs)"
    :type="type"
    :scroll-hide-delay="scrollHideDelay"
    :stick-to-end="stickToEnd"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <ScrollAreaViewport
      :role="label ? 'region' : undefined"
      :aria-label="label"
      :class="viewportSx.className"
      :style="[viewportSx.style, sizeStyle]"
      @scroll="onViewportScroll"
    >
      <ScrollAreaContent :class="contentSx.className" :style="contentSx.style">
        <div v-if="windowed" :style="{ height: `${totalSize}px`, position: 'relative' }">
          <div :style="{ position: 'absolute', top: `${startIndex * itemSize}px`, insetInline: 0 }">
            <div
              v-for="index in windowRows"
              :key="index"
              :style="{ height: `${itemSize}px`, boxSizing: 'border-box' }"
            >
              <slot name="item" :index="index" />
            </div>
          </div>
        </div>
        <slot v-else />
      </ScrollAreaContent>
    </ScrollAreaViewport>
    <ScrollAreaScrollbar
      v-if="showsVertical"
      orientation="vertical"
      :class="verticalScrollbarSx.className"
      :style="verticalScrollbarSx.style"
    >
      <ScrollAreaThumb :class="thumbSx.className" :style="thumbSx.style" />
    </ScrollAreaScrollbar>
    <ScrollAreaScrollbar
      v-if="showsHorizontal"
      orientation="horizontal"
      :class="horizontalScrollbarSx.className"
      :style="horizontalScrollbarSx.style"
    >
      <ScrollAreaThumb :class="thumbSx.className" :style="thumbSx.style" />
    </ScrollAreaScrollbar>
    <ScrollAreaCorner
      v-if="showsVertical && showsHorizontal"
      :class="cornerSx.className"
      :style="cornerSx.style"
    />
  </ScrollArea>
</template>
