<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@nerv-iip/ui'

const page = ref(1)
const itemsPerPage = 3
const records = Array.from({ length: 29 }, (_, index) => ({
  id: index + 1,
  title: `阅读片段 ${index + 1}`,
  quantity: index,
}))
const start = computed(() => (page.value - 1) * itemsPerPage)
const visible = computed(() => records.slice(start.value, start.value + itemsPerPage))
const pageCount = Math.ceil(records.length / itemsPerPage)
</script>

<template>
  <div class="min-w-0 space-y-6">
    <section id="controlled-results" aria-label="受控结果">
      <h3>阅读片段</h3>
      <ul aria-label="当前页内容">
        <li v-for="record in visible" :key="record.id">
          {{ record.title }} · 数量 {{ record.quantity }}
        </li>
      </ul>
      <p role="status" aria-live="polite">
        {{ start + 1 }}–{{ start + visible.length }} / 共 {{ records.length }} 条 · 第 {{ page }} /
        {{ pageCount }} 页
      </p>
      <Pagination
        v-model:page="page"
        :total="records.length"
        :items-per-page="itemsPerPage"
        :sibling-count="1"
        show-edges
        aria-label="阅读片段分页"
      >
        <PaginationContent v-slot="{ items }" class="flex-wrap justify-center">
          <PaginationFirst aria-label="首页">首</PaginationFirst>
          <PaginationPrevious aria-label="上一页">前</PaginationPrevious>
          <template v-for="(item, index) in items" :key="index">
            <PaginationItem
              v-if="item.type === 'page'"
              :value="item.value"
              :is-active="page === item.value"
              :aria-label="`第 ${item.value} 页`"
            >
              {{ item.value }}
            </PaginationItem>
            <PaginationEllipsis v-else aria-label="更多页码" />
          </template>
          <PaginationNext aria-label="下一页">后</PaginationNext>
          <PaginationLast aria-label="末页">末</PaginationLast>
        </PaginationContent>
      </Pagination>
    </section>
    <section id="link-navigation" aria-label="本页章节导航">
      <h3>本页章节导航</h3>
      <p>链接 1 返回上方受控结果，链接 2 定位本节；仅在本页定位，不切换结果页。</p>
      <nav aria-label="章节链接" class="flex flex-wrap gap-2">
        <PaginationLink href="#controlled-results" aria-label="1：受控结果">1</PaginationLink>
        <PaginationLink href="#link-navigation" aria-label="2：本页章节导航">2</PaginationLink>
      </nav>
    </section>
  </div>
</template>
