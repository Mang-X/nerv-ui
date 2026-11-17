<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/vue'
import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselIndicatorGroup,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from '@ui-sdk/vue/carousel'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Carousel.styles'
import type { NvCarouselProps } from './types'

// `v-model:page` / `v-model:playing` arrive through $attrs and must be
// forwarded untouched: ui-sdk treats an attached `onUpdate:*` listener as a
// controller, so the wrapper never attaches one itself.
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvCarouselProps>(), {
  page: undefined,
  defaultPage: undefined,
  orientation: undefined,
  align: undefined,
  slidesPerPage: undefined,
  loop: undefined,
  drag: undefined,
  dragFree: undefined,
  skipSnaps: undefined,
  interval: undefined,
  playing: undefined,
  defaultPlaying: undefined,
  controls: true,
  indicators: true,
  label: '轮播',
})

const rootSx = computed(() => stylex.props(styles.root))
const frameSx = computed(() => stylex.props(styles.frame))
const viewportSx = computed(() => stylex.props(styles.viewport, focus.subtle))
const contentSx = computed(() => stylex.props(styles.content))
const previousSx = computed(() => stylex.props(styles.control, styles.previous, focus.ring))
const nextSx = computed(() => stylex.props(styles.control, styles.next, focus.ring))
const indicatorsSx = computed(() => stylex.props(styles.indicators))
const indicatorSx = computed(() => stylex.props(styles.indicator, focus.subtle))
</script>

<template>
  <Carousel
    v-bind="omitClassStyle($attrs)"
    :page="page"
    :default-page="defaultPage"
    :orientation="orientation"
    :align="align"
    :slides-per-page="slidesPerPage"
    :loop="loop"
    :drag="drag"
    :drag-free="dragFree"
    :skip-snaps="skipSnaps"
    :interval="interval"
    :playing="playing"
    :default-playing="defaultPlaying"
    :aria-label="label"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <div :class="frameSx.className" :style="frameSx.style">
      <CarouselViewport :class="viewportSx.className" :style="viewportSx.style">
        <CarouselContent :class="contentSx.className" :style="contentSx.style">
          <slot />
        </CarouselContent>
      </CarouselViewport>
      <CarouselPrevious
        v-if="controls"
        :class="previousSx.className"
        :style="previousSx.style"
        aria-label="上一页"
      >
        <ChevronLeftIcon :size="18" aria-hidden="true" />
      </CarouselPrevious>
      <CarouselNext
        v-if="controls"
        :class="nextSx.className"
        :style="nextSx.style"
        aria-label="下一页"
      >
        <ChevronRightIcon :size="18" aria-hidden="true" />
      </CarouselNext>
    </div>
    <CarouselIndicatorGroup
      v-if="indicators"
      v-slot="{ state }"
      :class="indicatorsSx.className"
      :style="indicatorsSx.style"
      aria-label="选择页"
    >
      <CarouselIndicator
        v-for="index in state.pageCount ?? 0"
        :key="index"
        :page="index"
        :aria-label="`第 ${index} 页`"
        :class="indicatorSx.className"
        :style="indicatorSx.style"
      />
    </CarouselIndicatorGroup>
  </Carousel>
</template>
