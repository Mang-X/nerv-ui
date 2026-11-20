<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import * as stylex from '@stylexjs/stylex'
import NvIcon from '../../theme/NvIcon.vue'
import { computed, defineAsyncComponent, ref } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './FilePreview.styles'
import { fileExtension, resolveKind } from './kind'
import { styles as viewerStyles } from './viewer.styles'
import type { NvFilePreviewKind, NvFilePreviewProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvFilePreviewProps>(), {
  height: 420,
  showHeader: true,
  showToolbar: true,
  loading: false,
  error: null,
  sizeBytes: undefined,
  showThumbnails: false,
})

const emit = defineEmits<{
  openSource: [src: string]
  ready: [kind: NvFilePreviewKind]
  error: [message: string]
}>()

// 引擎体积大（pdfium 4.4 MB、三个 OOXML wasm 各 ~0.8 MB），只在真的用到时才拉。
const PdfPreview = defineAsyncComponent(() => import('./PdfPreview.vue'))
const OfficePreview = defineAsyncComponent(() => import('./OfficePreview.vue'))
const ImagePreview = defineAsyncComponent(() => import('./ImagePreview.vue'))

const kind = computed(() => resolveKind(props.fileName, props.contentType))
const extension = computed(() => fileExtension(props.fileName))
const displayName = computed(() => props.fileName?.trim() || '未命名文件')
const typeLabel = computed(() => {
  if (props.contentType) return props.contentType
  if (extension.value) return `.${extension.value} 文件`
  return '未知类型'
})
const sizeLabel = computed(() => formatSize(props.sizeBytes))
/** 头部副标题：类型 · 大小，缺一项就不带那个分隔点。 */
const subtitle = computed(() => [typeLabel.value, sizeLabel.value].filter(Boolean).join(' · '))
const canOpen = computed(() => Boolean(props.src))
const internalError = ref('')
const displayError = computed(() => props.error || internalError.value)
const isPlaceholder = computed(() => !props.src || kind.value === 'other')

const kindIcon = computed(() => {
  switch (kind.value) {
    case 'pdf':
      return 'file-pdf'
    case 'office-docx':
    case 'office-pptx':
      return 'file-presentation'
    case 'office-xlsx':
      return 'file-spreadsheet'
    case 'image':
      return 'file-image'
    default:
      return 'file-question'
  }
})

const rootSx = computed(() => stylex.props(styles.root))
const placeholderSx = stylex.props(styles.placeholder)
const placeholderIconSx = stylex.props(styles.placeholderIcon)
const placeholderTitleSx = stylex.props(styles.placeholderTitle)
const placeholderMetaSx = stylex.props(styles.placeholderMeta)
const placeholderNoteSx = stylex.props(styles.placeholderNote)
const headerSx = computed(() => stylex.props(viewerStyles.header))
const headerIconSx = computed(() => stylex.props(viewerStyles.headerIcon))
const headerTextSx = computed(() => stylex.props(viewerStyles.headerText))
const headerTitleSx = computed(() => stylex.props(viewerStyles.headerTitle))
const headerMetaSx = computed(() => stylex.props(viewerStyles.headerMeta))
const iconButtonSx = computed(() => stylex.props(viewerStyles.iconButton))
const statusSx = stylex.props(viewerStyles.status)
const statusErrorSx = stylex.props(viewerStyles.status, viewerStyles.statusError)
const linkSx = stylex.props(styles.link)
const bodySx = stylex.props(styles.body)
/** `height` 是预览区高度，挂在根节点上让每个分支都填满。 */
const rootStyle = computed(() => ({ height: `${Math.max(120, props.height)}px` }))

/** 字节 → 人读尺寸（B / KB / MB / GB）。 */
function formatSize(bytes: number | undefined): string {
  if (!bytes || bytes <= 0) return ''
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  const digits = value >= 100 || unit === 0 ? 0 : value >= 10 ? 1 : 2
  return `${value.toFixed(digits)} ${units[unit]}`
}

function openSource() {
  if (!props.src) return
  emit('openSource', props.src)
}

function handleReady() {
  props.onReady?.(kind.value)
  emit('ready', kind.value)
}

function handleError(message: string) {
  internalError.value = message
  props.onError?.(message)
  emit('error', message)
}
</script>

<template>
  <section
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, rootStyle, $attrs.style]"
    v-bind="omitClassStyle($attrs)"
    data-slot="nv-file-preview"
  >
    <header v-if="showHeader" :class="headerSx.className" :style="headerSx.style">
      <span :class="headerIconSx.className" :style="headerIconSx.style">
        <NvIcon :name="kindIcon" :size="16" />
      </span>
      <span :class="headerTextSx.className" :style="headerTextSx.style">
        <span :class="headerTitleSx.className" :style="headerTitleSx.style">{{ displayName }}</span>
        <span :class="headerMetaSx.className" :style="headerMetaSx.style">{{ subtitle }}</span>
      </span>
      <Button
        v-if="canOpen"
        type="button"
        :aria-label="`在新窗口打开 ${displayName}`"
        :class="iconButtonSx.className"
        :style="iconButtonSx.style"
        @click="openSource"
      >
        <NvIcon name="external-link" :size="15" />
      </Button>
    </header>

    <div :class="bodySx.className" :style="bodySx.style">
    <div
      v-if="loading"
      :class="statusSx.className"
      :style="[statusSx.style, { flex: 1 }]"
      data-slot="nv-file-preview-loading"
    >
      正在加载预览…
    </div>

    <div
      v-else-if="displayError"
      :class="statusErrorSx.className"
      :style="[statusErrorSx.style, { flex: 1 }]"
      data-slot="nv-file-preview-error"
    >
      <NvIcon name="alert-circle" :size="20" />
      <span>预览失败：{{ displayError }}</span>
    </div>

    <ImagePreview
      v-else-if="kind === 'image' && src"
      :src="src"
      :file-name="displayName"
      @ready="handleReady"
      @error="handleError"
    />

    <!-- PDF 走 pdfium（embedpdf 2.14.4）：内置阅读器在嵌入页/离线包/移动 WebView 里
         不可靠，也拿不到页码、缩放与连续滚动。 -->
    <PdfPreview
      v-else-if="kind === 'pdf' && src"
      :src="src"
      :show-toolbar="showToolbar"
      :show-thumbnails="showThumbnails"
      @ready="handleReady"
      @error="handleError"
    />

    <!-- docx / xlsx / pptx 走 @silurus/ooxml 的 wasm 解析器，真正排版渲染而非占位。 -->
    <OfficePreview
      v-else-if="kind.startsWith('office') && src"
      :src="src"
      :kind="kind"
      :show-toolbar="showToolbar"
      @ready="handleReady"
      @error="handleError"
    />

    <div v-else-if="isPlaceholder" :class="placeholderSx.className">
      <NvIcon name="file-text" :class="placeholderIconSx.className" :size="36" :stroke-width="1.5" />
      <span :class="placeholderTitleSx.className">{{ displayName }}</span>
      <span :class="placeholderMetaSx.className">{{ subtitle }}</span>
      <span :class="placeholderNoteSx.className">
        {{
          canOpen
            ? '该类型暂不支持在线预览，可打开或下载后查看。'
            : '未提供文件地址，无法生成预览。'
        }}
      </span>
      <a
        v-if="canOpen"
        :href="src"
        target="_blank"
        rel="noopener noreferrer"
        :class="linkSx.className"
        :style="linkSx.style"
        @click.prevent="openSource"
      >
        打开文件
      </a>
    </div>
    </div>
  </section>
</template>
