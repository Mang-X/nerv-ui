<script setup lang="ts">
import { createPluginRegistration, type PluginRegistry } from '@embedpdf/core'
import { EmbedPDF } from '@embedpdf/core/vue'
import type { createPdfiumEngine } from '@embedpdf/engines/pdfium-direct-engine'
import {
  DocumentManagerPluginPackage,
  type DocumentManagerPlugin,
} from '@embedpdf/plugin-document-manager/vue'
import { RenderPluginPackage } from '@embedpdf/plugin-render/vue'
import { ScrollPluginPackage, ScrollStrategy } from '@embedpdf/plugin-scroll/vue'
import { ViewportPluginPackage } from '@embedpdf/plugin-viewport/vue'
import { ZoomMode, ZoomPluginPackage } from '@embedpdf/plugin-zoom/vue'
import * as stylex from '@stylexjs/stylex'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import wasmUrl from './assets/pdfium.wasm?url'
import PdfPreviewDocument from './PdfPreviewDocument.vue'
import { styles } from './viewer.styles'

const props = defineProps<{
  src: string
  showToolbar?: boolean
  showThumbnails?: boolean
}>()

const emit = defineEmits<{
  ready: []
  error: [message: string]
}>()

type Engine = Awaited<ReturnType<typeof createPdfiumEngine>>
const engine = shallowRef<Engine | null>(null)
const engineError = shallowRef<Error | null>(null)
const loading = ref(true)
const documentError = ref('')
let mounted = true
let sourceVersion = 0
const pendingDisposals = new Set<Promise<void>>()

const rootSx = stylex.props(styles.viewer)
const statusSx = stylex.props(styles.status)
const statusErrorSx = stylex.props(styles.status, styles.statusError)

function disposeRegistry(registry: PluginRegistry) {
  // 先登记 promise 再在 then 里销掉自己：引用自身会触发 TS7022 循环推断。
  const disposal: Promise<void> = registry
    .destroy()
    .then(() => undefined)
    .catch(() => undefined)
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
  } catch (cause) {
    if (!mounted) return
    engineError.value = cause instanceof Error ? cause : new Error(String(cause))
  } finally {
    if (mounted) loading.value = false
  }
})

/**
 * 每个 src 一个 provider：自己 fetch、自己 abort、自己登记 document。
 * embedpdf 2.14.4 的 openDocumentUrl 不会随任务取消 fetch，所以读取权归我们。
 */
const provider = computed(() => {
  const source = props.src
  let active = true
  const controller = new AbortController()
  const documentId = `nv-file-preview-pdf:${++sourceVersion}:${source}`
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
        // 排队的原生 open 可能比 registry 销毁活得更久，先把结果关掉再销毁引擎。
        // 这里的 disposer 只关心「什么时候可以销毁引擎」，不关心具体文档类型。
        const disposal: Promise<void> = opening
          .toPromise()
          .then((result) => (result as { task?: { toPromise: () => Promise<unknown> } }).task?.toPromise())
          .then(async (doc) => {
            if (!active || !mounted) {
              await instance.closeDocument(doc as Parameters<typeof instance.closeDocument>[0]).toPromise()
            }
          })
          .catch(() => {})
          .finally(() => pendingDisposals.delete(disposal))
        pendingDisposals.add(disposal)
      } catch (cause) {
        if (!active || !mounted) return
        if ((cause as Error)?.name === 'AbortError') return
        documentError.value = cause instanceof Error ? cause.message : String(cause)
        emit('error', documentError.value)
      }
    },
    ready() {
      if (active && mounted && source === props.src) emit('ready')
    },
    error(message: string) {
      if (active && mounted && source === props.src) emit('error', message)
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
  (_next, previous) => {
    previous.dispose()
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
    if (error) emit('error', error.message)
  },
  { immediate: true },
)
</script>

<template>
  <div data-slot="nv-file-preview-pdf" :class="rootSx.className" :style="rootSx.style">
    <div v-if="engineError" :class="statusErrorSx.className" :style="statusErrorSx.style">
      {{ engineError.message }}
    </div>
    <div v-else-if="loading || !engine" :class="statusSx.className" :style="statusSx.style">
      正在加载 PDF 引擎…
    </div>
    <div v-else-if="documentError" :class="statusErrorSx.className" :style="statusErrorSx.style">
      {{ documentError }}
    </div>
    <EmbedPDF
      v-else
      :key="src"
      :engine="engine"
      :plugins="plugins"
      :on-initialized="provider.initialize"
    >
      <PdfPreviewDocument
        :document-id="provider.documentId"
        :src="src"
        :show-toolbar="showToolbar"
        :show-thumbnails="showThumbnails"
        @ready="provider.ready"
        @error="provider.error"
      />
    </EmbedPDF>
  </div>
</template>
