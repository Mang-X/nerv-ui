<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  NvPhotoAttachments,
  NvMobileButton,
  type PhotoAttachment,
  type PhotoUpload,
} from '@nerv-ui/ui-mobile'
const props = defineProps<{ source?: string }>()
const source = computed(() => (props.source === 'studio' ? 'studio' : 'library'))
const attachments = ref<PhotoAttachment[]>([])
const failNext = ref(false)
const paused = ref(false)
let sequence = 0
watch(
  source,
  () => {
    attachments.value = []
    failNext.value = false
    paused.value = false
  },
  { flush: 'sync' },
)
// This adapter returns explicit page-only receipts. It never calls a backend.
const upload: PhotoUpload = async (file, { signal }) => {
  await Promise.resolve()
  if (signal.aborted) throw new Error('cancelled')
  if (
    file.size > 5 * 1024 * 1024 ||
    !['image/jpeg', 'image/png'].includes(file.type) ||
    failNext.value
  ) {
    failNext.value = false
    throw new Error('page adapter rejected photo')
  }
  const index = ++sequence
  return {
    key: `${source.value}-${index}`,
    name: file.name,
    description: `第 ${index} 张 · ${(file.size / 1024).toFixed(1)} KB`,
  }
}
</script>
<template>
  <main class="mx-auto max-w-md space-y-4 p-4 pb-safe text-foreground">
    <nav class="flex flex-wrap gap-3" aria-label="照片导航">
      <a href="#mobile-photos/library" class="inline-flex min-h-11 items-center">阅读剪影</a>
      <a href="#mobile-photos/studio" class="inline-flex min-h-11 items-center">画室色彩</a>
      <a href="#mobile" class="inline-flex min-h-11 items-center">返回随行</a>
    </nav>
    <h1 class="text-2xl font-semibold">{{ source === 'library' ? '阅读剪影' : '画室色彩' }}</h1>
    <p class="text-sm text-muted-foreground">
      选几张喜欢的照片，在这里试着整理。离开本页后不会保存。
    </p>
    <div class="flex flex-wrap gap-2">
      <NvMobileButton type="button" @click="failNext = true">让下次添加暂缓</NvMobileButton>
      <NvMobileButton type="button" @click="paused = !paused">{{
        paused ? '继续添加' : '暂停添加'
      }}</NvMobileButton>
      <NvMobileButton type="button" @click="attachments = []">清空照片</NvMobileButton>
    </div>
    <NvPhotoAttachments
      v-model:attachments="attachments"
      :context-key="source"
      :purpose="source"
      :upload="upload"
      :disabled="paused"
      disabled-reason="已暂停，可以继续添加。"
      accept="image/jpeg,image/png"
      hint="支持 JPG、PNG，单张最多 5 MB。添加完成后才会列出。"
      error-message="这次未能添加，请选择不超过 5 MB 的 JPG 或 PNG 照片重试。"
    />
  </main>
</template>
