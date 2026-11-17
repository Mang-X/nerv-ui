<script setup lang="ts">
import { createPluginRegistration, type PluginRegistry } from '@embedpdf/core'
import { EmbedPDF } from '@embedpdf/core/vue'
import type { createPdfiumEngine } from '@embedpdf/engines/pdfium-direct-engine'
import wasmUrl from './pdfium/pdfium.wasm?url'
import {
  DocumentManagerPluginPackage,
  type DocumentManagerPlugin,
} from '@embedpdf/plugin-document-manager/vue'
import { RenderPluginPackage } from '@embedpdf/plugin-render/vue'
import { ScrollPluginPackage, ScrollStrategy } from '@embedpdf/plugin-scroll/vue'
import { ViewportPluginPackage } from '@embedpdf/plugin-viewport/vue'
import { ZoomMode, ZoomPluginPackage } from '@embedpdf/plugin-zoom/vue'
import { computed, onBeforeUnmount, onErrorCaptured, onMounted, shallowRef, watch } from 'vue'

import PdfPreviewDocument from './PdfPreviewDocument.vue'

const props = defineProps<{
  src: string
}>()

const emit = defineEmits<{
  ready: [source: string]
  error: [message: string, source: string]
}>()

type Engine = Awaited<ReturnType<typeof createPdfiumEngine>>
const engine = shallowRef<Engine | null>(null)
const engineError = shallowRef<Error | null>(null)
const isLoading = shallowRef(true)
const documentLoading = shallowRef(true)
const documentError = shallowRef('')
let sourceVersion = 0
let mounted = true
const pendingDisposals = new Set<Promise<void>>()
function disposeRegistry(registry: PluginRegistry) {
  const disposal = registry
    .destroy()
    .catch(() => {})
    .then(() => {
      pendingDisposals.delete(disposal)
    })
  pendingDisposals.add(disposal)
}
function disposeEngine(instance: Engine) {
  instance.closeAllDocuments().wait(
    () => instance.destroy(),
    () => instance.destroy(),
  )
}
onMounted(async () => {
  try {
    const { createPdfiumEngine } = await import('@embedpdf/engines/pdfium-direct-engine')
    const instance = await createPdfiumEngine(wasmUrl, { fontFallback: null })
    if (!mounted) {
      disposeEngine(instance)
      return
    }
    engine.value = instance
    isLoading.value = false
  } catch (cause) {
    if (!mounted) return
    engineError.value = cause instanceof Error ? cause : new Error(String(cause))
    isLoading.value = false
  }
})
// Each provider keeps its own source even while an outgoing motion child is retained.
const provider = computed(() => {
  const source = props.src
  let active = true
  const controller = new AbortController()
  const documentId = 'file-preview-pdf:' + ++sourceVersion + ':' + source
  let registry: PluginRegistry | undefined
  return {
    source,
    documentId,
    async initialize(value: PluginRegistry) {
      if (!active || !mounted) {
        disposeRegistry(value)
        return
      }
      registry = value
      // 2.14.4 openDocumentUrl does not cancel fetch/body reads with its task.
      // Own the read here; only a current, fully read buffer may enter PDFium.
      const instance = engine.value!
      try {
        const response = await fetch(source, {
          headers: { Accept: 'application/pdf' },
          signal: controller.signal,
        })
        if (!active || !mounted) return
        if (!response.ok) throw new Error(`无法加载 PDF（HTTP ${response.status}）。`)
        const buffer = await response.arrayBuffer()
        if (!active || !mounted) return
        const manager = value.getPlugin<DocumentManagerPlugin>('document-manager')!.provides()
        const opening = manager.openDocumentBuffer({
          documentId,
          name: source,
          buffer,
          autoActivate: true,
        })
        // A queued native open can outlive registry removal. Close its actual
        // result before allowing engine destruction, including on source reuse.
        const disposal = opening
          .toPromise()
          .then(({ task }) => task.toPromise())
          .then(async (doc) => {
            if (!active || !mounted) await instance.closeDocument(doc).toPromise()
          })
          .catch(() => {})
          .finally(() => pendingDisposals.delete(disposal))
        pendingDisposals.add(disposal)
      } catch (cause) {
        if (!active || !mounted) return
        documentError.value = cause instanceof Error ? cause.message : String(cause)
        documentLoading.value = false
        emit('error', documentError.value, source)
      }
    },
    ready() {
      if (active && mounted && source === props.src) {
        documentLoading.value = false
        emit('ready', source)
      }
    },
    error(message: string) {
      if (active && mounted && source === props.src) emit('error', message, source)
    },
    dispose() {
      active = false
      controller.abort()
      if (registry) {
        disposeRegistry(registry)
        registry = undefined
      }
    },
  }
})
watch(
  provider,
  (_value, old) => {
    old.dispose()
    documentLoading.value = true
    documentError.value = ''
  },
  { flush: 'sync' },
)
onBeforeUnmount(() => {
  mounted = false
  provider.value.dispose()
  const instance = engine.value
  engine.value = null
  if (instance) void Promise.allSettled(pendingDisposals).then(() => disposeEngine(instance))
})
onErrorCaptured((cause) => {
  engineError.value = cause instanceof Error ? cause : new Error(String(cause))
  return false
})
const plugins = computed(() => [
  createPluginRegistration(DocumentManagerPluginPackage),
  createPluginRegistration(ViewportPluginPackage),
  createPluginRegistration(ScrollPluginPackage, {
    defaultStrategy: ScrollStrategy.Vertical,
    defaultPageGap: 12,
  }),
  createPluginRegistration(RenderPluginPackage),
  createPluginRegistration(ZoomPluginPackage, {
    defaultZoomLevel: ZoomMode.FitWidth,
    minZoom: 0.25,
    maxZoom: 4,
  }),
])
watch(
  engineError,
  (error) => {
    if (error) provider.value.error(error.message)
  },
  { immediate: true },
)
</script>

<template>
  <div data-slot="file-preview-pdf" class="h-full min-h-0 w-full overflow-hidden">
    <div
      v-if="engineError"
      class="grid h-full min-h-64 place-items-center bg-muted/20 p-6 text-center text-sm text-destructive"
    >
      {{ engineError.message }}
    </div>
    <div
      v-else-if="isLoading || !engine"
      class="grid h-full min-h-64 place-items-center bg-muted/20 text-sm text-muted-foreground"
    >
      正在加载 PDF 预览
    </div>
    <EmbedPDF
      v-else
      :key="src"
      :engine="engine!"
      :plugins="plugins"
      :on-initialized="provider.initialize"
    >
      <div
        v-if="documentLoading || documentError"
        class="grid h-full min-h-64 place-items-center bg-muted/20 text-sm text-muted-foreground"
      >
        {{ documentError || '正在加载 PDF 预览' }}
      </div>
      <PdfPreviewDocument
        :document-id="provider.documentId"
        @ready="provider.ready"
        @error="provider.error"
      />
    </EmbedPDF>
  </div>
</template>
