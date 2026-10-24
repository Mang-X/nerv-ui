<script setup lang="ts" generic="T">
import { usePreferredReducedMotion, useRafFn, useResizeObserver } from '@vueuse/core'
import { computed, nextTick, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    items: T[]
    /** 滚动速度 px/s */
    speed?: number
    pauseOnHover?: boolean
    rowKey?: (item: T, index: number) => string | number
  }>(),
  { speed: 28, pauseOnHover: true },
)

const viewport = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const original = ref<HTMLElement | null>(null)
const overflowing = ref(false)
const offset = ref(0)
const paused = ref(false)
const reducedMotion = usePreferredReducedMotion()
const focused = ref(false)
const manual = computed(() => reducedMotion.value === 'reduce' || focused.value)
watch(manual, () => {
  offset.value = 0
  if (viewport.value) viewport.value.scrollTop = 0
})

function rowKeyFor(item: T, index: number): string | number {
  return props.rowKey ? props.rowKey(item, index) : index
}

/** 半份列表高度（列表渲染两遍，滚过一半即无缝回到起点）；未溢出返回 0。 */
function halfIfOverflow(): number {
  const trackEl = original.value
  const viewEl = viewport.value
  if (!trackEl || !viewEl) return 0
  const half = trackEl.scrollHeight
  return half > viewEl.clientHeight ? half : 0
}

/** 把任意 offset 无缝收回 (-half, 0]，保证正反向滚都循环。 */
function wrap(v: number, half: number): number {
  return -(((-v % half) + half) % half)
}

const { pause, resume } = useRafFn(
  ({ delta }) => {
    if (manual.value) {
      offset.value = 0
      return
    }
    if (paused.value) return
    const half = halfIfOverflow()
    if (half === 0) {
      offset.value = 0
      return
    }
    offset.value = wrap(offset.value - (props.speed * delta) / 1000, half)
  },
  { immediate: false },
)

function measure() {
  const half = halfIfOverflow()
  overflowing.value = half > 0
  offset.value = half && !manual.value ? wrap(offset.value, half) : 0
}
useResizeObserver([viewport, original], measure)
watch(() => props.items, measure, { deep: true, flush: 'post' })
watch([viewport, original], measure, { flush: 'post' })
watch(
  () => overflowing.value && !manual.value && !paused.value,
  (moving) => (moving ? resume() : pause()),
)

function onEnter() {
  if (props.pauseOnHover) paused.value = true
}
function onLeave() {
  if (props.pauseOnHover) paused.value = false
}

async function onFocusIn(event: FocusEvent) {
  focused.value = true
  const target = event.target
  // Native focus may scroll a transformed row before we restore the original list.
  // Reveal it again after manual layout, including reverse Tab into the last row.
  await nextTick()
  if (
    target instanceof HTMLElement &&
    target !== viewport.value &&
    viewport.value?.contains(target)
  ) {
    target.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }
}

/** 悬停暂停时用滚轮自由查看：手动位移同样按半高取模，双向无缝。 */
function onWheel(e: WheelEvent) {
  if (manual.value) return
  const half = halfIfOverflow()
  if (half === 0) return
  e.preventDefault()
  offset.value = wrap(offset.value - e.deltaY, half)
}
</script>

<template>
  <div
    ref="viewport"
    class="scroll-board"
    :class="{ 'scroll-board--manual': manual }"
    tabindex="0"
    @focusin="onFocusIn"
    @focusout="focused = !!$event.relatedTarget && viewport!.contains($event.relatedTarget as Node)"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @wheel="onWheel"
  >
    <div ref="track" class="scroll-board__track" :style="{ transform: `translateY(${offset}px)` }">
      <div ref="original">
        <div v-for="(item, i) in items" :key="rowKeyFor(item, i)" class="scroll-board__row">
          <slot name="row" :item="item" :index="i">{{ item }}</slot>
        </div>
      </div>
      <div v-if="overflowing && !manual" aria-hidden="true" inert>
        <div v-for="(item, i) in items" :key="rowKeyFor(item, i)" class="scroll-board__row">
          <slot name="row" :item="item" :index="i">{{ item }}</slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@layer nv-components {
  .scroll-board {
    height: 100%;
    overflow: hidden;
    position: relative;
  }
  .scroll-board__track {
    will-change: transform;
  }
  .scroll-board--manual {
    overflow-y: auto;
  }
  .scroll-board--manual [aria-hidden='true'] {
    display: none;
  }
}
</style>
