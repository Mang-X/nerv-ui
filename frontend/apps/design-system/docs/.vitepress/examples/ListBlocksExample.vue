<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  NvButton,
  NvPageHeader,
  NvToolbar,
  NvRowActions,
  NvSectionCard,
  NvSectionCards,
  DropdownMenuItem,
} from '@nerv-iip/ui'
const search = ref('')
const columns = ref<2 | 3 | 4>(4)
const choices = [2, 3, 4] as const
const records = ref([
  { id: 'basket', name: '书篮', quantity: 12.34567 },
  { id: 'easel', name: '画架', quantity: null },
  { id: 'box', name: '空盒', quantity: 0 },
])
const filtered = computed(() => records.value.filter((r) => r.name.includes(search.value.trim())))
const receipt = ref('操作仅在本页展示，不更改物品。')
const format = (n: number | null) =>
  n === null ? '—' : n.toLocaleString('zh-CN', { maximumFractionDigits: 3 })
function view(id: string) {
  const current = records.value.find((r) => r.id === id)
  if (current) receipt.value = `正在查看${current.name}；仅本页回执。`
}
function replace() {
  records.value = [{ id: 'tools', name: '工具箱', quantity: 2 }]
  receipt.value = '已更换为当前清单。'
}
</script>

<template>
  <div class="list-blocks-example min-w-0 w-full space-y-4 p-4 md:p-6">
    <NvPageHeader title="共享物品" :count="`${filtered.length} 件`" class="static top-auto">
      <template #actions>
        <NvButton
          type="button"
          size="sm"
          variant="brand"
          @click="receipt = '已记录整理意愿；仅本页回执。'"
          >记录整理</NvButton
        >
      </template>
    </NvPageHeader>
    <div>
      <h2 class="text-2xl font-semibold tracking-tight">让共享物品一目了然</h2>
      <p class="text-sm text-muted-foreground">查找物品、查看数量，或打开当前物品的本地说明。</p>
    </div>
    <label class="flex flex-wrap items-center gap-2 text-sm">
      统计最大列数
      <select v-model="columns" class="rounded-md border border-border bg-background p-2">
        <option v-for="n in choices" :key="n" :value="n">{{ n }} 列</option>
      </select>
    </label>
    <NvSectionCards :columns="columns">
      <NvSectionCard
        description="当前物品"
        :value="`${records.length} 件`"
        hint="完整清单，不随搜索变化"
      />
      <NvSectionCard description="待整理" value="0 件" footnote="当前没有待整理物品" />
      <NvSectionCard description="待核实数量" value="—" hint="尚未核实，不计为零" />
      <NvSectionCard description="物品总重量" value="12.346 kg">
        <NvButton
          type="button"
          size="sm"
          variant="link"
          @click="receipt = '重量为本页示例记录：12.346 kg。'"
          >查看统计说明</NvButton
        >
      </NvSectionCard>
    </NvSectionCards>
    <NvToolbar v-model:search="search" search-label="搜索物品" search-placeholder="按名称搜索">
      <template #filters>
        <NvButton type="button" size="sm" variant="outline" :disabled="!search" @click="search = ''"
          >清除搜索</NvButton
        >
      </template>
      <template #actions>
        <NvButton
          type="button"
          size="sm"
          variant="outline"
          @click="records = [...records].reverse()"
          >倒序排列</NvButton
        >
        <NvButton type="button" size="sm" variant="outline" @click="replace">更换清单</NvButton>
      </template>
    </NvToolbar>
    <div
      class="min-w-0 overflow-x-auto"
      tabindex="0"
      role="region"
      aria-label="物品清单，可横向滚动"
    >
      <table class="w-full text-sm">
        <caption class="sr-only">
          当前共享物品及数量
        </caption>
        <thead>
          <tr>
            <th scope="col" class="text-left">物品</th>
            <th scope="col" class="text-right">数量 (kg)</th>
            <th scope="col">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filtered" :key="row.id">
            <td class="py-2">
              {{ row.name }}
              <div class="font-mono text-xs text-muted-foreground">{{ row.id }}</div>
            </td>
            <td class="text-right tabular-nums">
              {{ format(row.quantity)
              }}<span v-if="row.quantity !== null" class="font-normal text-muted-foreground">
                kg</span
              >
            </td>
            <td class="text-center">
              <NvRowActions :label="`查看${row.name}操作`"
                ><DropdownMenuItem @select="view(row.id)"
                  >查看{{ row.name }}</DropdownMenuItem
                ></NvRowActions
              >
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="3" class="py-4">没有匹配的物品</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p role="status" class="break-words text-sm text-muted-foreground">{{ receipt }}</p>
  </div>
</template>

<style scoped>
.list-blocks-example :deep([data-slot='card']) {
  min-width: 0;
}
</style>
