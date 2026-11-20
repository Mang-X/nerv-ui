<script setup lang="ts">
import { ref } from 'vue'
import { NvMobileButton } from '@nerv-ui/ui-mobile'
import MobileFlowRecipe from './MobileFlowRecipe.vue'
import type { FlowCandidate } from './flow'
const code = ref('WEEKEND')
const readonly = ref(false)
const fail = ref(false)
const candidates: FlowCandidate[] = [
  {
    key: 'reading',
    label: '湖畔共读',
    detail: '带上喜欢的书，留一段安静相聚的时间。',
    quantity: 0,
    unit: '本',
    eligible: true,
    reason: '',
    status: { label: '可安排', tone: 'success' },
  },
  {
    key: 'garden',
    label: '花园小聚',
    detail: '雨后稍作休整，开放时间确认后再安排。',
    quantity: null,
    unit: '份',
    eligible: false,
    reason: '开放时间尚未确认',
    status: { label: '等待确认', tone: 'warning' },
  },
]
function validate(value: string) {
  return value === ''
    ? '请填写本次数量'
    : !/^\d+(\.\d{1,3})?$/.test(value)
      ? '请填写最多三位小数的数量'
      : null
}
async function execute() {
  if (fail.value) throw new Error('这次未能收好，请稍后重试')
  return { receipt: '已记在本页，离开后不会保留。' }
}
</script>
<template>
  <div class="p-3">
    <p class="text-sm text-muted-foreground">安排与确认仅保存在本页内存，不会提交到后台。</p>
    <NvMobileButton @click="code = ''">清空安排</NvMobileButton>
    <NvMobileButton @click="readonly = !readonly">{{
      readonly ? '继续编辑' : '只读查看'
    }}</NvMobileButton>
    <NvMobileButton @click="fail = !fail">{{ fail ? '恢复确认' : '暂缓确认' }}</NvMobileButton>
  </div>
  <MobileFlowRecipe
    :input="{
      source: 'weekend',
      code,
      candidates: code ? candidates : [],
      readonly,
      validate,
      execute,
    }"
    @code="code = $event"
  />
</template>
