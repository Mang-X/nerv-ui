<script setup lang="ts">
import { onBeforeUnmount, shallowRef } from 'vue'
import {
  NvNoticeBar,
  NvMobileButton,
  NvMobileEmpty,
  NvMobileErrorRetry,
  NvMobileResult,
  NvMobileSkeleton,
} from '@nerv-iip/ui-mobile'
const notice = shallowRef(true)
const detail = shallowRef('尚未查看通知')
const state = shallowRef<'empty' | 'pending' | 'failed' | 'success' | 'error'>('empty')
const requests = shallowRef(0)
let timer: ReturnType<typeof setTimeout> | undefined
function collect() {
  if (state.value === 'pending') return
  const attempt = ++requests.value
  state.value = 'pending'
  timer = setTimeout(() => {
    state.value = attempt === 1 ? 'failed' : 'success'
    timer = undefined
  }, 700)
}
function showError() {
  clearTimeout(timer)
  timer = undefined
  state.value = 'error'
}
function clear() {
  clearTimeout(timer)
  timer = undefined
  requests.value = 0
  state.value = 'empty'
}
onBeforeUnmount(() => clearTimeout(timer))
const labels = {
  empty: '尚未收集',
  pending: '收集中',
  failed: '收集失败',
  success: '收集成功',
  error: '结果失败',
}
</script>
<template>
  <section aria-labelledby="feedback-states-title" class="space-y-4">
    <h2 id="feedback-states-title" class="text-lg font-semibold">每次回响都有回应</h2>
    <NvNoticeBar v-if="notice"
      ><span>周末一起去看风景</span
      ><span class="ml-2 inline-flex gap-2"
        ><button
          type="button"
          class="min-h-11 px-2 underline"
          @click="detail = '下一次散步安排在周六下午。'"
        >
          查看通知</button
        ><button type="button" class="min-h-11 px-2 underline" @click="notice = false">
          关闭通知
        </button></span
      ></NvNoticeBar
    >
    <NvMobileButton size="lg" v-else variant="outline" @click="notice = true"
      >恢复通知</NvMobileButton
    >
    <p aria-label="通知回显" class="text-sm text-muted-foreground">{{ detail }}</p>
    <div class="rounded-xl border border-border bg-card p-4">
      <NvMobileEmpty v-if="state === 'empty'" description="尚未收集回响">
        <template #icon><span class="text-3xl" aria-hidden="true">✉</span></template>
        <NvMobileButton size="lg" @click="collect">收集回响</NvMobileButton>
      </NvMobileEmpty>
      <div
        v-else-if="state === 'pending' && requests === 1"
        class="space-y-3 py-8"
        aria-label="回响加载中"
      >
        <NvMobileSkeleton /><NvMobileSkeleton class="w-2/3" />
      </div>
      <NvMobileErrorRetry
        v-else-if="state === 'failed' || state === 'pending'"
        message="暂时无法收集，请重试"
        :pending="state === 'pending'"
        @retry="collect"
      />
      <NvMobileResult
        v-else
        :status="state === 'success' ? 'success' : 'error'"
        :title="state === 'success' ? '收到了 3 条回响' : '这次整理未完成'"
        :description="
          state === 'success' ? '小小的回应，也值得记住。' : '回响仍然保留，可以重新收集。'
        "
      >
        <template #actions
          ><NvMobileButton size="lg" block @click="collect">重新收集</NvMobileButton></template
        >
      </NvMobileResult>
      <p aria-label="收集状态" aria-live="polite" class="mt-3 text-sm text-muted-foreground">
        {{ labels[state] }} · 请求 {{ requests }} 次
      </p>
    </div>
    <div class="flex flex-wrap gap-2">
      <NvMobileButton size="lg" variant="outline" @click="showError">查看失败结果</NvMobileButton
      ><NvMobileButton size="lg" variant="text" @click="clear">清空回响</NvMobileButton>
    </div>
  </section>
</template>
