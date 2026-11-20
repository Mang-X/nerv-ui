<script setup lang="ts">
import { shallowRef } from 'vue'
import { NvMobileBadge, NvMobileButton, NvMobileTag, NvMobileToast } from '@nerv-ui/ui-mobile'
const count = shallowRef(7)
const dot = shallowRef(false)
const tag = shallowRef(true)
const tagOutput = shallowRef('周末标签已保留')
const show = shallowRef(false)
const type = shallowRef<'text' | 'loading' | 'success' | 'error'>('text')
const message = shallowRef('')
const duration = shallowRef(1200)
function toast(next: typeof type.value) {
  type.value = next
  duration.value = 1200
  message.value = {
    text: '已记住这一刻',
    loading: '正在整理回响',
    success: '回响已收好',
    error: '暂时未能保存',
  }[next]
  show.value = true
}
function closeTag() {
  tag.value = false
  tagOutput.value = '已移除「周末」'
}
function restoreTag() {
  tag.value = true
  tagOutput.value = '周末标签已保留'
}
function setCount(value: number) {
  count.value = value
  dot.value = false
}
</script>
<template>
  <section aria-labelledby="feedback-signals-title" class="space-y-4">
    <h2 id="feedback-signals-title" class="text-lg font-semibold">轻轻提醒一下</h2>
    <div class="flex flex-wrap items-center gap-5 px-2">
      <NvMobileBadge :count="count" :max="9" :dot="dot"
        ><span class="rounded-lg bg-muted px-3 py-2">回响信箱</span></NvMobileBadge
      >
      <NvMobileTag v-if="tag" variant="brand" closable @close="closeTag"
        ><span aria-hidden="true">◇</span>周末</NvMobileTag
      >
      <NvMobileTag variant="success" size="sm">已读</NvMobileTag>
    </div>
    <p aria-label="提醒数值" class="text-sm text-muted-foreground">
      {{ dot ? '有新回响，数量未知' : `未读 ${count} 条` }}
    </p>
    <p aria-label="标签回显" class="text-sm text-muted-foreground">{{ tagOutput }}</p>
    <div class="flex flex-wrap gap-2">
      <NvMobileButton size="lg" variant="outline" @click="setCount(27)">超过上限</NvMobileButton>
      <NvMobileButton size="lg" variant="outline" @click="dot = true">仅显示圆点</NvMobileButton>
      <NvMobileButton size="lg" variant="outline" @click="setCount(0)">没有未读</NvMobileButton>
      <NvMobileButton size="lg" v-if="!tag" variant="text" @click="restoreTag"
        >恢复标签</NvMobileButton
      >
    </div>
    <div class="flex flex-wrap gap-2">
      <NvMobileButton size="lg" @click="toast('text')">短暂提示</NvMobileButton>
      <NvMobileButton size="lg" variant="outline" @click="toast('loading')"
        >持续等待</NvMobileButton
      >
      <NvMobileButton size="lg" variant="outline" @click="toast('success')"
        >更新为成功</NvMobileButton
      >
      <NvMobileButton size="lg" variant="outline" @click="toast('error')">失败提示</NvMobileButton>
      <NvMobileButton
        size="lg"
        variant="outline"
        :disabled="!show || type === 'loading'"
        @click="duration = 2400"
        >延长提示</NvMobileButton
      >
      <NvMobileButton size="lg" variant="text" @click="show = false">关闭提示</NvMobileButton>
    </div>
    <p aria-label="提示状态" aria-live="polite" class="text-sm text-muted-foreground">
      {{ show ? `显示中 · ${type} · ${duration}ms` : '已关闭' }}
    </p>
    <NvMobileToast v-model:show="show" :message="message" :type="type" :duration="duration" />
  </section>
</template>
