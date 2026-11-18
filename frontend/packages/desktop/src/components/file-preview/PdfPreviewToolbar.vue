<script setup lang="ts">
import { useScroll } from '@embedpdf/plugin-scroll/vue'
import { ZoomMode, useZoom } from '@embedpdf/plugin-zoom/vue'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  ExternalLinkIcon,
  Maximize2Icon,
  MaximizeIcon,
  RotateCwIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { useRegistry } from '@embedpdf/core/vue'
import { setRotation } from '@embedpdf/core'
import { Rotation } from '@embedpdf/models'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { styles } from './viewer.styles'

const props = defineProps<{ documentId: string; src?: string; title?: string }>()

const { provides: scroll, state: scrollState } = useScroll(() => props.documentId)
const { provides: zoom, state: zoomState } = useZoom(() => props.documentId)

const toolbarSx = stylex.props(styles.toolbar)
const iconButtonSx = stylex.props(styles.iconButton)
const labelSx = stylex.props(styles.label)
const selectSx = stylex.props(styles.select)
const spacerSx = stylex.props(styles.toolbarSpacer)
const dividerSx = stylex.props(styles.divider)

const currentPage = computed(() => scrollState.value.currentPage || 1)
const totalPages = computed(() => scrollState.value.totalPages || 0)
const zoomLabel = computed(() => `${Math.round(zoomState.value.currentZoomLevel * 100)}%`)
const jumping = shallowRef(false)
const canGoPrevious = computed(() => currentPage.value > 1 && !jumping.value)
const canGoNext = computed(
  () => totalPages.value > 0 && currentPage.value < totalPages.value && !jumping.value,
)
const pageOptions = computed(() =>
  Array.from({ length: totalPages.value }, (_, index) => index + 1),
)
let jumpReleaseTimer = 0

function jumpToPage(event: Event) {
  const target = Number((event.target as HTMLSelectElement).value)
  if (jumping.value || !Number.isInteger(target) || target < 1 || target > totalPages.value) {
    return
  }
  jumping.value = true
  scroll.value?.scrollToPage({ pageNumber: target, behavior: 'smooth' })
  if (jumpReleaseTimer) window.clearTimeout(jumpReleaseTimer)
  jumpReleaseTimer = window.setTimeout(() => {
    jumping.value = false
    jumpReleaseTimer = 0
  }, 187)
}

function goPrevious() {
  if (canGoPrevious.value) scroll.value?.scrollToPreviousPage('auto')
}

function goNext() {
  if (canGoNext.value) scroll.value?.scrollToNextPage('auto')
}

function zoomIn() {
  zoom.value?.zoomIn()
}

function zoomOut() {
  zoom.value?.zoomOut()
}

function fitWidth() {
  zoom.value?.requestZoom(ZoomMode.FitWidth)
}

function fitPage() {
  zoom.value?.requestZoom(ZoomMode.FitPage)
}

/** 页面旋转走核心 store 的 setRotation（90° 一档）。 */
const { registry } = useRegistry()
const rotation = computed<Rotation>(() => {
  const state = registry.value?.getStore().getState()
  return ((state as { rotation?: Rotation } | undefined)?.rotation ?? Rotation.Degree0)
})

/** 顺时针 90° 一档：0 → 90 → 180 → 270 → 0。 */
function rotatePage() {
  const store = registry.value?.getStore()
  if (!store) return
  const next = (rotation.value + 1) % 4
  store.dispatch(setRotation(next as Rotation, props.documentId))
}

function openInNewWindow() {
  if (props.src) window.open(props.src, '_blank', 'noopener,noreferrer')
}

onBeforeUnmount(() => {
  if (jumpReleaseTimer) window.clearTimeout(jumpReleaseTimer)
})
</script>

<template>
  <div data-slot="nv-file-preview-pdf-toolbar" :class="toolbarSx.className" :style="toolbarSx.style">
    <button
      type="button"
      aria-label="上一页"
      :class="iconButtonSx.className"
      :style="iconButtonSx.style"
      :data-disabled="canGoPrevious ? undefined : ''"
      @click="goPrevious"
    >
      <ChevronLeftIcon :size="16" aria-hidden="true" />
    </button>
    <select
      :value="String(currentPage)"
      :aria-label="`跳到第 ${currentPage} 页，共 ${totalPages} 页`"
      :class="selectSx.className"
      :style="selectSx.style"
      @change="jumpToPage"
    >
      <option v-for="page in pageOptions" :key="page" :value="String(page)">第 {{ page }} 页</option>
    </select>
    <span :class="labelSx.className" :style="labelSx.style">/ {{ totalPages }}</span>
    <button
      type="button"
      aria-label="下一页"
      :class="iconButtonSx.className"
      :style="iconButtonSx.style"
      :data-disabled="canGoNext ? undefined : ''"
      @click="goNext"
    >
      <ChevronRightIcon :size="16" aria-hidden="true" />
    </button>

    <span :class="spacerSx.className" :style="spacerSx.style" />

    <button
      type="button"
      aria-label="缩小"
      :class="iconButtonSx.className"
      :style="iconButtonSx.style"
      @click="zoomOut"
    >
      <ZoomOutIcon :size="16" aria-hidden="true" />
    </button>
    <span :class="labelSx.className" :style="labelSx.style">{{ zoomLabel }}</span>
    <button
      type="button"
      aria-label="放大"
      :class="iconButtonSx.className"
      :style="iconButtonSx.style"
      @click="zoomIn"
    >
      <ZoomInIcon :size="16" aria-hidden="true" />
    </button>
    <button
      type="button"
      aria-label="适配宽度"
      :class="iconButtonSx.className"
      :style="iconButtonSx.style"
      @click="fitWidth"
    >
      <Maximize2Icon :size="16" aria-hidden="true" />
    </button>
    <button
      type="button"
      aria-label="适配整页"
      :class="iconButtonSx.className"
      :style="iconButtonSx.style"
      @click="fitPage"
    >
      <MaximizeIcon :size="16" aria-hidden="true" />
    </button>
    <button
      type="button"
      aria-label="旋转页面"
      :class="iconButtonSx.className"
      :style="iconButtonSx.style"
      @click="rotatePage"
    >
      <RotateCwIcon :size="16" aria-hidden="true" />
    </button>

    <span :class="dividerSx.className" :style="dividerSx.style" aria-hidden="true" />

    <button
      type="button"
      aria-label="在新窗口打开"
      :class="iconButtonSx.className"
      :style="iconButtonSx.style"
      :data-disabled="src ? undefined : ''"
      @click="openInNewWindow"
    >
      <ExternalLinkIcon :size="16" aria-hidden="true" />
    </button>
    <a
      v-if="src"
      :href="src"
      download
      aria-label="下载文件"
      :class="iconButtonSx.className"
      :style="iconButtonSx.style"
    >
      <DownloadIcon :size="16" aria-hidden="true" />
    </a>
  </div>
</template>
