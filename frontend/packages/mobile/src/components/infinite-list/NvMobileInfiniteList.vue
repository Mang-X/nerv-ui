<script setup lang="ts">
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { styles } from './InfiniteList.styles'
import type { NvMobileInfiniteListProps } from './types'

/**
 * 触底加载列表。滚动到距底部 `offset` 像素内时触发一次 `load`，加载中显示
 * 转圈，`finished` 后显示到底文案。
 *
 * 判定用 `IntersectionObserver` 盯底部哨兵，而不是每次 scroll 都算一遍
 * `scrollHeight - scrollTop - clientHeight`：后者在滚动时每帧读写布局，长列表会卡。
 *
 * `loading` 是受控的（`v-model`）：组件只发出请求，由调用方决定何时结束。
 */
const props = withDefaults(defineProps<NvMobileInfiniteListProps>(), {
  finished: false,
  paused: false,
  offset: 80,
  finishedText: '没有更多了',
  loadingText: '加载中…',
})

const loading = defineModel<boolean>('loading', { default: false })
const emit = defineEmits<{ load: [] }>()

const viewport = ref<HTMLElement | null>(null)
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | undefined

function request() {
  if (loading.value || props.finished || props.paused) return
  loading.value = true
  emit('load')
}

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined' || !viewport.value || !sentinel.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) request()
    },
    { root: viewport.value, rootMargin: `0px 0px ${props.offset}px 0px` },
  )
  observer.observe(sentinel.value)
})

onBeforeUnmount(() => observer?.disconnect())

const sx = computed(() => ({
  viewport: stylex.props(styles.viewport),
  footer: stylex.props(styles.footer),
  spinner: stylex.props(styles.spinner),
}))
</script>

<template>
  <div ref="viewport" :class="[sx.viewport.className, $attrs.class]" :style="[sx.viewport.style, $attrs.style]">
    <slot />
    <div ref="sentinel" :class="sx.footer.className" :style="sx.footer.style" role="status" aria-live="polite">
      <template v-if="loading">
        <span :class="sx.spinner.className" :style="sx.spinner.style" aria-hidden="true">
          <NvIcon name="loader-circle" :size="16" />
        </span>
        <span>{{ props.loadingText }}</span>
      </template>
      <span v-else-if="props.finished">{{ props.finishedText }}</span>
    </div>
  </div>
</template>
