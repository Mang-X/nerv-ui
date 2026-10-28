<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ArrowDown, Loader2 } from '@lucide/vue'
import { cn, rubberband } from '../../lib/utils'

/**
 * Mobile PullRefresh — pull down at the top of its own scroll area to refresh
 * (Vant / tdesign-mobile style). Pointer-driven with resistance; releasing past
 * the threshold emits `refresh` and shows a spinner until `v-model` clears.
 */
const props = withDefaults(
  defineProps<{
    threshold?: number
    scrollTop?: number
    scrollRestoreKey?: string | number
    class?: HTMLAttributes['class']
  }>(),
  {
    threshold: 56,
    scrollTop: 0,
  },
)
const emit = defineEmits<{
  refresh: []
  scroll: [scrollTop: number]
  scrollRestored: [result: { requested: number; actual: number; max: number }]
}>()
const loading = defineModel<boolean>({ default: false })

const scroller = ref<HTMLElement>()
const atTop = ref(true)
const distance = ref(0)
const dragging = ref(false)
let startY = 0
let engaged = false
let eligible = false

const status = computed<'pull' | 'release' | 'loading'>(() => {
  if (loading.value) return 'loading'
  return distance.value >= props.threshold ? 'release' : 'pull'
})
const text = computed(
  () => ({ pull: '下拉刷新', release: '释放立即刷新', loading: '刷新中…' })[status.value],
)

function onDown(e: PointerEvent) {
  eligible = (scroller.value?.scrollTop ?? 0) <= 0 && !loading.value
  if (!eligible) return
  startY = e.clientY
  engaged = false
}
function onMove(e: PointerEvent) {
  if (!eligible || e.buttons === 0 || loading.value) return
  if ((scroller.value?.scrollTop ?? 0) > 0) return
  const dy = e.clientY - startY
  if (dy <= 0) {
    distance.value = 0
    return
  }
  if (!engaged && dy < 4) return
  engaged = true
  dragging.value = true
  e.preventDefault()
  distance.value = rubberband(dy) // resistance (shared rubber-band curve)
}
function onCancel() {
  eligible = false
  engaged = false
  dragging.value = false
  distance.value = loading.value ? props.threshold : 0
}

function onUp() {
  if (loading.value) {
    onCancel()
    return
  }
  eligible = false
  if (!engaged) return
  dragging.value = false
  engaged = false
  if (distance.value >= props.threshold) {
    distance.value = props.threshold
    loading.value = true
    emit('refresh')
    // A controlled host can decline the refresh without changing false.
    // Reconcile the gesture after its synchronous update has been rendered.
    void nextTick(() => {
      if (!loading.value) onCancel()
    })
  } else {
    distance.value = 0
  }
}

function restoreScrollTop(value: number) {
  void nextTick(() => {
    if (!scroller.value) return
    const requested = Math.max(0, value)
    scroller.value.scrollTop = requested
    atTop.value = scroller.value.scrollTop <= 0
    emit('scrollRestored', {
      requested,
      actual: scroller.value.scrollTop,
      max: Math.max(0, scroller.value.scrollHeight - scroller.value.clientHeight),
    })
  })
}

function onScroll() {
  const value = scroller.value?.scrollTop ?? 0
  atTop.value = value <= 0
  emit('scroll', value)
}

// Loading transitions end the previous gesture, including completion before release.
watch(loading, onCancel)
watch([() => props.scrollTop, () => props.scrollRestoreKey], ([value]) => restoreScrollTop(value))
onMounted(() => restoreScrollTop(props.scrollTop))
</script>

<template>
  <div data-slot="pull-refresh" :class="cn('relative overflow-hidden', $props.class)">
    <div
      class="nv-m-pr-inner h-full"
      :class="!dragging && 'nv-m-pr-snap'"
      :style="{ transform: `translateY(${distance}px)` }"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onCancel"
    >
      <div
        class="pointer-events-none absolute inset-x-0 flex items-center justify-center gap-2 text-sm text-muted-foreground"
        :style="{ top: `-${threshold}px`, height: `${threshold}px` }"
      >
        <Loader2
          v-if="status === 'loading'"
          class="size-4 animate-spin text-brand"
          aria-hidden="true"
        />
        <ArrowDown
          v-else
          class="nv-m-pr-arrow size-4 transition-transform"
          :class="status === 'release' && 'rotate-180'"
          aria-hidden="true"
        />
        {{ text }}
      </div>
      <div
        ref="scroller"
        class="nv-m-pr-scroll h-full overflow-y-auto"
        :style="{ touchAction: atTop ? 'pan-x pan-down' : 'pan-y' }"
        @scroll="onScroll"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
@layer nv-components {
  .nv-m-pr-scroll {
    touch-action: pan-y;
  }
  .nv-m-pr-snap {
    transition: transform 0.3s var(--nv-ease-out-expo);
  }
  @media (prefers-reduced-motion: reduce) {
    .nv-m-pr-snap {
      transition: none;
    }
  }
}
</style>
