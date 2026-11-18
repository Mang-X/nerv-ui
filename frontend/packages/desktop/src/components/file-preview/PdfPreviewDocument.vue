<script setup lang="ts">
import { useDocumentState } from '@embedpdf/core/vue'
import { DocumentContent } from '@embedpdf/plugin-document-manager/vue'
import { Scroller, useScroll } from '@embedpdf/plugin-scroll/vue'
import { useRenderCapability } from '@embedpdf/plugin-render/vue'
import { Button } from '@ui-sdk/vue/button'
import { shallowRef } from 'vue'
import {
  useIsViewportGated,
  useViewportCapability,
  useViewportPlugin,
} from '@embedpdf/plugin-viewport/vue'
import * as stylex from '@stylexjs/stylex'
import { computed, useTemplateRef, watch } from 'vue'
import PdfPreviewRenderLayer from './PdfPreviewRenderLayer.vue'
import PdfPreviewToolbar from './PdfPreviewToolbar.vue'
import { styles } from './viewer.styles'

const props = defineProps<{
  documentId: string
  src?: string
  showToolbar?: boolean
  showThumbnails?: boolean
}>()

const emit = defineEmits<{
  ready: []
  error: [message: string]
}>()

const viewerSx = stylex.props(styles.viewer)
const canvasSx = stylex.props(styles.canvasArea)
const statusSx = stylex.props(styles.status)
const statusErrorSx = stylex.props(styles.status, styles.statusError)

// 2.14.4 的 Viewport SFC 不会断开自己的 ResizeObserver，这里只接管 DOM 桥。
const viewportElement = useTemplateRef<HTMLDivElement>('viewportElement')
const { plugin: viewportPlugin } = useViewportPlugin()
const { provides: viewportCapability } = useViewportCapability()
const viewportGap = computed(() => viewportCapability.value?.getViewportGap() ?? 10)
const isGated = useIsViewportGated(() => props.documentId)
const { provides: scrollCapability, state: scrollState } = useScroll(() => props.documentId)

watch(
  [viewportPlugin, viewportElement, () => props.documentId],
  ([plugin, element, documentId], _old, onCleanup) => {
    if (!plugin || !element) return
    plugin.registerViewport(documentId)
    const scroll = () => {
      if (!element) return
      plugin.setViewportScrollMetrics(documentId, {
        scrollTop: element.scrollTop,
        scrollLeft: element.scrollLeft,
      })
    }
    const resize = new ResizeObserver(() => {
      if (!element) return
      plugin.setViewportResizeMetrics(documentId, {
        width: element.offsetWidth,
        height: element.offsetHeight,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
        scrollTop: element.scrollTop,
        scrollLeft: element.scrollLeft,
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight,
        clientLeft: element.clientLeft,
        clientTop: element.clientTop,
      })
    })
    resize.observe(element)
    element.addEventListener('scroll', scroll)
    const frames = new Set<number>()
    const unsubscribe = plugin.onScrollRequest(documentId, ({ x, y, behavior = 'auto' }) => {
      // 自动适配可能在翻页途中请求旧位置：保留该跳转的逻辑目标页。
      const change = scrollCapability.value?.getPageChangeState()
      const targetPage = change?.isChanging ? change.targetPage : undefined
      const frame = requestAnimationFrame(() => {
        frames.delete(frame)
        if (!element) return
        const target = targetPage
          ? element.querySelector<HTMLElement>(`[data-page-number="${targetPage}"]`)
          : null
        const top = target
          ? element.scrollTop +
            target.getBoundingClientRect().top -
            element.getBoundingClientRect().top -
            element.clientTop
          : y
        element.scrollTo({ left: x, top, behavior })
      })
      frames.add(frame)
    })
    onCleanup(() => {
      resize.disconnect()
      element.removeEventListener('scroll', scroll)
      unsubscribe()
      for (const frame of frames) cancelAnimationFrame(frame)
      plugin.unregisterViewport(documentId)
    })
  },
  { flush: 'post' },
)

const documentState = useDocumentState(() => props.documentId)

// —— 缩略图栏：只在 showThumbnails 打开时逐页渲染小图 ——
const { provides: renderCapability } = useRenderCapability()
const thumbUrls = shallowRef<Record<number, string>>({})
let thumbOwner = 0

async function renderThumbnails() {
  const capability = renderCapability.value
  const total = documentState.value?.document?.pages?.length ?? 0
  if (!capability || !total || props.showThumbnails === false) return
  const owner = ++thumbOwner
  const next: Record<number, string> = {}
  for (let pageIndex = 0; pageIndex < total; pageIndex++) {
    const blob = await capability
      .forDocument(props.documentId)
      .renderPage({ pageIndex, options: { scaleFactor: 0.18, dpr: 1 } })
      .toPromise()
      .catch(() => null)
    if (owner !== thumbOwner) {
      if (blob) URL.revokeObjectURL(URL.createObjectURL(blob))
      Object.values(next).forEach((url) => URL.revokeObjectURL(url))
      return
    }
    if (!blob) continue
    next[pageIndex] = URL.createObjectURL(blob)
    thumbUrls.value = { ...next }
  }
}

watch(
  () => [props.documentId, props.showThumbnails, documentState.value?.status] as const,
  ([, thumbs, status]) => {
    if (thumbs === false || status !== 'loaded') return
    void renderThumbnails()
  },
  { immediate: true },
)

function jumpToPage(pageNumber: number) {
  scrollCapability.value?.scrollToPage({ pageNumber, behavior: 'smooth' })
}

watch(
  () => documentState.value?.status,
  (status) => {
    if (status === 'loaded') {
      emit('ready')
      return
    }
    if (status === 'error') {
      emit('error', documentState.value?.error ?? '无法渲染此 PDF。')
    }
  },
  { immediate: true },
)
</script>

<template>
  <DocumentContent
    :document-id="documentId"
    v-slot="{ isLoading, isError, isLoaded, documentState: slotState }"
  >
    <div v-if="isLoaded" :class="viewerSx.className" :style="viewerSx.style">
      <PdfPreviewToolbar
        v-if="showToolbar !== false"
        :document-id="documentId"
        :src="src"
      />
      <div style="display: flex; flex: 1; min-height: 0">
      <aside
        v-if="showThumbnails"
        data-slot="nv-file-preview-pdf-thumbs"
        :style="{
          flexShrink: 0,
          width: 96,
          overflowY: 'auto',
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          borderRight: `1px solid var(--nx-border, rgba(255,255,255,.1))`,
        }"
      >
        <Button
          v-for="(url, index) in thumbUrls"
          :key="index"
          type="button"
          :aria-label="`跳到第 ${Number(index) + 1} 页`"
          :style="{
            padding: 2,
            border: '1px solid transparent',
            borderRadius: 4,
            background: 'none',
            cursor: 'pointer',
            opacity: scrollState.currentPage === Number(index) + 1 ? 1 : 0.6,
          }"
          @click="jumpToPage(Number(index) + 1)"
        >
          <img :src="url" :alt="`第 ${Number(index) + 1} 页`" style="display: block; width: 100%; border-radius: 2px" />
        </Button>
      </aside>
      <div :class="canvasSx.className" :style="[canvasSx.style, { flex: 1 }]">
        <div
          ref="viewportElement"
          data-slot="nv-file-preview-pdf-viewport"
          :style="{ padding: `${viewportGap}px`, width: '100%', height: '100%', overflow: 'auto' }"
        >
          <Scroller v-if="!isGated" :document-id="documentId">
            <template #default="{ page }">
              <div
                data-slot="nv-file-preview-pdf-page"
                :data-page-number="page.pageIndex + 1"
                :style="{
                  position: 'relative',
                  margin: '0 auto',
                  width: `${page.width}px`,
                  height: `${page.height}px`,
                  backgroundColor: '#fff',
                  boxShadow: '0 1px 3px rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
                }"
              >
                <PdfPreviewRenderLayer :document-id="documentId" :page-index="page.pageIndex" />
              </div>
            </template>
          </Scroller>
        </div>
      </div>
      </div>
    </div>
    <div v-else-if="isError" :class="statusErrorSx.className" :style="statusErrorSx.style">
      {{ slotState.error ?? '无法渲染此 PDF。' }}
    </div>
    <div v-else-if="isLoading" :class="statusSx.className" :style="statusSx.style">
      正在加载 PDF 预览
    </div>
  </DocumentContent>
</template>
