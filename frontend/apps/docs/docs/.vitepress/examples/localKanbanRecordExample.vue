<script setup lang="ts">
import { computed, ref } from 'vue'
import { NvButton, NvKanban, NvRecordCard } from '@nerv-iip/ui'
interface Book {
  id: string
  title: string
  pages: number
  progress: number
}
const initial = (): Book[] => [
  { id: 'BOOK-01', title: '四季小记', pages: 240, progress: 0 },
  { id: 'BOOK-02', title: '山间散步', pages: 180, progress: 0 },
]
const waiting = ref(initial())
const reading: Book[] = [{ id: 'BOOK-03', title: '植物观察', pages: 200, progress: 45 }]
const feedback = ref('选择一本书查看。')
const columns = computed(() => [
  { key: 'waiting', title: '待阅读', items: waiting.value },
  { key: 'reading', title: '阅读中', items: reading },
  { key: 'finished', title: '已读完', items: [] as Book[] },
])
const itemKey = (book: Book) => book.id
function reorder() {
  waiting.value = [...waiting.value].reverse()
  feedback.value = `当前待阅读顺序：${waiting.value.map((book) => book.id).join('、')}`
}
function replace() {
  waiting.value = [{ id: 'BOOK-04', title: '城市笔记', pages: 160, progress: 0 }]
  feedback.value = '待阅读已替换为 BOOK-04 · 城市笔记。'
}
function restore() {
  waiting.value = initial()
  feedback.value = '已恢复书篮。'
}
</script>

<template>
  <div class="w-full min-w-0 max-w-full space-y-4">
    <p class="text-sm text-muted-foreground">
      整理阅读书篮；操作仅影响本页内存。横向滚动可查看末列。
    </p>
    <div class="flex flex-wrap gap-2" role="group" aria-label="书篮操作">
      <NvButton variant="outline" aria-label="重排待阅读" @click="reorder">重排待阅读</NvButton>
      <NvButton variant="outline" aria-label="替换待阅读" @click="replace">替换待阅读</NvButton>
      <NvButton variant="outline" aria-label="恢复书篮" @click="restore">恢复书篮</NvButton>
    </div>
    <NvKanban
      :columns="columns"
      :item-key="itemKey"
      class="max-w-full focus-visible:outline focus-visible:outline-ring"
      tabindex="0"
      role="region"
      aria-label="阅读书篮，可横向滚动"
    >
      <template #item="{ item, column }">
        <NvRecordCard
          :record-no="item.id"
          :title="item.title"
          :status="{ label: column.title, tone: column.key === 'reading' ? 'info' : 'neutral' }"
          :meta="[{ label: '篇幅', value: `${item.pages} pages` }]"
          :progress="item.progress"
        >
          <p class="break-words text-sm">{{ item.title }} · {{ item.pages }} pages</p>
          <template #actions>
            <NvButton
              variant="outline"
              :aria-label="`查看 ${item.id}`"
              @click="feedback = `当前查看：${item.id} · ${item.title}`"
              >查看</NvButton
            >
          </template>
        </NvRecordCard>
      </template>
    </NvKanban>
    <p role="status" class="break-words text-sm">{{ feedback }}</p>
  </div>
</template>
