import type { ComputedRef, InjectionKey } from 'vue'

/**
 * 轮播把「间距 + 每屏张数」传给各张幻灯片，幻灯片据此自己算出宽度。
 * 有它之后 `slidesPerPage` 才不用再手写 `calc(50% - 6px)`——那个 6 是
 * 内容区 gap 的一半，改一次间距就要把所有 basis 跟着改一遍。
 */
export interface NvCarouselContext {
  gap: number
  perPage: number
}

export const CAROUSEL_CONTEXT: InjectionKey<ComputedRef<NvCarouselContext>> =
  Symbol('NvCarouselContext')
