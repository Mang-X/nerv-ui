<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, useTemplateRef } from 'vue'
import {
  FileUpload,
  NvButton,
  type FileUploadCompletedFile,
  type FileUploadExpose,
  type FileUploadRejectedFile,
  type FileUploadRow,
  type FileUploadVariant,
} from '@nerv-iip/ui'
import { createMemoryUpload } from './memoryUpload'

const upload = useTemplateRef<FileUploadExpose>('upload')
const adapter = createMemoryUpload()
const { state } = adapter
const variant = ref<FileUploadVariant>('queue')
const variants: FileUploadVariant[] = [
  'default',
  'queue',
  'compact',
  'avatar',
  'gallery',
  'table',
  'image',
]
const automatic = ref(false)
const disabled = ref(false)
const limit = ref(5)
const filter = ref('mixed')
const accepted = computed(
  () =>
    ({
      mixed: ['image/*', '.txt', 'application/pdf'],
      extension: ['.png', '.txt'],
      mime: ['image/png', 'text/plain'],
      wildcard: ['image/*'],
      any: [],
    })[filter.value] ?? [],
)
const receipts = shallowRef<FileUploadCompletedFile[]>([])
const rejected = shallowRef<FileUploadRejectedFile[]>([])
const failure = ref('')
function completed(files: FileUploadCompletedFile[]) {
  receipts.value = files
  state.events.push(`receipt ${files.map((f) => `${f.fileName}:${f.fileId}`).join(',')}`)
}
function failed(row: FileUploadRow) {
  failure.value = `${row.fileName}：${row.error}`
  state.events.push(`failed ${failure.value}`)
}
function clear() {
  upload.value?.pauseAll()
  upload.value?.clear()
  receipts.value = []
  rejected.value = []
  failure.value = ''
}
function replaceAvatar(event: Event) {
  // Avatar's public selection contract replaces its queue without synthetic completed([]).
  if (variant.value !== 'avatar' || disabled.value) return
  if (event.type === 'change' && !(event.target as HTMLInputElement).files?.length) return
  if (event.type === 'drop' && !(event as DragEvent).dataTransfer?.files.length) return
  clear()
}
async function addCollection() {
  limit.value = 48
  await nextTick()
  void upload.value?.addFiles(
    Array.from(
      { length: 48 },
      (_, i) =>
        new File([`Local note ${i + 1}\n`], `moment-${String(i + 1).padStart(2, '0')}.txt`, {
          type: 'text/plain',
        }),
    ),
  )
}
onBeforeUnmount(clear)

// Local fixture control/readback survives route disposal so acceptance can
// release already-issued promises and inspect signals, not just hidden rows.
// No File contents or network access are exposed here.
const fixtureControl = {
  readback: () => ({
    ...adapter.readback(),
    receipts: [...receipts.value],
    failure: failure.value,
  }),
  release: adapter.release,
  advance: adapter.advance,
  fail: adapter.fail,
}
;(window as Window & { __nervUploadFixture?: typeof fixtureControl }).__nervUploadFixture =
  fixtureControl
</script>

<template>
  <section aria-labelledby="upload-heading" class="min-w-0 space-y-5">
    <div>
      <h2 id="upload-heading" class="text-xl font-semibold">整理文件</h2>
      <p class="mt-1 text-sm text-muted-foreground">只在本页暂存，离开即清空。上传进度由你推进。</p>
    </div>
    <div class="flex flex-wrap items-end gap-3">
      <label class="grid gap-1 text-sm"
        >排列方式
        <select
          v-model="variant"
          aria-label="上传排列方式"
          class="min-h-11 rounded-md border bg-background px-3"
          @change="clear"
        >
          <option v-for="item in variants" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>
      <label class="grid gap-1 text-sm"
        >文件类型
        <select
          v-model="filter"
          aria-label="可选文件类型"
          class="min-h-11 rounded-md border bg-background px-3"
        >
          <option value="mixed">图片、文本、PDF</option>
          <option value="extension">扩展名 .png / .txt</option>
          <option value="mime">PNG / 纯文本 MIME</option>
          <option value="wildcard">所有图片 image/*</option>
          <option value="any">不限类型</option>
        </select>
      </label>
      <label class="grid gap-1 text-sm"
        >最多文件
        <select
          v-model="limit"
          aria-label="最多文件"
          class="min-h-11 rounded-md border bg-background px-3"
        >
          <option :value="1">1</option>
          <option :value="5">5</option>
          <option :value="48">48</option>
        </select>
      </label>
      <label class="inline-flex min-h-11 items-center gap-2 text-sm"
        ><input v-model="automatic" type="checkbox" />选中即开始</label
      >
      <label class="inline-flex min-h-11 items-center gap-2 text-sm"
        ><input v-model="disabled" type="checkbox" />锁定选择</label
      >
    </div>
    <div @change.capture="replaceAvatar" @drop.capture="replaceAvatar">
      <FileUpload
        ref="upload"
        :variant="variant"
        purpose="attachment"
        owner-service="local-host"
        owner-type="collection"
        owner-id="personal"
        organization-id="local"
        environment-id="memory"
        :auto-upload="automatic"
        :disabled="disabled"
        :max-files="variant === 'avatar' ? 1 : limit"
        :max-file-size-bytes="32768"
        :accepted-content-types="accepted"
        :create-upload-session="adapter.createUploadSession"
        :complete-upload-session="adapter.completeUploadSession"
        :transport="adapter.transport"
        @completed="completed"
        @rejected="rejected = $event"
        @failed="failed"
      />
    </div>
    <div class="flex flex-wrap gap-2">
      <NvButton variant="brand" @click="upload?.uploadQueued()">开始上传</NvButton>
      <NvButton variant="outline" @click="upload?.pauseAll()">暂停全部</NvButton>
      <NvButton variant="outline" @click="upload?.resumeAll()">继续全部</NvButton>
      <NvButton variant="ghost" @click="clear">清空文件</NvButton>
    </div>
    <div class="rounded-lg border bg-muted/20 p-4">
      <div class="mb-3 flex flex-wrap gap-3 text-sm">
        <label><input v-model="state.holdCreate" type="checkbox" />等待创建会话</label>
        <label><input v-model="state.holdComplete" type="checkbox" />等待完成回执</label>
        <label><input v-model="state.ignoreAbort" type="checkbox" />模拟传输忽略取消</label>
      </div>
      <div class="flex flex-wrap gap-2">
        <NvButton
          variant="outline"
          :disabled="!state.gates.some((g) => g.stage === 'create')"
          @click="adapter.release('create')"
          >释放创建</NvButton
        >
        <NvButton
          variant="outline"
          :disabled="!state.gates.some((g) => g.stage === 'create')"
          @click="adapter.release('create', true)"
          >创建失败</NvButton
        >
        <NvButton
          variant="outline"
          :disabled="!state.gates.some((g) => g.stage === 'complete')"
          @click="adapter.release('complete')"
          >释放回执</NvButton
        >
        <NvButton
          variant="outline"
          :disabled="!state.gates.some((g) => g.stage === 'complete')"
          @click="adapter.release('complete', true)"
          >回执失败</NvButton
        >
        <NvButton variant="outline" :disabled="state.pending === 0" @click="adapter.advance"
          >推进传输</NvButton
        >
        <NvButton variant="outline" :disabled="state.pending === 0" @click="adapter.fail"
          >本次传输失败</NvButton
        >
        <NvButton
          variant="ghost"
          :disabled="disabled || variant === 'avatar'"
          @click="addCollection"
          >加入 48 份便笺</NvButton
        >
      </div>
      <p class="mt-2 text-sm text-muted-foreground">
        每次推进至 25%、65%、100%；失败后可在文件行重试。
      </p>
      <output aria-label="等待闸门" class="mt-2 block text-xs">{{
        state.gates.map((g) => `${g.stage} #${g.id} ${g.sessionId}`).join(' · ') || '无等待闸门'
      }}</output>
      <output aria-label="传输计数" class="mt-3 block break-words font-mono text-xs"
        >create {{ state.counts.create }} · transport {{ state.counts.transport }} · complete
        {{ state.counts.complete }} · abort {{ state.counts.abort }} · fail
        {{ state.counts.fail }} · pending {{ state.pending }}</output
      >
    </div>
    <p v-if="rejected.length" role="alert" class="break-words text-sm text-destructive">
      {{ rejected.map((item) => `${item.fileName}：${item.reason}`).join('；') }}
    </p>
    <p v-if="failure" role="status" class="break-words text-sm text-destructive">{{ failure }}</p>
    <section aria-label="成功回执" class="rounded-lg border p-4">
      <h3 class="font-medium">已暂存文件</h3>
      <p v-if="receipts.length === 0" class="mt-2 text-sm text-muted-foreground">尚无成功文件</p>
      <ul v-else class="mt-2 space-y-1 text-sm">
        <li v-for="item in receipts" :key="item.fileId" class="break-words">
          {{ item.fileName }} <span class="text-muted-foreground">{{ item.fileId }}</span>
        </li>
      </ul>
    </section>
    <details class="text-xs text-muted-foreground">
      <summary class="min-h-11 cursor-pointer py-3">查看本次操作记录</summary>
      <ol aria-label="上传操作记录" class="space-y-1 break-words">
        <li v-for="(event, index) in state.events" :key="index">{{ event }}</li>
      </ol>
    </details>
  </section>
</template>
