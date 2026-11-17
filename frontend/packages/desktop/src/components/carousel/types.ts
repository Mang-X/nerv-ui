import type {
  CarouselAlign,
  CarouselOrientation,
  CarouselSlidesPerPage,
} from '@ui-sdk/vue/carousel'

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
  /** Shows the page indicators. */
  indicators?: boolean
  /** Accessible name for the carousel. */
  label?: string
}

export interface NvCarouselItemProps {
  /** Accessible name for this slide; defaults to "N of M". */
  label?: string
  /** Slide width. Use `100%` for one per page, or a share for several. */
  basis?: string
}
