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
import { computed } from 'vue'
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
    >
      <ScrollAreaContent :class="contentSx.className" :style="contentSx.style">
        <slot />
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
