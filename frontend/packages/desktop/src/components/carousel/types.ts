import type {
  CarouselAlign,
  CarouselOrientation,
  CarouselSlidesPerPage,
} from '@ui-sdk/vue/carousel'

/** 页码指示的形态：圆点、分段细线、页码计数。 */
export type NvCarouselIndicatorType = 'dot' | 'line' | 'number'

/** 翻页箭头常显，还是只在悬停 / 键盘聚焦轮播时浮现。 */
export type NvCarouselArrowVisibility = 'always' | 'hover'

export interface NvCarouselProps {
  /** Controlled page, from 1 (`v-model:page`). */
  page?: number
  /** Page shown first when uncontrolled. */
  defaultPage?: number
  orientation?: CarouselOrientation
  align?: CarouselAlign
  /** How many slides one page holds. */
  slidesPerPage?: CarouselSlidesPerPage
  loop?: boolean
  drag?: boolean
  dragFree?: boolean
  skipSnaps?: boolean
  /** Rotation interval in milliseconds. */
  interval?: number
  /** Controlled rotation (`v-model:playing`). */
  playing?: boolean
  defaultPlaying?: boolean
  /** Shows the previous/next buttons. */
  controls?: boolean
  /** Whether the buttons stay visible or fade in on hover/focus. */
  arrowVisibility?: NvCarouselArrowVisibility
  /** Shows the page indicators. */
  indicators?: boolean
  /** Indicator look: dots, segmented bars, or a "1 / 4" counter. */
  indicatorType?: NvCarouselIndicatorType
  /** Shows a play/pause button, for carousels that rotate. */
  playToggle?: boolean
  /** Gap between slides, in pixels. Items size themselves from it. */
  gap?: number
  /** Accessible name for the carousel. */
  label?: string
}

export interface NvCarouselItemProps {
  /** Accessible name for this slide; defaults to "N of M". */
  label?: string
  /**
   * Slide width. Left out, a slide shares the track with `slidesPerPage`
   * others; set it for peeks (`70%`) or asymmetric layouts.
   */
  basis?: string
}
