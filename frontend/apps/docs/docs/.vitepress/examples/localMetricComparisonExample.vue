<script setup lang="ts">
import { ref } from 'vue'
import { NvButton, NvMetricComparison } from '@nerv-ui/ui'
const label = ref('到访人次')
const baseline = ref({ label: '计划', value: 100 })
const actual = ref({ label: '到访', value: 120 })
const betterWhen = ref<'higher' | 'lower'>('higher')
function consumption() {
  label.value = '耗用升数'
  baseline.value = { label: '预算', value: 100 }
  actual.value = { label: '已用', value: 80 }
  betterWhen.value = 'lower'
}
function visits() {
  label.value = '到访人次'
  baseline.value = { label: '计划', value: 100 }
  actual.value = { label: '到访', value: 120 }
  betterWhen.value = 'higher'
}
function zero(value: number) {
  baseline.value = { ...baseline.value, value: 0 }
  actual.value = { ...actual.value, value }
}
</script>

<template>
  <div class="w-full min-w-0 space-y-4">
    <p class="break-words text-sm">城市书房到访人次与共享花园用水耗用升数的基线和实际对照</p>
    <div class="flex flex-wrap gap-2" role="group" aria-label="比较设置">
      <NvButton variant="outline" aria-label="切换为到访" @click="visits">到访</NvButton>
      <NvButton variant="outline" aria-label="切换为耗用" @click="consumption">耗用</NvButton>
      <NvButton
        variant="outline"
        aria-label="切换优劣方向"
        @click="betterWhen = betterWhen === 'higher' ? 'lower' : 'higher'"
        >切换方向</NvButton
      >
      <NvButton variant="outline" aria-label="基线与实际归零" @click="zero(0)">两侧归零</NvButton>
      <NvButton variant="outline" aria-label="零基线非零实际" @click="zero(12)"
        >零基线 / 实际 12</NvButton
      >
    </div>
    <NvMetricComparison
      :label="label"
      :baseline="baseline"
      :actual="actual"
      :better-when="betterWhen"
    />
    <p role="status" class="break-words text-sm tabular-nums">
      当前{{ label }}：{{ baseline.label }} {{ baseline.value }}；{{ actual.label }}
      {{ actual.value }}；{{ betterWhen === 'higher' ? '越高越好' : '越低越好' }}。
    </p>
    <p class="text-sm text-muted-foreground">
      数据仅保存在本页内存；切换方向表达比较偏好，不代表业务就绪。
    </p>
  </div>
</template>
