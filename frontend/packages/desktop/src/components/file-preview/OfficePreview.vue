<script setup lang="ts">
import docxWasmUrl from './assets/docx_parser_bg.wasm?url'
import pptxWasmUrl from './assets/pptx_parser_bg.wasm?url'
import xlsxWasmUrl from './assets/xlsx_parser_bg.wasm?url'
import { ChevronLeftIcon, ChevronRightIcon, RotateCcwIcon } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import type { NvFilePreviewKind } from './types'
import { styles } from './viewer.styles'

const props = defineProps<{
  src: string
  kind: NvFilePreviewKind
  showToolbar?: boolean
}>()

const emit = defineEmits<{
  ready: []
  error: [message: string]
}>()

/**
 * `@silurus/ooxml` 的 viewer 是一组命令式实例：构造时接管一个 canvas / 容器，
 * `load(buffer)` 解析，`destroy()` 释放。这里只保留跨三种类型都用得到的那部分 API。
 */
type OfficeViewer = {
  destroy: () => void
  pageCount?: number
  currentPage?: number
  slideCount?: number
  sheetCount?: number
  sheetNames?: string[]
  goToPage?: (index: number) => Promise<void>
  goToSlide?: (index: number) => Promise<void>
  goToSheet?: (index: number) => Promise<void>
  nextPage?: () => Promise<void>
  prevPage?: () => Promise<void>
  nextSlide?: () => Promise<void>
  prevSlide?: () => Promise<void>
}

const rootSx = stylex.props(styles.viewer)
const toolbarSx = stylex.props(styles.toolbar)
const iconButtonSx = stylex.props(styles.iconButton)
const labelSx = stylex.props(styles.label)
const selectSx = stylex.props(styles.select)
const spacerSx = stylex.props(styles.toolbarSpacer)
const canvasAreaSx = stylex.props(styles.canvasArea)
const statusSx = stylex.props(styles.status)
const statusErrorSx = stylex.props(styles.status, styles.statusError)

const containerRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()
const spreadsheetRef = ref<HTMLDivElement>()
const viewer = shallowRef<OfficeViewer | null>(null)
const loading = ref(true)
const errorMessage = ref('')
const total = ref(0)
const currentIndex = ref(0)
const sheetNames = ref<string[]>([])

let runVersion = 0
let mounted = true

const isDocx = computed(() => props.kind === 'office-docx')
const isPptx = computed(() => props.kind === 'office-pptx')
const isXlsx = computed(() => props.kind === 'office-xlsx')
const canGoPrevious = computed(() => currentIndex.value > 0)
const canGoNext = computed(() => currentIndex.value < total.value - 1)
const indexOptions = computed(() => Array.from({ length: total.value }, (_, i) => i))
const indexLabel = computed(() => {
  if (isXlsx.value) return sheetNames.value[currentIndex.value] ?? `工作表 ${currentIndex.value + 1}`
  return `第 ${currentIndex.value + 1} 页`
})

function destroyViewer() {
  viewer.value?.destroy()
  viewer.value = null
}

function onIndexChange(index: number) {
  currentIndex.value = index
}

function onError(cause: unknown) {
  errorMessage.value = cause instanceof Error ? cause.message : String(cause)
  emit('error', errorMessage.value)
}

function getCanvasWidth() {
  const area = containerRef.value
  // 渲染宽度按容器算，避免 100% 宽度下 canvas 被拉伸变形。
  return area ? Math.max(320, Math.round(area.clientWidth - 24)) : 720
}

async function loadDocument() {
  const version = ++runVersion
  const isCurrent = () => mounted && version === runVersion
  errorMessage.value = ''
  loading.value = true
  total.value = 0
  currentIndex.value = 0
  sheetNames.value = []
  destroyViewer()

  const source = props.src
  const kind = props.kind
  const controller = new AbortController()

  try {
    const accept =
      kind === 'office-docx'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : kind === 'office-xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    const response = await fetch(source, { headers: { Accept: accept }, signal: controller.signal })
    if (!isCurrent()) return
    if (!response.ok) throw new Error(`无法加载文件（HTTP ${response.status}）。`)
    const buffer = await response.arrayBuffer()
    if (!isCurrent()) return

    // OOXML 是 ZIP 容器：先校验魔数，坏文件给一句人话而不是解析器内部报错。
    const signature = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 4))
    if (
      signature.length < 4 ||
      signature[0] !== 0x50 ||
      signature[1] !== 0x4b ||
      signature[2] !== 3 ||
      signature[3] !== 4
    ) {
      throw new Error('文件不是有效的 OOXML 文档（应为 docx / xlsx / pptx）。')
    }

    await nextTick()
    if (!isCurrent()) return

    if (kind === 'office-docx') {
      if (!canvasRef.value) throw new Error('文档画布尚未就绪。')
      const { DocxViewer } = await import('@silurus/ooxml/docx')
      if (!isCurrent()) return
      const instance = new DocxViewer(canvasRef.value, {
        container: containerRef.value,
        wasmUrl: docxWasmUrl,
        useGoogleFonts: false,
        enableTextSelection: true,
        width: getCanvasWidth(),
        onPageChange: onIndexChange,
        onError,
      })
      viewer.value = instance as unknown as OfficeViewer
      await instance.load(buffer)
      if (!isCurrent()) return
      total.value = instance.pageCount
    } else if (kind === 'office-pptx') {
      if (!canvasRef.value) throw new Error('演示稿画布尚未就绪。')
      const { PptxViewer } = await import('@silurus/ooxml/pptx')
      if (!isCurrent()) return
      const instance = new PptxViewer(canvasRef.value, {
        wasmUrl: pptxWasmUrl,
        useGoogleFonts: false,
        enableTextSelection: true,
        width: getCanvasWidth(),
        onSlideChange: onIndexChange,
        onError,
      })
      viewer.value = instance as unknown as OfficeViewer
      await instance.load(buffer)
      if (!isCurrent()) return
      total.value = instance.slideCount
    } else {
      if (!spreadsheetRef.value) throw new Error('表格容器尚未就绪。')
      const { XlsxViewer } = await import('@silurus/ooxml/xlsx')
      if (!isCurrent()) return
      const instance = new XlsxViewer(spreadsheetRef.value, {
        wasmUrl: xlsxWasmUrl,
        useGoogleFonts: false,
        showZoomSlider: false,
        onReady: (names: string[]) => {
          if (isCurrent()) {
            sheetNames.value = names
            total.value = names.length
          }
        },
        onSheetChange: onIndexChange,
        onError,
      })
      viewer.value = instance as unknown as OfficeViewer
      await instance.load(buffer)
      if (!isCurrent()) return
      sheetNames.value = instance.sheetNames ?? []
      total.value = instance.sheetCount ?? sheetNames.value.length
    }

    if (isCurrent() && !errorMessage.value) {
      if (total.value < 1) throw new Error('文档没有可预览的页面或工作表。')
      emit('ready')
    }
  } catch (cause) {
    if (!isCurrent()) return
    if ((cause as Error)?.name === 'AbortError') return
    onError(cause)
  } finally {
    if (isCurrent()) loading.value = false
  }
}

function goPrevious() {
  const active = viewer.value
  if (!active || !canGoPrevious.value) return
  if (isDocx.value) void active.prevPage?.()
  else if (isPptx.value) void active.prevSlide?.()
  else void active.goToSheet?.(currentIndex.value - 1)
}

function goNext() {
  const active = viewer.value
  if (!active || !canGoNext.value) return
  if (isDocx.value) void active.nextPage?.()
  else if (isPptx.value) void active.nextSlide?.()
  else void active.goToSheet?.(currentIndex.value + 1)
}

function jumpTo(event: Event) {
  const target = Number((event.target as HTMLSelectElement).value)
  const active = viewer.value
  if (!Number.isInteger(target) || target < 0 || target >= total.value || !active) return
  if (isDocx.value) void active.goToPage?.(target)
  else if (isPptx.value) void active.goToSlide?.(target)
  else void active.goToSheet?.(target)
}

watch(
  () => [props.src, props.kind] as const,
  () => void loadDocument(),
  { immediate: true },
)

onMounted(() => {
  mounted = true
})

onBeforeUnmount(() => {
  mounted = false
  runVersion++
  destroyViewer()
})
</script>

<template>
  <div data-slot="nv-file-preview-office" :class="rootSx.className" :style="rootSx.style">
    <div v-if="showToolbar !== false" :class="toolbarSx.className" :style="toolbarSx.style">
      <button
        type="button"
        aria-label="上一项"
        :class="iconButtonSx.className"
        :style="iconButtonSx.style"
        :data-disabled="canGoPrevious ? undefined : ''"
        @click="goPrevious"
      >
        <ChevronLeftIcon :size="16" aria-hidden="true" />
      </button>
      <select
        :value="String(currentIndex)"
        :aria-label="indexLabel"
        :class="selectSx.className"
        :style="selectSx.style"
        @change="jumpTo"
      >
        <option v-for="index in indexOptions" :key="index" :value="String(index)">
          {{ isXlsx ? sheetNames[index] ?? `工作表 ${index + 1}` : `第 ${index + 1} 页` }}
        </option>
      </select>
      <span :class="labelSx.className" :style="labelSx.style">/ {{ total || '—' }}</span>
      <button
        type="button"
        aria-label="下一项"
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
        aria-label="重新加载"
        :class="iconButtonSx.className"
        :style="iconButtonSx.style"
        @click="loadDocument"
      >
        <RotateCcwIcon :size="16" aria-hidden="true" />
      </button>
    </div>

    <div v-if="errorMessage" :class="statusErrorSx.className" :style="statusErrorSx.style">
      {{ errorMessage }}
    </div>
    <div v-else-if="loading" :class="statusSx.className" :style="statusSx.style">
      正在解析文档…
    </div>

    <!-- 三种 viewer 各自接管不同的宿主节点；非当前类型的不挂载。 -->
    <div
      ref="containerRef"
      :class="canvasAreaSx.className"
      :style="[canvasAreaSx.style, loading || errorMessage ? { display: 'none' } : undefined]"
    >
      <canvas v-if="isDocx || isPptx" ref="canvasRef" style="display: block; max-width: 100%" />
      <div v-else ref="spreadsheetRef" style="width: 100%; height: 100%" />
    </div>
  </div>
</template>
