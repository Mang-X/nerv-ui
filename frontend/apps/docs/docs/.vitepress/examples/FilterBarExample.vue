<script setup lang="ts">
import { computed, ref } from 'vue'
import { NvButton, NvFilterBar, type FilterField } from '@nerv-ui/ui'
type Values = { category?: string; day?: string; period?: { from?: string; to?: string } }
const fields = ref<FilterField[]>([
  {
    key: 'category',
    label: '类别',
    type: 'select',
    options: [
      { label: '阅读', value: 'reading' },
      { label: '交流', value: 'meeting' },
    ],
  },
  { key: 'day', label: '活动日期', type: 'date' },
  { key: 'period', label: '日期范围', type: 'daterange' },
])
const values = ref<Values>({})
const keyword = ref('')
const records = [
  { id: 'a', title: '湖畔共读', category: 'reading', day: '2026-06-10' },
  { id: 'b', title: '午后共读', category: 'reading', day: '2026-06-20' },
  { id: 'c', title: '书友交流', category: 'meeting', day: '2026-06-20' },
]
const results = computed(() =>
  records.filter(
    (r) =>
      (!values.value.category || r.category === values.value.category) &&
      (!values.value.day || r.day === values.value.day) &&
      (!values.value.period?.from || r.day >= values.value.period.from) &&
      (!values.value.period?.to || r.day <= values.value.period.to) &&
      r.title.includes(keyword.value.trim()),
  ),
)
const changes = ref(0)
const resets = ref(0)
const receipt = ref('尚未调整筛选')
const action = ref('显示全部活动')
function changed(payload: { values: Values; keyword: string }) {
  changes.value++
  receipt.value = `已采用筛选：${payload.values.category || '全部类别'}；${payload.values.day || '不限日期'}；${payload.values.period?.from || '不限起点'} 至 ${payload.values.period?.to || '不限终点'}；关键词：${payload.keyword || '无'}`
}
function replace() {
  values.value = {
    category: 'reading',
    day: '2026-06-20',
    period: { from: '2026-06-10', to: '2026-06-20' },
  }
  keyword.value = '共读'
  action.value = '已采用六月共读安排'
}
function clear() {
  values.value = {}
  keyword.value = ''
  action.value = '已清空全部条件'
}
function reorder() {
  fields.value = [...fields.value].reverse()
  action.value = '已调整条件顺序'
}
</script>

<template>
  <section class="space-y-4" aria-label="活动筛选">
    <NvFilterBar
      v-model="values"
      v-model:keyword="keyword"
      :fields="fields"
      search-placeholder="查找活动名称"
      @change="changed"
      @reset="resets++"
    />
    <div class="flex flex-wrap gap-2">
      <NvButton variant="outline" @click="replace">采用六月共读安排</NvButton>
      <NvButton variant="outline" @click="clear">清空全部条件</NvButton>
      <NvButton variant="outline" @click="reorder">调整条件顺序</NvButton>
    </div>
    <div role="status" class="space-y-1 text-sm" aria-live="polite">
      <p data-action>{{ action }}</p>
      <p data-receipt>{{ receipt }}</p>
      <p data-counts>筛选更新 {{ changes }} 次；重置 {{ resets }} 次</p>
      <p data-total>当前活动：{{ results.length }} 场</p>
    </div>
    <ul v-if="results.length" aria-label="当前活动" class="space-y-2">
      <li v-for="record in results" :key="record.id">{{ record.title }} · {{ record.day }}</li>
    </ul>
    <p v-else>没有符合条件的活动</p>
  </section>
</template>
