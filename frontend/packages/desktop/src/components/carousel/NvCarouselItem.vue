<script setup lang="ts">
import { CarouselItem } from '@ui-sdk/vue/carousel'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Carousel.styles'
import type { NvCarouselItemProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvCarouselItemProps>(), {
  label: undefined,
  basis: '100%',
})

const sx = computed(() => stylex.props(styles.item))
const basisStyle = computed(() => ({ flexBasis: props.basis }))
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
