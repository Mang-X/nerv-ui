<script setup lang="ts">
import { createPluginRegistration, type PluginRegistry } from '@embedpdf/core'
import { EmbedPDF } from '@embedpdf/core/vue'
import type { createPdfiumEngine } from '@embedpdf/engines/pdfium-direct-engine'
import wasmUrl from './pdfium/pdfium.wasm?url'
import { DocumentManagerPluginPackage } from '@embedpdf/plugin-document-manager/vue'
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
  let registry: PluginRegistry | undefined
  return {
    source,
    documentId: 'file-preview-pdf:' + source,
    async initialize(value: PluginRegistry) {
      if (!active || !mounted) {
        disposeRegistry(value)
        return
      }
      registry = value
    },
    ready() {
      if (active && mounted && source === props.src) emit('ready', source)
    },
    error(message: string) {
      if (active && mounted && source === props.src) emit('error', message, source)
    },
    dispose() {
      active = false
      if (registry) {
        disposeRegistry(registry)
        registry = undefined
      }
    },
  }
})
watch(provider, (_value, old) => old.dispose(), { flush: 'sync' })
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
  createPluginRegistration(DocumentManagerPluginPackage, {
    initialDocuments: [
      {
        documentId: provider.value.documentId,
        url: props.src,
        requestOptions: { headers: { Accept: 'application/pdf' } },
        autoActivate: true,
      },
    ],
  }),
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
      <PdfPreviewDocument
        :document-id="provider.documentId"
        @ready="provider.ready"
        @error="provider.error"
      />
    </EmbedPDF>
  </div>
</template>
