<script setup lang="ts">
import { useDocumentState } from '@embedpdf/core/vue'
import { DocumentContent } from '@embedpdf/plugin-document-manager/vue'
import { RenderLayer } from '@embedpdf/plugin-render/vue'
import { Scroller } from '@embedpdf/plugin-scroll/vue'
import {
  useIsViewportGated,
  useViewportCapability,
  useViewportPlugin,
} from '@embedpdf/plugin-viewport/vue'
import { computed, useTemplateRef, watch } from 'vue'

import PdfPreviewToolbar from './PdfPreviewToolbar.vue'

const props = defineProps<{
  documentId: string
}>()

const emit = defineEmits<{
  ready: []
  error: [message: string]
}>()

// The 2.14.4 Viewport SFC never disconnects its ResizeObserver. Own only this DOM bridge.
const viewportElement = useTemplateRef<HTMLDivElement>('viewportElement')
const { plugin: viewportPlugin } = useViewportPlugin()
const { provides: viewportCapability } = useViewportCapability()
const viewportGap = computed(() => viewportCapability.value?.getViewportGap() ?? 10)
const isGated = useIsViewportGated(() => props.documentId)
watch(
  [viewportPlugin, viewportElement, () => props.documentId],
  ([plugin, element, documentId], _old, onCleanup) => {
    if (!plugin || !element) return
    plugin.registerViewport(documentId)
    const scroll = () =>
      plugin.setViewportScrollMetrics(documentId, {
        scrollTop: element.scrollTop,
        scrollLeft: element.scrollLeft,
      })
    const resize = new ResizeObserver(() =>
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
      }),
    )
    resize.observe(element)
    element.addEventListener('scroll', scroll)
    const frames = new Set<number>()
    const unsubscribe = plugin.onScrollRequest(documentId, ({ x, y, behavior = 'auto' }) => {
      const frame = requestAnimationFrame(() => {
        frames.delete(frame)
        element.scrollTo({ left: x, top: y, behavior })
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
    <div v-if="isLoaded" class="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)]">
      <PdfPreviewToolbar :document-id="documentId" />
      <div class="min-h-0 overflow-hidden bg-slate-100 text-slate-950 [color-scheme:light]">
        <div
          ref="viewportElement"
          data-slot="file-preview-pdf-viewport"
          :style="{ padding: viewportGap + 'px' }"
          class="h-full min-h-0 w-full overflow-auto bg-slate-100"
        >
          <Scroller v-if="!isGated" :document-id="documentId">
            <template #default="{ page }">
              <div
                data-slot="file-preview-pdf-page"
                :data-page-number="page.pageIndex + 1"
                class="relative mx-auto bg-white shadow-sm"
                :style="{ width: `${page.width}px`, height: `${page.height}px` }"
              >
                <RenderLayer :document-id="documentId" :page-index="page.pageIndex" />
              </div>
            </template>
          </Scroller>
        </div>
      </div>
    </div>
    <div
      v-else-if="isError"
      class="grid h-full min-h-64 place-items-center bg-muted/20 p-6 text-center text-sm text-destructive"
    >
      {{ slotState.error ?? '无法渲染此 PDF。' }}
    </div>
    <div
      v-else-if="isLoading"
      class="grid h-full min-h-64 place-items-center bg-muted/20 text-sm text-muted-foreground"
    >
      正在加载 PDF 预览
    </div>
  </DocumentContent>
</template>
