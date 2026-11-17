<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  NvButton,
  Table,
  TableCaption,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  TableEmpty,
} from '@nerv-iip/ui'

const hasRecords = ref(true)
const items = [
  { name: '收纳盒', quantity: 0 },
  { name: '标签纸', quantity: 12.3456 },
  { name: '书签', quantity: 2 },
]
const columns = ['物品', '数量', '单位']
const records = computed(() => (hasRecords.value ? items : []))
const total = computed(() => records.value.reduce((sum, item) => sum + item.quantity, 0))
const formatQuantity = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 3 })
</script>

<template>
  <div class="min-w-0 max-w-full space-y-3">
    <div class="flex flex-wrap gap-2">
      <NvButton variant="outline" :disabled="!hasRecords" @click="hasRecords = false"
        >清空记录</NvButton
      >
      <NvButton variant="outline" @click="hasRecords = true">恢复本页记录</NvButton>
    </div>
    <div class="max-w-full rounded-md border">
      <Table
        role="region"
        aria-label="物品清单，可横向滚动查看单位列"
        tabindex="0"
        class="min-w-[30rem]"
      >
        <TableCaption>物品清单 · 当前 {{ records.length }} 条</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead
              v-for="(column, index) in columns"
              :key="column"
              scope="col"
              :class="index === 1 ? 'text-right' : ''"
              >{{ column }}</TableHead
            >
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in records" :key="item.name">
            <TableCell>{{ item.name }}</TableCell>
            <TableCell class="text-right tabular-nums">{{
              formatQuantity(item.quantity)
            }}</TableCell>
            <TableCell class="text-muted-foreground font-normal text-xs">个</TableCell>
          </TableRow>
          <TableEmpty v-if="!records.length" :colspan="columns.length"
            >当前没有物品记录，可恢复本页记录。</TableEmpty
          >
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>当前合计</TableCell>
            <TableCell class="text-right tabular-nums">{{ formatQuantity(total) }}</TableCell>
            <TableCell class="text-muted-foreground font-normal text-xs">个</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  </div>
</template>
