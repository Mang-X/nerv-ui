<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { FileTextIcon } from '@lucide/vue'
import { computed, defineAsyncComponent } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './FilePreview.styles'
import { fileExtension, resolveKind } from './kind'
import type { NvFilePreviewProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvFilePreviewProps>(), {
  height: 400,
})

// 引擎体积大（pdfium 4.4 MB、三个 OOXML wasm 各 ~0.8 MB），只在真的用到时才拉。
const PdfPreview = defineAsyncComponent(() => import('./PdfPreview.vue'))
const OfficePreview = defineAsyncComponent(() => import('./OfficePreview.vue'))

const kind = computed(() => resolveKind(props.fileName, props.contentType))
const extension = computed(() => fileExtension(props.fileName))
const displayName = computed(() => props.fileName?.trim() || '未命名文件')
const typeLabel = computed(() => {
  if (props.contentType) return props.contentType
  if (extension.value) return `.${extension.value} 文件`
  return '未知类型'
})
const canOpen = computed(() => Boolean(props.src))
// 有地址但类型不支持 → 建议下载/打开；根本没给地址 → 说清楚缺什么，别让人以为「不支持」。
const note = computed(() =>
  canOpen.value ? '该类型暂不支持在线预览，可打开或下载后查看。' : '未提供文件地址，无法生成预览。',
)
const needsSource = computed(() =>
  kind.value === 'pdf' || kind.value.startsWith('office'),
)

const rootSx = computed(() => stylex.props(styles.root))
const imageSx = stylex.props(styles.image)
const placeholderSx = stylex.props(styles.placeholder)
const placeholderIconSx = stylex.props(styles.placeholderIcon)
const placeholderTitleSx = stylex.props(styles.placeholderTitle)
const placeholderMetaSx = stylex.props(styles.placeholderMeta)
const placeholderNoteSx = stylex.props(styles.placeholderNote)
const linkSx = stylex.props(styles.link)
/** `height` 是预览区高度，挂在根节点上让每个分支都填满。 */
const rootStyle = computed(() => ({ height: `${Math.max(120, props.height)}px` }))

function handleReady() {
  props.onReady?.(kind.value)
}

function handleError(message: string) {
  props.onError?.(message)
}
</script>

<template>
  <div
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, rootStyle, $attrs.style]"
    v-bind="omitClassStyle($attrs)"
  >
    <img
      v-if="kind === 'image' && src"
      :src="src"
      :alt="displayName"
      :class="imageSx.className"
      loading="lazy"
      decoding="async"
    />

    <!-- PDF 走 pdfium（embedpdf W4），不进浏览器内置阅读器：内置阅读器在嵌入页/
         离线包/移动端 WebView 里不可靠，也拿不到页码、缩放与连续滚动。 -->
    <PdfPreview
      v-else-if="kind === 'pdf' && src"
      :src="src"
      @ready="handleReady"
      @error="handleError"
    />

    <!-- docx / xlsx / pptx 走 @silurus/ooxml 的 wasm 解析器，真正排版渲染而非占位。 -->
    <OfficePreview
      v-else-if="kind.startsWith('office') && src"
      :src="src"
      :kind="kind"
      @ready="handleReady"
      @error="handleError"
    />

    <div v-else :class="placeholderSx.className">
      <FileTextIcon :class="placeholderIconSx.className" :size="36" :stroke-width="1.5" />
      <span :class="placeholderTitleSx.className">{{ displayName }}</span>
      <span :class="placeholderMetaSx.className">{{ typeLabel }}</span>
      <span v-if="needsSource" :class="placeholderNoteSx.className">
        未提供文件地址，无法生成预览。
      </span>
      <span v-else :class="placeholderNoteSx.className">{{ note }}</span>
      <a
        v-if="canOpen"
        :href="src"
        target="_blank"
        rel="noopener noreferrer"
        :class="linkSx.className"
      >
        打开文件
      </a>
    </div>
  </div>
</template>
