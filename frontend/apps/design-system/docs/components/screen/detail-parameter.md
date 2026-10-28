---
title: 大屏详情与参数取值
---

<script setup>
import { ref } from 'vue'
import { NvScreenDetailDialog, NvScreenParameter, NvScreenButton } from '@nerv-iip/ui'
const open = ref(false)
const samples = ref([0, 12.34567, 8])
</script>

# 大屏详情与参数取值

<ScreenDemo>
  <NvScreenDetailDialog v-model:open="open" title="河岸书房" description="2026-10-28 09:30（本地）观察窗口" state="data">
    <template #trigger><NvScreenButton>打开详情</NvScreenButton></template>
    <template #info><p>位置：河岸东侧；仅中性内存数据。</p></template>
    <template #parameter><NvScreenParameter label="阅读次数" :value="8" unit="次" range="观察范围 0–20 次" :samples="samples" /></template>
    <template #history><NvScreenButton @click="samples = []">替换为缺测窗口</NvScreenButton></template>
  </NvScreenDetailDialog>
</ScreenDemo>

## API

| 组件                 | 属性                                                   | 约束                                                |
| -------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| NvScreenDetailDialog | open: boolean                                          | 必填受控；update:open 请求，可拒绝                  |
|                      | title / description: string                            | 必填可访问名称与说明                                |
|                      | state: data / pending / error / empty                  | 必填；非 data 隐藏内容 slots                        |
|                      | statusText?: string                                    | host 状态文案，可缺省                               |
|                      | trigger / info / parameter / history slots             | trigger 可选，按钮单根；其余为中性内容              |
| NvScreenParameter    | label: string; value: number / null; samples: number[] | 必填，[] 显式缺测，零保持零                         |
|                      | unit? / range? / color?: string                        | 可选，范围是 host 原文，不判正常                    |
|                      | sampleLabels?: string[]                                | 对齐原样本索引，时间/时区由 host 提供；缺省显示序号 |

两件均由主桶导出。NvSparkline 的既有公开行为保持不变。完整双宿主 `/#screen/parameter-detail/library` 与 `/#screen/parameter-detail/studio`。

<!--@include: ../../../../../DESIGN/components/screen-detail-parameter.md-->
