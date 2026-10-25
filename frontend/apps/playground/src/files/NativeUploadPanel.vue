<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef, useTemplateRef } from 'vue'
import {
  FileUpload,
  NvButton,
  type FileUploadCompletedFile,
  type FileUploadExpose,
  type FileUploadSession,
  type FileUploadVariant,
} from '@nerv-iip/ui'

const prefix = '/__native-fixture'
const upload = useTemplateRef<FileUploadExpose>('nativeUpload')
const mode = ref('tus')
const scenario = ref('ok')
const variant = ref<FileUploadVariant>('queue')
const receipts = shallowRef<FileUploadCompletedFile[]>([])
const readback = ref('尚未读取')
const failure = ref('')
const busy = ref(0)
const controllers = new Set<AbortController>()
const sessions = new Map<string, FileUploadSession>()
let disposed = false
// Session/readback/reset fetches are owned here; FileUpload owns transport abort.
async function request(path: string, init: RequestInit = {}) {
  const controller = new AbortController()
  controllers.add(controller)
  busy.value++
  try {
    const response = await fetch(`${prefix}${path}`, { ...init, signal: controller.signal })
    if (!response.ok) throw new Error(`Fixture HTTP ${response.status}: ${await response.text()}`)
    return response.status === 204 ? undefined : await response.json()
  } finally {
    controllers.delete(controller)
    busy.value--
  }
}
async function createUploadSession() {
  const session = (await request('/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: mode.value, scenario: scenario.value }),
  })) as FileUploadSession
  sessions.set(session.uploadSessionId, session)
  return session
}
async function completeUploadSession(id: string) {
  const session = sessions.get(id)!
  return request(`/${id}/complete`, { method: 'POST', headers: session.upload.headers })
}
function clear() {
  upload.value?.pauseAll()
  upload.value?.clear()
  receipts.value = []
  failure.value = ''
}
async function resume() {
  await upload.value?.resumeAll()
  await upload.value?.retryFailed()
}
async function addFixture() {
  const bytes = Uint8Array.from({ length: 2 * 1024 * 1024 + 17 }, (_, i) => i % 251)
  await upload.value?.addFiles([
    new File([bytes], 'native-fixture.bin', { type: 'application/octet-stream' }),
  ])
}
async function inspect() {
  try {
    readback.value = JSON.stringify(await request('/readback'), null, 2)
  } catch (error) {
    if (!disposed) failure.value = String(error)
  }
}
async function reset() {
  clear()
  // Server remains authoritative: reset refuses while any transport is pending.
  try {
    await request('/reset', { method: 'POST' })
    sessions.clear()
    await inspect()
  } catch (error) {
    if (!disposed) failure.value = String(error)
  }
}
onBeforeUnmount(() => {
  disposed = true
  clear()
  controllers.forEach((controller) => controller.abort())
})
</script>

<template>
  <section aria-label="本机原生传输" class="min-w-0 space-y-4">
    <h2 class="text-xl font-semibold">本机原生传输</h2>
    <p class="text-sm text-muted-foreground">
      只发送内置 2 MiB + 17 字节夹具。回执代表本机模拟端点确认，不是生产 FileStorage。PUT
      只显示等待与传输完成，传输完成后还需确认回执。
    </p>
    <div class="flex flex-wrap gap-3">
      <label
        >协议
        <select
          v-model="mode"
          aria-label="原生协议"
          class="min-h-11 rounded border"
          @change="clear"
        >
          <option value="tus">tus</option>
          <option value="server-proxy">server-proxy PUT</option>
        </select></label
      >
      <label
        >场景
        <select
          v-model="scenario"
          aria-label="原生场景"
          class="min-h-11 rounded border"
          @change="clear"
        >
          <option value="ok">成功</option>
          <option value="cancel">等待第二片以取消</option>
          <option
            v-for="code in ['409', '412', '413', '460', '403', '500', 'network']"
            :key="code"
            :value="code"
          >
            {{ code }}
          </option>
          <option
            v-for="value in [
              'head-missing',
              'head-nan',
              'head-negative',
              'head-fraction',
              'head-oversize',
              'patch-missing',
              'patch-nan',
              'patch-negative',
              'patch-fraction',
              'patch-oversize',
              'patch-stall',
              'patch-backwards',
            ]"
            :key="value"
            :value="value"
          >
            {{ value }}
          </option>
        </select></label
      >
      <label
        >排列
        <select
          v-model="variant"
          aria-label="原生排列"
          class="min-h-11 rounded border"
          @change="clear"
        >
          <option
            v-for="value in ['default', 'queue', 'compact', 'avatar', 'gallery', 'table', 'image']"
            :key="value"
            :value="value"
          >
            {{ value }}
          </option>
        </select></label
      >
    </div>
    <!-- No user-controlled picker/drop in native mode; only the known generated fixture. -->
    <div inert class="pointer-events-none">
      <FileUpload
        ref="nativeUpload"
        :variant="variant"
        purpose="attachment"
        owner-service="local-fixture"
        owner-type="fixture"
        owner-id="known"
        organization-id="local"
        environment-id="loopback"
        :auto-upload="false"
        :max-files="1"
        :max-file-size-bytes="2097169"
        :accepted-content-types="['.bin']"
        :create-upload-session="createUploadSession"
        :complete-upload-session="completeUploadSession"
        @completed="receipts = $event"
        @failed="failure = $event.error ?? '传输失败'"
      />
    </div>
    <div class="flex flex-wrap gap-2">
      <NvButton variant="outline" @click="addFixture">加入已知二进制夹具</NvButton>
      <NvButton variant="brand" @click="upload?.uploadQueued()">开始原生上传</NvButton>
      <NvButton variant="outline" @click="upload?.pauseAll()">取消原生传输</NvButton>
      <NvButton variant="outline" @click="resume">恢复原生传输</NvButton>
      <NvButton variant="ghost" @click="clear">清空原生队列</NvButton>
      <NvButton variant="outline" :disabled="busy > 0" @click="inspect">读取端点</NvButton>
      <NvButton variant="outline" :disabled="busy > 0" @click="reset">重置端点</NvButton>
    </div>
    <p v-if="failure" role="alert" class="break-words text-sm text-destructive">{{ failure }}</p>
    <output aria-label="本机成功回执" class="block break-words text-sm">{{
      receipts.length
        ? receipts.map((r) => `${r.fileName}: ${r.fileId}`).join(' · ')
        : '尚无本机成功回执'
    }}</output>
    <details>
      <summary class="min-h-11 cursor-pointer py-3">端点只读记录</summary>
      <pre
        aria-label="端点读回"
        class="max-h-96 overflow-auto whitespace-pre-wrap break-all text-xs"
        >{{ readback }}</pre
      >
    </details>
  </section>
</template>
