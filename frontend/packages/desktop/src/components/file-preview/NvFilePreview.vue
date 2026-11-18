<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { FileTextIcon } from '@lucide/vue'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './FilePreview.styles'
import type { NvFilePreviewKind, NvFilePreviewProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvFilePreviewProps>(), {
  // 默认高度只够放下占位卡片；要更大的画布由调用方显式传 height。
  height: 240,
})

const imageExtensions = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'svg'])

const extension = computed(() => {
  const name = props.fileName ?? ''
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : ''
})

const kind = computed<NvFilePreviewKind>(() => {
  const type = (props.contentType ?? '').toLowerCase()
  if (type.startsWith('image/')) return 'image'
  if (type === 'application/pdf' || type === 'application/x-pdf') return 'pdf'
  if (extension.value === 'pdf') return 'pdf'
  if (!type && imageExtensions.has(extension.value)) return 'image'
  return 'other'
})

const displayName = computed(() => props.fileName?.trim() || '未命名文件')
const typeLabel = computed(() => {
  if (props.contentType) return props.contentType
  if (extension.value) return `.${extension.value} 文件`
  return '未知类型'
})
const canOpen = computed(() => Boolean(props.src))
// 有地址但类型不支持 → 建议下载/打开；根本没给地址 → 说清楚缺什么，别让用户以为「不支持」。
const note = computed(() =>
  canOpen.value ? '该类型暂不支持在线预览，可打开或下载后查看。' : '未提供文件地址，无法生成预览。',
)

const rootSx = computed(() => stylex.props(styles.root))
const imageSx = stylex.props(styles.image)
const frameSx = stylex.props(styles.frame)
const placeholderSx = stylex.props(styles.placeholder)
const placeholderIconSx = stylex.props(styles.placeholderIcon)
const placeholderTitleSx = stylex.props(styles.placeholderTitle)
const placeholderMetaSx = stylex.props(styles.placeholderMeta)
const placeholderNoteSx = stylex.props(styles.placeholderNote)
const linkSx = stylex.props(styles.link)
/** `height` is the preview area height; kept on the root so every branch fills it. */
const rootStyle = computed(() => ({ height: `${Math.max(120, props.height)}px` }))
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

    <!--
      Simplified PDF preview: rely on the browser's built-in PDF viewer through
      an <iframe>. No pdfium/embedpdf dependency is pulled in. Replace this
      branch with a dedicated renderer later without changing the public props.
    -->
    <iframe
      v-else-if="kind === 'pdf' && src"
      :src="src"
      :title="displayName"
      :class="frameSx.className"
    />

    <div v-else :class="placeholderSx.className">
      <FileTextIcon :class="placeholderIconSx.className" :size="36" :stroke-width="1.5" />
      <span :class="placeholderTitleSx.className">{{ displayName }}</span>
      <span :class="placeholderMetaSx.className">{{ typeLabel }}</span>
      <span :class="placeholderNoteSx.className">{{ note }}</span>
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
