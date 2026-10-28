<script setup lang="ts">
import { computed, ref, reactive, onUnmounted } from 'vue'
import { NvButton } from '@nerv-iip/ui'
import DirectoryRecipe from './DirectoryRecipe.vue'
import type { DirectoryFilter, DirectoryHost, DirectoryRow } from './contract'
const space = ref(window.location.hash.endsWith('/studio') ? 'studio' : 'library')
function toggleSpace() {
  space.value = space.value === 'library' ? 'studio' : 'library'
  window.location.hash = `#directory-detail/${space.value}`
}
function syncSpace() {
  space.value = window.location.hash.endsWith('/studio') ? 'studio' : 'library'
}
window.addEventListener('hashchange', syncSpace)
onUnmounted(() => window.removeEventListener('hashchange', syncSpace))
const filter = ref<DirectoryFilter>({ parent: 'p', entity: '', keyword: '' })
const failed = ref(false)
const makeRecords = (): DirectoryRow[] =>
  Array.from({ length: 5 }, (_, i) => ({
    key: String(i),
    code: `R-${i + 1}`,
    name: ['窗边阅读角', '共读长桌', '静读小屋', '手作长桌', '交流空间'][i]!,
    parent: i < 3 ? 'p' : 'q',
    quantity: i === 0 ? 0 : i + 0.12345,
    note: i === 0 ? '午后的阳光落在书页上。' : '',
    eligible: i !== 2,
    reason: i === 2 ? '此空间暂不接受安排。' : '',
  }))
const sources = { library: reactive(makeRecords()), studio: reactive(makeRecords()) }
const host = computed<DirectoryHost>(() => {
  const records = space.value === 'studio' ? sources.studio : sources.library
  return {
    source: space.value,
    parents: [
      { value: 'p', label: space.value === 'library' ? '书房' : '画室' },
      { value: 'q', label: '共享区域' },
    ],
    get entities() {
      return records.map((r) => ({ value: r.key, label: r.name, code: r.code, parent: r.parent }))
    },
    query: async (request) => {
      if (failed.value) throw Error('unavailable')
      const rows = records.filter(
        (r) =>
          (!request.filter.parent || r.parent === request.filter.parent) &&
          (!request.filter.entity || r.key === request.filter.entity) &&
          (!request.filter.keyword || `${r.code} ${r.name}`.includes(request.filter.keyword)),
      )
      return {
        rows: rows.slice((request.page - 1) * request.pageSize, request.page * request.pageSize),
        total: rows.length,
      }
    },
    timeline: async (row) =>
      row.key === '1'
        ? { state: 'forbidden', message: '当前无权查看此记录。' }
        : row.key === '2'
          ? { state: 'unlinked', message: '尚未建立关联。' }
          : {
              state: 'ready',
              items: [
                {
                  key: 'opened',
                  title: '开放空间',
                  label: new Date('2026-10-28T01:30:00Z').toLocaleString('sv-SE', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  description: '欢迎来这里度过一段安静时光。',
                },
              ],
            },
    create: async (name, parent) => {
      if (failed.value) throw Error('unavailable')
      const row = {
        key: `new-${records.length}`,
        code: `R-${records.length + 1}`,
        name,
        parent,
        quantity: 0,
        eligible: true,
        reason: '',
      }
      records.push(row)
      return { receipt: 'saved', row }
    },
  }
})
</script>
<template>
  <main class="mx-auto max-w-5xl space-y-6 p-6">
    <a href="#">返回工作空间</a>
    <h1 class="text-2xl font-semibold tracking-tight">找一处好时光</h1>
    <p class="text-sm text-muted-foreground">
      选择分区，查找空间并阅读开放记录。添加的条目保留在本页。
    </p>
    <div class="flex flex-wrap gap-3">
      <NvButton @click="toggleSpace">{{ space === 'library' ? '前往画室' : '前往书房' }}</NvButton
      ><NvButton variant="outline" :aria-pressed="failed" @click="failed = !failed">{{
        failed ? '恢复连接' : '暂停连接'
      }}</NvButton>
    </div>
    <DirectoryRecipe :host="host" v-model:filter="filter" />
  </main>
</template>
