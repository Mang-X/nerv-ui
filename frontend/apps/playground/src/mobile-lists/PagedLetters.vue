<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { NvInfiniteList } from '@nerv-ui/ui-mobile'
const letters = (start: number, end: number) =>
  Array.from({ length: end - start }, (_, i) => `来信 ${start + i + 1}`)
const rows = shallowRef(letters(0, 8))
const loading = shallowRef(false)
const error = shallowRef(false)
const empty = shallowRef(false)
const failNext = shallowRef(false)
const requests = shallowRef(0)
const finished = computed(() => rows.value.length >= 24)
const status = computed(() =>
  loading.value
    ? '加载中'
    : error.value
      ? '加载失败'
      : finished.value
        ? '全部读完'
        : empty.value
          ? '信箱为空'
          : '可以继续',
)
let timer: ReturnType<typeof setTimeout> | undefined
function load() {
  if (timer !== undefined || error.value || finished.value) return
  empty.value = false
  loading.value = true
  requests.value++
  const fail = failNext.value
  failNext.value = false
  timer = setTimeout(() => {
    if (fail) error.value = true
    else
      rows.value = [
        ...rows.value,
        ...letters(rows.value.length, Math.min(24, rows.value.length + 8)),
      ]
    loading.value = false
    timer = undefined
  }, 650)
}
function retry() {
  error.value = false
  load()
}
function reset(clear = false) {
  clearTimeout(timer)
  timer = undefined
  loading.value = false
  error.value = false
  empty.value = clear
  rows.value = clear ? [] : letters(0, 8)
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <section aria-labelledby="page-title" class="space-y-3">
    <h2 id="page-title" class="text-lg font-semibold">继续翻阅</h2>
    <p class="text-sm text-muted-foreground">在来信内滚动到底部，分批收下 24 封来信。</p>
    <label class="flex min-h-touch items-center gap-2 text-sm">
      <input v-model="failNext" type="checkbox" aria-label="下次加载失败" />下次加载失败
    </label>
    <div class="flex flex-wrap gap-3">
      <button
        type="button"
        class="min-h-touch rounded-lg border border-border px-3 text-sm"
        @click="reset()"
      >
        重新开始
      </button>
      <button
        type="button"
        class="min-h-touch rounded-lg border border-border px-3 text-sm"
        @click="reset(true)"
      >
        清空信箱
      </button>
    </div>
    <output aria-label="分页状态" aria-live="polite" class="block text-sm"
      >{{ status }} · {{ rows.length }} 封 · 请求 {{ requests }} 次</output
    >
    <p v-if="empty" class="text-sm">
      还没有来信。<button type="button" class="min-h-touch px-3 underline" @click="load">
        加载首批
      </button>
    </p>
    <p v-if="error" class="text-sm text-destructive">
      未能收到下一批，已保留来信。<button
        type="button"
        class="min-h-touch px-3 underline"
        @click="retry"
      >
        重试加载
      </button>
    </p>
    <NvInfiniteList
      v-model="loading"
      :paused="error || empty"
      :finished="finished"
      finished-text="没有更多来信"
      class="h-64 overscroll-contain rounded-xl border border-border"
      @load="load"
    >
      <div
        v-for="row in rows"
        :key="row"
        data-page-row
        class="flex h-12 items-center border-b border-border px-4 text-sm"
      >
        {{ row }}
      </div>
    </NvInfiniteList>
  </section>
</template>
