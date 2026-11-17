<script setup lang="ts" generic="T">
import * as stylex from '@stylexjs/stylex'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './ScreenScrollArea.styles'
import type { ScreenScrollAreaProps } from './types'

const props = withDefaults(
  defineProps<
    {
      /** Rows to loop. Each row is exposed through the `row` slot. */
      items: T[]
    } & ScreenScrollAreaProps
  >(),
  { speed: 28, pauseOnHover: true, emptyLabel: '暂无内容', ariaLabel: '滚动区' },
)

const emit = defineEmits<{ visible: [indexes: number[]] }>()

const viewport = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const original = ref<HTMLElement | null>(null)
const pointerInside = ref(false)
const focused = ref(false)
const reducedMotion = ref(false)
const half = ref(0)
let frame = 0
let last = 0
let offset = 0
let observer: ResizeObserver | undefined
let media: MediaQueryList | undefined

const manual = computed(() => reducedMotion.value || focused.value)

const rootSx = computed(() => stylex.props(styles.root))
const viewportSx = computed(() =>
  stylex.props(styles.viewport, manual.value && styles.manualViewport, focus.subtle),
)
const trackSx = computed(() => stylex.props(styles.track))

const loopRows = computed(() => (half.value > 0 && !manual.value ? props.items : []))

function keyFor(item: T, index: number): string | number {
  return props.rowKey ? props.rowKey(item, index) : index
}

function measure() {
  const el = original.value
  const frameEl = viewport.value
  if (!el || !frameEl) {
    half.value = 0
    return
  }
  const measured = el.scrollHeight
  half.value = measured > frameEl.clientHeight ? measured : 0
  if (!half.value) offset = 0
  else offset = -(((-offset % half.value) + half.value) % half.value)
  emit('visible', props.items.map((_, index) => index))
}

function run(now: number) {
  if (!last) last = now
  const delta = now - last
  last = now
  if (manual.value || half.value === 0 || (props.pauseOnHover && pointerInside.value)) {
    frame = requestAnimationFrame(run)
    return
  }
  offset -= (props.speed * delta) / 1000
  offset = -(((-offset % half.value) + half.value) % half.value)
  if (track.value) track.value.style.transform = `translateY(${offset}px)`
  frame = requestAnimationFrame(run)
}

function onMotion(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  if (reducedMotion.value) offset = 0
  if (track.value) track.value.style.transform = 'translateY(0px)'
}

function onWheel(event: WheelEvent) {
  if (!manual.value || !half.value) return
  const current = viewport.value
  if (!current) return
  event.preventDefault()
  current.scrollTop = ((current.scrollTop + event.deltaY) % half.value + half.value) % half.value
}

async function onFocusIn(event: FocusEvent) {
  focused.value = true
  offset = 0
  if (track.value) track.value.style.transform = 'translateY(0px)'
  const target = event.target
  await nextTick()
  if (target instanceof HTMLElement && viewport.value?.contains(target) && target !== viewport.value) {
    target.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }
}

function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget
  focused.value = next instanceof Node && Boolean(viewport.value?.contains(next))
}

onMounted(() => {
  media = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = media.matches
  media.addEventListener('change', onMotion)
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(measure)
    if (viewport.value) observer.observe(viewport.value)
    if (original.value) observer.observe(original.value)
  }
  measure()
  frame = requestAnimationFrame(run)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  observer?.disconnect()
  observer = undefined
  media?.removeEventListener('change', onMotion)
})

watch(
  () => props.items,
  () => nextTick(measure),
  { deep: true, flush: 'post' },
)

defineExpose({ measure })
</script>

<template>
  <div :class="rootSx.className" :style="rootSx.style" role="region" :aria-label="ariaLabel">
    <div
      ref="viewport"
      :class="viewportSx.className"
      :style="viewportSx.style"
      tabindex="0"
      @focusin="onFocusIn"
      @focusout="onFocusOut"
      @mouseenter="pointerInside = true"
      @mouseleave="pointerInside = false"
      @wheel="onWheel"
    >
      <p v-if="!items.length" :class="stylex.props(styles.empty).className">{{ emptyLabel }}</p>
      <div ref="track" :class="trackSx.className" :style="trackSx.style">
        <div ref="original">
          <div
            v-for="(item, index) in items"
            :key="`primary-${keyFor(item, index)}`"
          >
            <slot name="row" :item="item" :index="index" />
          </div>
        </div>
        <div v-if="loopRows.length" aria-hidden="true" inert>
          <div
            v-for="(item, index) in loopRows"
            :key="`repeat-${keyFor(item, index)}`"
          >
            <slot name="row" :item="item" :index="index" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
