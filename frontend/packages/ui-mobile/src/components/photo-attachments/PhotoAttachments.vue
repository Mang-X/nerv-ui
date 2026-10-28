<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { Camera } from '@lucide/vue'
import NvMobileButton from '../button/MobileButton.vue'
import NvMobileTag from '../tag/Tag.vue'
import type { PhotoAttachment, PhotoUpload } from './types'
const props = defineProps<{
  attachments: readonly PhotoAttachment[]
  contextKey: string
  purpose: string
  accept: string
  hint: string
  upload?: PhotoUpload
  title?: string
  disabled?: boolean
  disabledReason?: string
  /** Host-reviewed safe copy; raw exceptions are diagnostic-only. */
  errorMessage?: string
}>()
const emit = defineEmits<{
  'update:attachments': [attachments: PhotoAttachment[]]
  diagnostic: [error: unknown]
}>()
const input = ref<HTMLInputElement>()
const pending = shallowRef(false)
const error = shallowRef(false)
let active: AbortController | undefined
let disposed = false
const blocked = computed(() => props.disabled || !props.upload || pending.value)
function cancel() {
  active?.abort()
  active = undefined
  pending.value = false
  error.value = false
}
// Includes display-policy changes and deep same-key versions. A watcher is only
// early cancellation: commit-time comparison below remains authoritative.
function snapshot() {
  return JSON.stringify([
    props.contextKey,
    props.purpose,
    props.disabled,
    props.accept,
    props.hint,
    props.disabledReason,
    props.errorMessage,
    props.attachments,
  ])
}
watch(() => [snapshot(), props.upload, props.attachments], cancel, { flush: 'sync' })
onBeforeUnmount(() => {
  disposed = true
  cancel()
})
function pick() {
  if (blocked.value) return
  error.value = false
  input.value?.click()
}
async function select(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''
  const upload = props.upload
  if (!file || blocked.value || !upload) return
  const controller = new AbortController()
  const ownership = snapshot()
  const list = props.attachments
  active = controller
  pending.value = true
  error.value = false
  const current = () =>
    !disposed &&
    active === controller &&
    !controller.signal.aborted &&
    props.upload === upload &&
    props.attachments === list &&
    snapshot() === ownership
  try {
    const receipt = await upload(file, { signal: controller.signal, purpose: props.purpose })
    if (!current()) return
    if (
      !receipt ||
      typeof receipt.key !== 'string' ||
      !receipt.key.trim() ||
      typeof receipt.name !== 'string' ||
      !receipt.name.trim() ||
      (receipt.description !== undefined && typeof receipt.description !== 'string') ||
      props.attachments.some((item) => item.key === receipt.key)
    ) {
      throw new Error('Invalid photo receipt')
    }
    // Sanitize to the public receipt shape. No optimistic local list.
    const attachment = { key: receipt.key, name: receipt.name, description: receipt.description }
    if (current()) emit('update:attachments', [...props.attachments, attachment])
  } catch (cause) {
    if (!current()) return
    error.value = true
    emit('diagnostic', cause)
  } finally {
    if (current()) {
      active = undefined
      pending.value = false
    }
  }
}
function remove(key: string) {
  if (props.disabled || pending.value || !props.attachments.some((item) => item.key === key)) return
  emit(
    'update:attachments',
    props.attachments.filter((item) => item.key !== key),
  )
}
</script>

<template>
  <section
    data-slot="nv-photo-attachments"
    class="nv-m-photo-attachments space-y-3 rounded-xl border border-border bg-card p-3"
    :aria-label="title || '照片附件'"
    :aria-busy="pending"
  >
    <div class="flex items-center gap-2">
      <h2 class="text-lg font-semibold">{{ title || '照片附件' }}</h2>
      <NvMobileTag size="sm">{{ attachments.length }}</NvMobileTag>
    </div>
    <ul v-if="attachments.length" class="space-y-2" aria-label="已添加的照片">
      <li
        v-for="item in attachments"
        :key="item.key"
        :data-key="item.key"
        class="rounded-lg border border-border p-3"
      >
        <p class="break-all text-sm font-medium">{{ item.name }}</p>
        <p v-if="item.description" class="break-words text-sm text-muted-foreground">
          {{ item.description }}
        </p>
        <p class="break-all font-mono text-xs text-muted-foreground">{{ item.key }}</p>
        <NvMobileButton
          type="button"
          variant="text"
          :aria-label="`移除 ${item.name}（${item.key}）`"
          :disabled="disabled || pending"
          @click="remove(item.key)"
          >移除</NvMobileButton
        >
      </li>
    </ul>
    <input
      ref="input"
      type="file"
      :accept="accept"
      capture="environment"
      class="hidden"
      aria-label="选择照片"
      :disabled="blocked"
      @change="select"
    />
    <NvMobileButton
      type="button"
      variant="outline"
      block
      data-action="capture"
      :disabled="blocked"
      @click="pick"
    >
      <Camera class="size-4" aria-hidden="true" />拍照或选择照片
    </NvMobileButton>
    <template v-if="pending">
      <p role="status" class="text-sm text-muted-foreground">正在添加照片…</p>
      <NvMobileButton type="button" data-action="cancel" @click="cancel">取消添加</NvMobileButton>
    </template>
    <p v-if="error" role="alert" class="text-sm text-destructive">
      {{ errorMessage || '未能添加照片，请重试。' }}
    </p>
    <p v-if="disabled && disabledReason" class="text-sm text-muted-foreground">
      {{ disabledReason }}
    </p>
    <p v-else-if="!upload" class="text-sm text-muted-foreground">暂时无法添加照片。</p>
    <p class="text-sm text-muted-foreground">{{ hint }}</p>
  </section>
</template>
