<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Badge.styles'
import type { NvMobileBadgeProps } from './types'

/**
 * 角标：把计数或小红点钉在包裹内容的右上角。纯展示。
 *
 * 计数本身对读屏没有意义（「3」不知道是什么的 3），所以数字层 `aria-hidden`，
 * 语义应由包裹元素自己的标签承担。
 */
const props = withDefaults(defineProps<NvMobileBadgeProps>(), { count: 0, dot: false, max: 99 })

const show = computed(() => props.dot || props.count > 0)
const text = computed(() => (props.count > props.max ? `${props.max}+` : String(props.count)))

const sx = computed(() => ({
  root: stylex.props(styles.root),
  dot: stylex.props(styles.dot),
  count: stylex.props(styles.count),
}))
</script>

<template>
  <span :class="[sx.root.className, $attrs.class]" :style="[sx.root.style, $attrs.style]">
    <slot />
    <span v-if="show && props.dot" :class="sx.dot.className" :style="sx.dot.style" aria-hidden="true" />
    <span v-else-if="show" :class="sx.count.className" :style="sx.count.style" aria-hidden="true">
      {{ text }}
    </span>
  </span>
</template>
