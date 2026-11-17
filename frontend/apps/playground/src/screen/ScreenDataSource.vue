<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { NvScreenButton, NvScreenFreshness, NvScreenPanel, useScreenData } from '@nerv-iip/ui'
import type { SpaceFeed } from './data-fixtures'

const props = defineProps<{ feed: SpaceFeed; title: string }>()
// Fixed for this component's lifetime; the host remounts with :key when identity changes.
const feed = props.feed
const failNext = shallowRef(false)
const running = shallowRef(true)
const retain = shallowRef(true)
const { data, error, loading, lastUpdated, isStale, refresh, start, stop } = useScreenData(
  () => {
    const fail = failNext.value
    failNext.value = false
    return feed.fetcher(fail)
  },
  { intervalMs: 2000, immediate: false },
)
const tone = computed(() =>
  isStale.value ? 'stale' : lastUpdated.value === undefined ? 'wait' : 'live',
)
const label = computed(() =>
  loading.value
    ? '正在更新'
    : error.value
      ? data.value === undefined
        ? '尚无数据 · 本次未取到'
        : '数据滞留 · 本次未取到'
      : lastUpdated.value === undefined
        ? '等待首次数据'
        : '更新完成',
)
const timestamp = computed(() =>
  lastUpdated.value === undefined ? '—' : String(lastUpdated.value),
)
function failOnce() {
  if (loading.value) return
  failNext.value = true
  void refresh()
}
function togglePolling() {
  if (running.value) stop()
  else start()
  running.value = !running.value
}
</script>

<template>
  <NvScreenPanel :title="title" :aria-label="title">
    <div class="source-meta">
      {{ feed.id }} · 请求 {{ feed.requests.value }} · {{ running ? '每 2 秒更新' : '轮询已停止' }}
    </div>
    <NvScreenFreshness :tone="tone" :label="label" />
    <p class="source-result" aria-label="当前内容">
      {{ data && (retain || !error) ? data.text : data ? '内容已暂时撤下' : '尚无内容' }}
    </p>
    <p class="source-time">最近成功：{{ timestamp }}</p>
    <div class="source-actions">
      <NvScreenButton size="sm" @click="refresh">刷新</NvScreenButton>
      <NvScreenButton size="sm" variant="secondary" @click="failOnce">失败一次</NvScreenButton>
      <NvScreenButton
        size="sm"
        variant="secondary"
        :aria-pressed="running"
        @click="togglePolling"
        >{{ running ? '停止轮询' : '开始轮询' }}</NvScreenButton
      >
      <label
        ><input v-model="feed.held.value" type="checkbox" aria-label="暂缓完成" /> 暂缓完成</label
      >
      <label
        ><input v-model="retain" type="checkbox" aria-label="失败时保留内容" />
        失败时保留内容</label
      >
    </div>
  </NvScreenPanel>
</template>

<style scoped>
@layer app {
  .source-meta,
  .source-time {
    color: var(--nv-scr-muted);
    font-size: 16px;
    margin: 12px 0;
    font-variant-numeric: tabular-nums;
  }
  .source-result {
    font-size: 25px;
    min-height: 40px;
    margin: 16px 0;
  }
  .source-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
    font-size: 16px;
  }
  .source-actions label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}
</style>
