<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  NvMobileTaskListShell,
  NvMobileButton,
  type MobileListPosition,
  type MobileListStorage,
} from '@nerv-ui/ui-mobile'
import { useMemoryList } from './useMemoryList'
const props = defineProps<{ source?: string }>()
const source = computed(() => (props.source === 'studio' ? 'studio' : 'library'))
const filter = shallowRef('all')
const paused = shallowRef(false)
const failNext = shallowRef(false)
const diagnostics = shallowRef<unknown>()
const positions = new Map<string, MobileListPosition>()
const storage: MobileListStorage = {
  load: (key) => positions.get(key),
  save: (key, value) => positions.set(key, value),
}
const list = useMemoryList({
  source: () => source.value,
  filter: () => filter.value,
  paused: () => paused.value,
  diagnostic: (error) => {
    diagnostics.value = error
  },
  async read({ source, filter, cursor, signal }) {
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 300)
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer)
          resolve()
        },
        { once: true },
      )
    })
    if (signal.aborted) throw new Error('cancelled')
    if (failNext.value) {
      failNext.value = false
      throw new Error('demo temporarily unavailable')
    }
    const total = filter === 'saved' ? 8 : 32
    const next = Math.min(total, cursor + 8)
    return {
      rows: Array.from({ length: next - cursor }, (_, i) => ({
        id: `${source}-${filter}-${cursor + i}`,
        title: `${source === 'library' ? '阅读手记' : '画室灵感'} ${cursor + i + 1}：把喜欢的片刻慢慢收好，留待下次翻阅。`,
      })),
      next: next === total ? null : next,
    }
  },
})
const { rows, state, pending, revision, hasMore, errorMessage, appendErrorMessage } = list
</script>

<template>
  <main class="mx-auto flex h-dvh max-w-lg flex-col p-3">
    <h1 class="text-lg font-semibold">{{ source === 'library' ? '阅读手记' : '画室灵感' }}</h1>
    <p class="text-sm text-muted-foreground">仅保存在本页内存，离开页面后清除。</p>
    <nav aria-label="切换收藏" class="flex flex-wrap gap-3">
      <a class="inline-flex min-h-touch items-center" href="#mobile-task-list/library">阅读手记</a>
      <a class="inline-flex min-h-touch items-center" href="#mobile-task-list/studio">画室灵感</a>
      <a class="inline-flex min-h-touch items-center" href="#">返回发现页</a>
    </nav>
    <NvMobileButton @click="failNext = true">让下次加载暂缓</NvMobileButton>
    <NvMobileTaskListShell
      class="min-h-0 flex-1"
      :source-key="source"
      :filter-key="filter"
      :page-key="revision"
      :loaded="rows.length"
      :state="state"
      :has-more="hasMore"
      :pending="pending"
      :paused="paused"
      :error-message="errorMessage"
      :append-error-message="appendErrorMessage"
      :storage="storage"
      @update:paused="paused = $event"
      @restore-filter="filter = $event"
      @storage-error="diagnostics = $event"
      @refresh="list.request()"
      @retry="list.request()"
      @load-more="list.request(true)"
      @retry-load-more="list.request(true)"
    >
      <template #filters>
        <label class="flex min-h-touch items-center gap-3"
          >查看范围
          <select v-model="filter" class="min-h-touch rounded-md bg-card text-sm">
            <option value="all">全部</option>
            <option value="saved">精选</option>
          </select>
        </label>
      </template>
      <ul aria-label="收藏内容" class="space-y-3 p-3">
        <li
          v-for="row in rows"
          :key="row.id"
          class="rounded-lg bg-card p-4 text-sm leading-relaxed break-words"
        >
          {{ row.title }}
        </li>
      </ul>
    </NvMobileTaskListShell>
  </main>
</template>
