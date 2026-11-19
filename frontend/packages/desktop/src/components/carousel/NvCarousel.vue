<script setup lang="ts">
import NvIcon from '../../theme/NvIcon.vue'
import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselIndicatorGroup,
  CarouselNext,
  CarouselPlayToggle,
  CarouselPrevious,
  CarouselViewport,
} from '@ui-sdk/vue/carousel'
import * as stylex from '@stylexjs/stylex'
import { computed, provide } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Carousel.styles'
import { CAROUSEL_CONTEXT } from './context'
import type { NvCarouselProps } from './types'

// `v-model:page` / `v-model:playing` arrive through $attrs and must be
// forwarded untouched: ui-sdk treats an attached `onUpdate:*` listener as a
// controller, so the wrapper never attaches one itself.
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvCarouselProps>(), {
  page: undefined,
  defaultPage: undefined,
  orientation: 'horizontal',
  align: undefined,
  slidesPerPage: undefined,
  loop: undefined,
  drag: true,
  dragFree: undefined,
  skipSnaps: undefined,
  interval: undefined,
  playing: undefined,
  defaultPlaying: undefined,
  controls: true,
  arrowVisibility: 'always',
  indicators: true,
  indicatorType: 'dot',
  playToggle: false,
  gap: 12,
  label: '轮播',
})

const vertical = computed(() => props.orientation === 'vertical')

/** 幻灯片按这个宽度分屏；`auto` 交给 ui-sdk 自己量，不能用数字算。 */
const perPage = computed(() => (typeof props.slidesPerPage === 'number' ? props.slidesPerPage : 1))

provide(
  CAROUSEL_CONTEXT,
  computed(() => ({ gap: props.gap, perPage: perPage.value })),
)

const rootSx = computed(() => stylex.props(styles.root, vertical.value ? styles.rootV : null))
const frameSx = computed(() => stylex.props(styles.frame, vertical.value ? styles.frameV : null))
const viewportSx = computed(() =>
  stylex.props(styles.viewport, vertical.value ? styles.viewportV : null, focus.subtle),
)
const contentSx = computed(() => stylex.props(styles.content))
const previousSx = computed(() =>
  stylex.props(styles.control, vertical.value ? null : styles.previousH, focus.ring),
)
const nextSx = computed(() =>
  stylex.props(styles.control, vertical.value ? null : styles.nextH, focus.ring),
)
const actionsSx = computed(() => stylex.props(styles.actions))
const footerSx = computed(() => stylex.props(styles.footer))
const indicatorsSx = computed(() => stylex.props(styles.indicators))
const indicatorSx = computed(() => stylex.props(styles.indicator, focus.subtle))
const markSx = computed(() =>
  stylex.props(props.indicatorType === 'line' ? styles.markLine : styles.markDot),
)
const progressSx = computed(() => stylex.props(styles.progress))
const countSx = computed(() => stylex.props(styles.count))
const countCurrentSx = computed(() => stylex.props(styles.countCurrent))
const srOnlySx = computed(() => stylex.props(styles.srOnly))
const playSx = computed(() => stylex.props(styles.play, focus.subtle))

/** 竖向轮播时「上/下」比「前/后」直白得多，图标跟着方向换。 */
const previousIcon = computed(() => (vertical.value ? 'chevron-up' : 'chevron-left'))
const nextIcon = computed(() => (vertical.value ? 'chevron-down' : 'chevron-right'))

/**
 * 根上的内联变量：间距供 content 的 gap 与幻灯片的宽度计算共用，
 * 间隔供进度条动画读——它不是固定值，动画时长必须跟着 `interval` 走。
 */
const rootStyle = computed(() => ({
  '--nv-carousel-gap': `${props.gap}px`,
  '--nv-carousel-interval': `${props.interval ?? 5000}ms`,
}))
</script>

<template>
  <Carousel
    v-bind="omitClassStyle($attrs)"
    v-slot="{ state }"
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
    :style="[rootSx.style, rootStyle, $attrs.style]"
  >
    <div :class="frameSx.className" :style="frameSx.style" :data-arrows="arrowVisibility">
      <CarouselViewport
        :class="viewportSx.className"
        :style="viewportSx.style"
        :data-grab="drag ? '' : undefined"
      >
        <CarouselContent :class="contentSx.className" :style="contentSx.style">
          <slot />
        </CarouselContent>
      </CarouselViewport>

      <!-- 箭头排在轨道之前，与 Aero 一致：键盘 Tab 先到按钮，再进入内容。
           竖向轮播不吃这套——内容满宽，压在边上必然盖字，箭头改落到底栏。 -->
      <template v-if="controls && !vertical">
        <CarouselPrevious
          :class="previousSx.className"
          :style="previousSx.style"
          aria-label="上一页"
        >
          <NvIcon :name="previousIcon" :size="18" />
        </CarouselPrevious>
        <CarouselNext :class="nextSx.className" :style="nextSx.style" aria-label="下一页">
          <NvIcon :name="nextIcon" :size="18" />
        </CarouselNext>
      </template>
    </div>

    <div
      v-if="indicators || playToggle || (vertical && controls)"
      :class="footerSx.className"
      :style="footerSx.style"
    >
      <!-- 计数形态与圆点形态互斥，但两者都占中栏，播放按钮不会挤动它们。 -->
      <span
        v-if="indicators && indicatorType === 'number'"
        :class="countSx.className"
        :style="countSx.style"
      >
        <span :class="countCurrentSx.className" :style="countCurrentSx.style">{{
          state.page
        }}</span>
        <span aria-hidden="true">/</span>
        <span aria-hidden="true">{{ state.pageCount ?? '–' }}</span>
        <span :class="srOnlySx.className" :style="srOnlySx.style">
          第 {{ state.page }} 页，共 {{ state.pageCount ?? 0 }} 页
        </span>
      </span>

      <CarouselIndicatorGroup
        v-else-if="indicators"
        v-slot="{ state: groupState }"
        :class="indicatorsSx.className"
        :style="indicatorsSx.style"
        aria-label="选择页"
      >
        <CarouselIndicator
          v-for="index in groupState.pageCount ?? 0"
          :key="index"
          v-slot="{ state: indicatorState }"
          :page="index"
          :aria-label="`第 ${index} 页`"
          :class="indicatorSx.className"
          :style="indicatorSx.style"
        >
          <span
            :class="markSx.className"
            :style="markSx.style"
            :data-selected="indicatorState.selected ? '' : undefined"
            :data-playing="state.playing ? '' : undefined"
          >
            <!-- 进度填充只在「自动轮播 + 选中」时出现；停住时不画一条空槽。
                 `data-progress` 是根上「自动轮播暂停」规则的落点。 -->
            <span
              v-if="state.playing && indicatorState.selected"
              :class="progressSx.className"
              :style="progressSx.style"
              data-progress
              aria-hidden="true"
            />
          </span>
        </CarouselIndicator>
      </CarouselIndicatorGroup>

      <span v-else />

      <div :class="actionsSx.className" :style="actionsSx.style">
        <template v-if="vertical && controls">
          <CarouselPrevious
            :class="previousSx.className"
            :style="previousSx.style"
            aria-label="上一页"
          >
            <NvIcon :name="previousIcon" :size="18" />
          </CarouselPrevious>
          <CarouselNext :class="nextSx.className" :style="nextSx.style" aria-label="下一页">
            <NvIcon :name="nextIcon" :size="18" />
          </CarouselNext>
        </template>
        <CarouselPlayToggle
          v-if="playToggle"
          :class="playSx.className"
          :style="playSx.style"
          :aria-label="state.playing ? '暂停自动轮播' : '开始自动轮播'"
          :title="state.playing ? '暂停自动轮播' : '开始自动轮播'"
        >
          <NvIcon :name="state.playing ? 'pause' : 'play'" :size="14" />
        </CarouselPlayToggle>
      </div>
    </div>
  </Carousel>
</template>
