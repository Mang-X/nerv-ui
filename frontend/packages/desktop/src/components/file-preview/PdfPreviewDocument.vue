<script setup lang="ts">
import { useDocumentState } from '@embedpdf/core/vue'
import { DocumentContent } from '@embedpdf/plugin-document-manager/vue'
import { Scroller, useScroll } from '@embedpdf/plugin-scroll/vue'
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

const props = defineProps<{ documentId: string }>()

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
const { provides: scrollCapability } = useScroll(() => props.documentId)

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
      <PdfPreviewToolbar :document-id="documentId" />
      <div :class="canvasSx.className" :style="canvasSx.style">
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
    <div v-else-if="isError" :class="statusErrorSx.className" :style="statusErrorSx.style">
      {{ slotState.error ?? '无法渲染此 PDF。' }}
    </div>
    <div v-else-if="isLoading" :class="statusSx.className" :style="statusSx.style">
      正在加载 PDF 预览
    </div>
  </DocumentContent>
</template>
