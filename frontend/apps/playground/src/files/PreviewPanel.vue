<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, shallowRef } from 'vue'
import { NvButton } from '@nerv-iip/ui'
import { FilePreview } from '@nerv-iip/ui/file-preview'

const samples = [
  {
    id: 'svg',
    label: '图形记录 SVG',
    src: import.meta.env.BASE_URL + 'files/quality-evidence.svg',
    fileName: 'quality-evidence.svg',
    contentType: 'image/svg+xml',
  },
  {
    id: 'png',
    label: '花园 PNG',
    src: '/files/garden.png',
    fileName: 'garden.png',
    contentType: 'image/png',
  },
  {
    id: 'jpeg',
    label: '海岸 JPEG',
    src: '/files/coast.jpg',
    fileName: 'coast.jpg',
    contentType: 'image/jpeg',
  },
  ...[
    ['pdf-single', '阅读记录 PDF', 'quality-evidence-report.pdf'],
    ['pdf-pages', '阅读旅程（三页 PDF）', 'reading-journey.pdf'],
    ['pdf-chinese', '春日阅读（中文 PDF）', 'reading-chinese.pdf'],
    ['pdf-broken', '损坏 PDF', 'broken.pdf'],
    ['pdf-missing', '无效 PDF 地址', 'missing.pdf'],
  ].map(([id, label, fileName]) => ({
    id: id!,
    label: label!,
    src: import.meta.env.BASE_URL + 'files/' + fileName,
    fileName: fileName!,
    contentType: 'application/pdf',
  })),
  {
    id: 'broken',
    label: '损坏图片',
    src: '/files/broken.png',
    fileName: 'broken.png',
    contentType: 'image/png',
  },
  {
    id: 'missing',
    label: '无效图片地址',
    src: '/files/missing.png',
    fileName: 'missing.png',
    contentType: 'image/png',
  },
  { id: 'empty', label: '尚未选择', src: undefined, fileName: '未选择文件', contentType: '' },
  {
    id: 'text',
    label: '文本（不支持）',
    src: '/files/notes.txt',
    fileName: 'notes.txt',
    contentType: 'text/plain',
  },
  {
    id: 'legacy',
    label: '旧版文档（不支持）',
    src: '/files/notes.txt',
    fileName: 'legacy.doc',
    contentType: 'application/msword',
  },
  {
    id: 'media',
    label: '音视频（不支持）',
    src: '/files/notes.txt',
    fileName: 'recording.mp4',
    contentType: 'video/mp4',
  },
  {
    id: 'archive',
    label: '压缩包（不支持）',
    src: '/files/notes.txt',
    fileName: 'collection.zip',
    contentType: 'application/zip',
  },
]
const sample = ref('svg')
const source = shallowRef(samples[0]!)
const ownedUrl = ref<string>()
const loading = ref(false)
const error = ref(false)
const lastEvent = ref('尚无事件')
const requested = ref('')
const opened = ref(0)
const notice = ref('')
async function replaceSource(value: typeof source.value, owned?: string) {
  const previous = ownedUrl.value
  ownedUrl.value = owned
  source.value = value
  requested.value = ''
  lastEvent.value = '等待预览'
  loading.value = false
  error.value = false
  // The keyed preview unmounts the old image before its host URL is released.
  await nextTick()
  if (previous) URL.revokeObjectURL(previous)
}
function chooseSample() {
  const value = samples.find((item) => item.id === sample.value)
  if (value) void replaceSource(value)
}
function chooseLocal(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (
    !file.type.startsWith('image/') &&
    file.type !== 'application/pdf' &&
    !file.name.toLowerCase().endsWith('.pdf')
  ) {
    notice.value = '请选择本地图片或 PDF。'
    return
  }
  notice.value = ''
  const url = URL.createObjectURL(file)
  sample.value = 'local'
  void replaceSource(
    { id: 'local', label: file.name, src: url, fileName: file.name, contentType: file.type },
    url,
  )
}
function requestSource(src: string) {
  requested.value = src
  lastEvent.value = 'openSource'
}
function openSource() {
  const src = requested.value
  if (!src || src !== source.value.src) return
  if (src !== ownedUrl.value && !samples.some((item) => item.src === src)) return
  window.open(src, '_blank', 'noopener,noreferrer')
  opened.value++
}
onBeforeUnmount(() => {
  if (ownedUrl.value) URL.revokeObjectURL(ownedUrl.value)
})
</script>

<template>
  <section aria-labelledby="preview-heading" class="min-w-0 space-y-5">
    <div>
      <h2 id="preview-heading" class="text-xl font-semibold">看见细节</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        本地图片可缩放与旋转，PDF 可翻页与缩放。其它文件保留原文件入口。
      </p>
    </div>
    <label class="grid gap-1 text-sm"
      >预览内容
      <select
        v-model="sample"
        aria-label="预览内容"
        class="min-h-11 w-full rounded-md border bg-background px-3"
        @change="chooseSample"
      >
        <option v-for="item in samples" :key="item.id" :value="item.id">{{ item.label }}</option>
        <option v-if="sample === 'local'" value="local">{{ source.fileName }}</option>
      </select>
    </label>
    <label class="grid gap-1 text-sm"
      >预览本地图片或 PDF<input
        type="file"
        accept="image/*,application/pdf,.pdf"
        aria-label="预览本地图片"
        class="min-h-11 max-w-full rounded-md border p-2"
        @change="chooseLocal"
    /></label>
    <div class="flex flex-wrap gap-4 text-sm">
      <label class="inline-flex min-h-11 items-center gap-2"
        ><input v-model="loading" type="checkbox" />等待来源</label
      ><label class="inline-flex min-h-11 items-center gap-2"
        ><input v-model="error" type="checkbox" />来源暂不可用</label
      >
    </div>
    <FilePreview
      :key="source.src ?? 'empty'"
      :src="source.src"
      :file-name="source.fileName"
      :content-type="source.contentType"
      :height="420"
      :loading="loading"
      :error="error ? '来源暂不可用，请取消勾选后重试。' : null"
      @ready="lastEvent = `ready ${$event}`"
      @error="lastEvent = `error ${$event}`"
      @open-source="requestSource"
    />
    <div class="flex flex-wrap items-center gap-3">
      <NvButton variant="outline" :disabled="!requested" @click="openSource">打开本地原图</NvButton
      ><span class="text-xs text-muted-foreground">先在预览中请求，再点击此处打开。</span>
    </div>
    <output aria-label="预览事件" class="block break-words text-sm text-muted-foreground"
      >{{ lastEvent }} · 已打开 {{ opened }} 次 · 本地预览 {{ ownedUrl ? 1 : 0 }}</output
    >
    <p v-if="notice" role="alert">{{ notice }}</p>
  </section>
</template>
