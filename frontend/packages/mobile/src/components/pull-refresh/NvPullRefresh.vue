<script setup lang="ts">
import { ChevronDown, LoaderCircle } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
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
let startY = 0
let active = false

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

function onTouchStart(event: TouchEvent) {
  if (props.disabled || isRefreshing.value) return
  const touch = event.touches[0]
  if (!touch) return
  if (!atTop(event.currentTarget)) {
    active = false
    return
  }
  startY = touch.clientY
  active = true
  dragging.value = false
}

function onTouchMove(event: TouchEvent) {
  if (!active || props.disabled || isRefreshing.value) return
  const touch = event.touches[0]
  if (!touch) return
  const delta = touch.clientY - startY
  if (delta <= 0) {
    pull.value = 0
    dragging.value = false
    return
  }
  if (!atTop(event.currentTarget)) {
    active = false
    pull.value = 0
    dragging.value = false
    return
  }
  dragging.value = true
  event.preventDefault()
  // Rubber-band the pull so it slows as it grows.
  pull.value = Math.min(props.maxPull, delta * 0.6)
}

function finish() {
  if (props.refreshing !== undefined) return
  inner.value = false
  emit('update:refreshing', false)
}

function onTouchEnd() {
  if (!active) return
  active = false
  dragging.value = false
  const reached = pull.value >= props.threshold
  pull.value = 0
  if (!reached || props.disabled || isRefreshing.value) return
  inner.value = true
  emit('update:refreshing', true)
  emit('refresh')
}

defineExpose({ finish })
</script>

<template>
  <div
    v-bind="$attrs"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
    @touchstart.passive="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <div :class="indicatorSx.className" :style="[indicatorSx.style, indicatorStyle]" aria-live="polite">
      <LoaderCircle
        v-if="isRefreshing"
        aria-hidden="true"
        :size="18"
        :class="stylex.props(styles.spinner).className"
      />
      <span
        v-else
        :class="stylex.props(styles.arrow, ready && styles.arrowReady).className"
        aria-hidden="true"
      >
        <ChevronDown :size="18" />
      </span>
      <span>{{ isRefreshing ? refreshingText : ready ? releaseText : pullText }}</span>
    </div>
    <div :class="contentSx.className" :style="[contentSx.style, contentStyle]">
      <slot />
    </div>
  </div>
</template>
