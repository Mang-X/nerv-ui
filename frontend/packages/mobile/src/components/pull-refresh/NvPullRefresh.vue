<script setup lang="ts">
import { bindDrag } from '@ui-sdk/core'
import { rubberBand } from '@ui-sdk/core/gesture'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed, onBeforeUnmount, ref } from 'vue'
import { styles } from './PullRefresh.styles'
import type { PullRefreshProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<PullRefreshProps>(), {
  // Undefined, not false: an explicit false would make `refreshing` controlled
  // and the component could never show its own indicator.
  refreshing: undefined,
  threshold: 56,
  maxPull: 96,
  pullText: '下拉刷新',
  releaseText: '松开刷新',
  refreshingText: '正在刷新',
  disabled: false,
})

const emit = defineEmits<{
  'update:refreshing': [refreshing: boolean]
  refresh: []
}>()

const inner = ref(false)
const pull = ref(0)
const dragging = ref(false)
/** 当前手势的清理函数：一次拖拽一条，结束即释放。 */
let stopDrag: (() => void) | undefined
let startY = 0
onBeforeUnmount(() => stopDrag?.())

const isRefreshing = computed(() =>
  props.refreshing !== undefined ? props.refreshing : inner.value,
)
const ready = computed(() => pull.value >= props.threshold)

const rootSx = computed(() => stylex.props(styles.root))
const indicatorSx = computed(() =>
  stylex.props(styles.indicator, (pull.value > 0 || isRefreshing.value) && styles.indicatorVisible),
)
const contentSx = computed(() =>
  stylex.props(styles.content, dragging.value && styles.contentDragging),
)

const offset = computed(() => {
  if (isRefreshing.value) return props.threshold
  return Math.min(pull.value, props.maxPull)
})

const indicatorStyle = computed(() => ({
  height: `${Math.max(offset.value, isRefreshing.value ? 44 : 0)}px`,
}))

const contentStyle = computed(() => ({
  transform: `translateY(${isRefreshing.value ? 0 : offset.value}px)`,
}))

function atTop(target: EventTarget | null): boolean {
  let el = target as HTMLElement | null
  while (el) {
    if (el.scrollTop > 0) return false
    el = el.parentElement
  }
  const page = document.scrollingElement
  return !page || page.scrollTop <= 0
}

/**
 * 手势交给 ui-sdk 的 bindDrag：它负责阈值（几乎不动的按压仍是点击）、
 * 每帧采样、指针丢失与 Escape 取消。橡皮筋用同一 foundation 的 rubberBand，
 * 不再自己写 0.6 的线性系数。
 */
function onPointerDown(event: PointerEvent) {
  if (props.disabled || isRefreshing.value || event.button !== 0) return
  const el = event.currentTarget as HTMLElement | null
  if (!el || !atTop(event.target)) return
  stopDrag?.()
  stopDrag = bindDrag(el, event, {
    threshold: 6,
    onStart: () => {
      dragging.value = true
      return true
    },
    onMove: (sample) => {
      // 只跟向下拉；向上是普通滚动，交还浏览器。
      const raw = Math.max(0, sample.y - startY)
      pull.value = Math.min(props.maxPull, rubberBand(raw, props.maxPull))
    },
    onEnd: () => {
      dragging.value = false
      stopDrag = undefined
      finishPull()
    },
  })
  startY = event.clientY
}

function finishPull() {
  const reached = pull.value >= props.threshold
  pull.value = 0
  if (!reached || props.disabled || isRefreshing.value) return
  if (props.refreshing !== undefined) return
  inner.value = true
  emit('update:refreshing', true)
  emit('refresh')
}

/** 供宿主在刷新结束后收起指示器（受控时由 props.refreshing 驱动，无需调用）。 */
function finish() {
  if (props.refreshing !== undefined) return
  inner.value = false
  emit('update:refreshing', false)
}

defineExpose({ finish })
</script>

<template>
  <div
    v-bind="$attrs"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
    @pointerdown="onPointerDown"
    style="touch-action: pan-y"
  >
    <div :class="indicatorSx.className" :style="[indicatorSx.style, indicatorStyle]" aria-live="polite">
      <NvIcon name="loader-circle"
        v-if="isRefreshing"
        :size="18"
        :class="stylex.props(styles.spinner).className"
      />
      <span
        v-else
        :class="stylex.props(styles.arrow, ready && styles.arrowReady).className"
        aria-hidden="true"
      >
        <NvIcon name="chevron-down" :size="18" />
      </span>
      <span>{{ isRefreshing ? refreshingText : ready ? releaseText : pullText }}</span>
    </div>
    <div :class="contentSx.className" :style="[contentSx.style, contentStyle]">
      <slot />
    </div>
  </div>
</template>
