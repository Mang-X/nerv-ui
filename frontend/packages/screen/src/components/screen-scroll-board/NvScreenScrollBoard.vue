<script setup lang="ts" generic="T">
import * as stylex from '@stylexjs/stylex'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { styles } from './ScrollBoard.styles'

/**
 * 无限滚动榜：列表渲染两遍，滚过一半就无缝回到起点。
 *
 * 用原生 `requestAnimationFrame` / `ResizeObserver` / `matchMedia` 实现，
 * 不给 screen 包引 `@vueuse/core`——这个包里所有组件目前都不需要它。
 *
 * 关闭动效（`prefers-reduced-motion: reduce`）或内部获得焦点时切到「手动」：
 * 停掉 rAF、允许原生滚动。键盘用户因此不会被动画抢走目标行。
 */
const props = withDefaults(
  defineProps<{
    items: T[]
    /** 滚动速度 px/s。 */
    speed?: number
    pauseOnHover?: boolean
    rowKey?: (item: T, index: number) => string | number
  }>(),
  { speed: 28, pauseOnHover: true },
)

const viewport = ref<HTMLElement | null>(null)
const original = ref<HTMLElement | null>(null)
const overflowing = ref(false)
const offset = ref(0)
const paused = ref(false)
const focused = ref(false)
const reduced = ref(false)

const manual = computed(() => reduced.value || focused.value)

const rowKeyFor = (item: T, index: number) => (props.rowKey ? props.rowKey(item, index) : index)

/** 半份列表高度（渲染两遍，滚过一半即回到起点）；未溢出返回 0。 */
function halfIfOverflow(): number {
  const trackEl = original.value
  const viewEl = viewport.value
  if (!trackEl || !viewEl) return 0
  return trackEl.scrollHeight > viewEl.clientHeight ? trackEl.scrollHeight : 0
}

/** 把任意 offset 无缝收回 (-half, 0]，正反向都能循环。 */
const wrap = (v: number, half: number) => -((-v % half) + half) % half

let frame = 0
let last = 0

function stop() {
  if (frame) cancelAnimationFrame(frame)
  frame = 0
  last = 0
}

function step(ts: number) {
  frame = requestAnimationFrame(step)
  if (manual.value || paused.value) {
    last = ts
    return
  }
  const half = halfIfOverflow()
  if (half === 0) {
    offset.value = 0
    last = ts
    return
  }
  const delta = last ? ts - last : 0
  last = ts
  offset.value = wrap(offset.value - (props.speed * delta) / 1000, half)
}

function sync() {
  const shouldRun = overflowing.value && !manual.value && !paused.value
  if (shouldRun && !frame) {
    last = 0
    frame = requestAnimationFrame(step)
  } else if (!shouldRun) {
    stop()
    if (manual.value) offset.value = 0
  }
}

function measure() {
  const half = halfIfOverflow()
  overflowing.value = half > 0
  offset.value = half && !manual.value ? wrap(offset.value, half) : 0
  sync()
}

let resize: ResizeObserver | undefined
let motionQuery: MediaQueryList | undefined
const onMotion = (event: MediaQueryListEvent) => {
  reduced.value = event.matches
}

watch(
  () => props.items,
  () => nextTick(measure),
  { deep: true },
)
watch([viewport, original], () => nextTick(measure))
watch(manual, () => {
  offset.value = 0
  if (viewport.value) viewport.value.scrollTop = 0
  sync()
})
watch([overflowing, paused], sync)

if (typeof window !== 'undefined') {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduced.value = motionQuery.matches
  motionQuery.addEventListener('change', onMotion)
  resize = new ResizeObserver(() => measure())
  watch(viewport, (el) => {
    resize?.disconnect()
    if (el) resize?.observe(el)
    if (original.value) resize?.observe(original.value)
  })
  watch(original, (el) => {
    if (el) resize?.observe(el)
  })
}

onBeforeUnmount(() => {
  stop()
  resize?.disconnect()
  motionQuery?.removeEventListener('change', onMotion)
})

async function onFocusIn(event: FocusEvent) {
  focused.value = true
  const target = event.target
  // 原生 focus 可能先把被 transform 的行滚进视野；手动模式下再补一次 nearest 对齐。
  await nextTick()
  if (target instanceof HTMLElement && target !== viewport.value && viewport.value?.contains(target)) {
    target.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }
}

function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  focused.value = Boolean(next && viewport.value?.contains(next))
}

/** 悬停暂停时允许滚轮自由查看：位移同样按半高取模，双向无缝。 */
function onWheel(event: WheelEvent) {
  if (manual.value) return
  const half = halfIfOverflow()
  if (half === 0) return
  event.preventDefault()
  offset.value = wrap(offset.value - event.deltaY, half)
}

const sx = computed(() => ({
  viewport: stylex.props(styles.viewport, manual.value && styles.viewportManual),
  track: stylex.props(styles.track),
  row: stylex.props(styles.row),
}))
</script>

<template>
  <div
    ref="viewport"
    :class="sx.viewport.className"
    :style="sx.viewport.style"
    tabindex="0"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @mouseenter="props.pauseOnHover && (paused = true)"
    @mouseleave="props.pauseOnHover && (paused = false)"
    @wheel="onWheel"
  >
    <div :class="sx.track.className" :style="[sx.track.style, { transform: `translateY(${offset}px)` }]">
      <div ref="original">
        <div v-for="(item, i) in items" :key="rowKeyFor(item, i)" :class="sx.row.className" :style="sx.row.style">
          <slot name="row" :item="item" :index="i">{{ item }}</slot>
        </div>
      </div>
      <div v-if="overflowing && !manual" aria-hidden="true" inert>
        <div v-for="(item, i) in items" :key="rowKeyFor(item, i)" :class="sx.row.className" :style="sx.row.style">
          <slot name="row" :item="item" :index="i">{{ item }}</slot>
        </div>
      </div>
    </div>
  </div>
</template>
