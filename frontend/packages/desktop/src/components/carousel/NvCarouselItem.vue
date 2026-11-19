<script setup lang="ts">
import { CarouselItem } from '@ui-sdk/vue/carousel'
import * as stylex from '@stylexjs/stylex'
import { computed, inject } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Carousel.styles'
import { CAROUSEL_CONTEXT } from './context'
import type { NvCarouselItemProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvCarouselItemProps>(), {
  label: undefined,
  basis: undefined,
})

const ctx = inject(CAROUSEL_CONTEXT, null)

const sx = computed(() => stylex.props(styles.item))

/**
 * 没有显式 `basis` 时按「每屏张数」摊宽度：n 张之间共有 n-1 条间距，
 * 每张减去属于自己那份。`slidesPerPage: 'auto'` 时 chrome 端测不了每屏
 * 几张，退回整屏一张——需要露边（peek）时用 `basis` 明确写。
 */
const basisStyle = computed(() => {
  if (props.basis) return { flexBasis: props.basis }
  const gap = ctx?.value.gap ?? 12
  const perPage = ctx?.value.perPage ?? 1
  if (perPage <= 1) return { flexBasis: '100%' }
  return { flexBasis: `calc((100% - ${(perPage - 1) * gap}px) / ${perPage})` }
})
</script>

<template>
  <CarouselItem
    v-bind="omitClassStyle($attrs)"
    :aria-label="label"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, basisStyle, $attrs.style]"
  >
    <slot />
  </CarouselItem>
</template>
