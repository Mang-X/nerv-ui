<script setup lang="ts">
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed, ref, watch } from 'vue'
import { styles } from './Image.styles'
import type { NvMobileImageProps } from './types'

/**
 * 移动端图片。加载中显示占位底色，失败显示破图 + 替代文字。
 *
 * 加载状态由 `img` 的 load/error 事件驱动；这不是 ui-sdk 原语能覆盖的领域
 * （原语管的是交互控件），图片加载是浏览器事件。
 */
const props = withDefaults(defineProps<NvMobileImageProps>(), { fit: 'cover', radius: 'md' })

const status = ref<'loading' | 'loaded' | 'error'>('loading')

watch(
  () => props.src,
  () => {
    status.value = 'loading'
  },
)

const RATIO = {
  none: null,
  sm: styles.radiusSm,
  md: styles.radiusMd,
  lg: styles.radiusLg,
  full: styles.radiusFull,
} as const
const FIT = { cover: styles.fitCover, contain: styles.fitContain } as const

const sx = computed(() => ({
  root: stylex.props(styles.root, RATIO[props.radius]),
  image: stylex.props(styles.image, FIT[props.fit]),
  placeholder: stylex.props(styles.placeholder),
}))

const ratioStyle = computed(() => {
  if (props.ratio === undefined) return undefined
  const value =
    typeof props.ratio === 'number' ? String(props.ratio) : props.ratio.replace(':', '/')
  return { aspectRatio: value }
})
</script>

<template>
  <div
    :class="[sx.root.className, $attrs.class]"
    :style="[sx.root.style, ratioStyle, $attrs.style]"
  >
    <img
      v-if="status !== 'error'"
      :src="props.src"
      :alt="props.alt ?? ''"
      :class="sx.image.className"
      :style="sx.image.style"
      :aria-label="props.alt || undefined"
      @load="status = 'loaded'"
      @error="status = 'error'"
    />
    <span v-if="status === 'error'" :class="sx.placeholder.className" :style="sx.placeholder.style">
      <NvIcon name="image" :size="24" aria-hidden="true" />
    </span>
  </div>
</template>
