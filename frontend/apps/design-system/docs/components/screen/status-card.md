---
title: NvScreenStatusCard 比较摘要
---

<script setup>
import { ref } from 'vue'
import { NvScreenInput, NvScreenStatusCard } from '@nerv-iip/ui'
const current = ref('12,840')
const unit = ref('人次')
const labels = { state: '空间状态', plan: '目标', actual: '当前', rate: '进度', downtime: '持续时间' }
</script>

# NvScreenStatusCard 比较摘要

现有状态卡的同一套几何：顶部名称与小灯、状态大字、三项比较及底部时长。**自带 NvScreenPanel，直接使用，不再套第二层卡。**

## 中性输入与旧字段适配

宿主将目标→`plan`、当前→`actual`、进度→`rate`、持续时间→`downtime`；这些字段仍然是字符串，不推算比率或补零。`labels` 覆盖所有固定领域文案，`unit` 只影响 plan / actual 共用后缀；rate / downtime 的格式及单位由宿主完整提供。

<ScreenDemo>
  <div class="status-card-doc" style="width: 600px">
    <label class="status-card-field">当前读数 <NvScreenInput v-model="current" ariaLabel="当前读数" /></label>
    <label class="status-card-field">数量单位 <NvScreenInput v-model="unit" ariaLabel="数量单位" /></label>
    <NvScreenStatusCard name="街角书房" state="开放" label="欢迎停留" tone="run"
      plan="15,000" :actual="current.trim() || '—'" rate="85.6%" downtime="8 小时"
      :labels="labels" :unit="unit" />
  </div>
</ScreenDemo>

```vue
<NvScreenStatusCard
  name="街角书房"
  state="开放"
  label="欢迎停留"
  tone="run"
  plan="15,000"
  actual="12,840"
  rate="85.6%"
  downtime="8 小时"
  unit="人次"
  :labels="{ state: '空间状态', plan: '目标', actual: '当前', rate: '进度', downtime: '持续时间' }"
/>
```

未知值传 `—`，`0` 保留真实零。`unit=""` 不添加后缀。部分 labels 按字段回落到旧文案；空标签可显式传空字符串。标签、名称、状态大字及数值允许换行。

## 旧调用兼容（三态）

<ScreenDemo>
  <NvScreenStatusCard style="width: 280px" name="焊接线 A" state="运行" label="运行中" tone="run" plan="1,240" actual="1,156" rate="93.2%" downtime="0 分钟" />
  <NvScreenStatusCard style="width: 280px" name="装配线 B" state="待机" label="待机中" tone="idle" plan="960" actual="742" rate="77.3%" downtime="28 分钟" />
  <NvScreenStatusCard style="width: 280px" name="CNC 线 C" state="报警" label="主轴过载" tone="alarm" plan="1,080" actual="604" rate="55.9%" downtime="46 分钟" />
</ScreenDemo>

## 属性

| 属性       | 说明                                           | 类型                                                                             | 默认                                               |
| ---------- | ---------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------- |
| `name`     | 名称                                           | `string`                                                                         | 必填                                               |
| `state`    | 名称后的短状态词                               | `string`                                                                         | 必填                                               |
| `label`    | 状态大字                                       | `string`                                                                         | 必填                                               |
| `tone`     | 兼容 palette：绿 / 琥珀 / 红，驱动边、灯、大字 | `'run' \| 'idle' \| 'alarm'`                                                     | 必填                                               |
| `plan`     | 目标格式化字符串，旧义计划产量                 | `string`                                                                         | 必填                                               |
| `actual`   | 当前格式化字符串，旧义实际产量                 | `string`                                                                         | 必填                                               |
| `rate`     | 宿主提供的进度字符串，旧义达成率               | `string`                                                                         | 必填                                               |
| `downtime` | 宿主提供的时长字符串，旧义停机时长             | `string`                                                                         | 必填                                               |
| `labels`   | 可选逐字段文案                                 | `Partial<Record<'state' \| 'plan' \| 'actual' \| 'rate' \| 'downtime', string>>` | 当前状态 / 计划产量 / 实际产量 / 达成率 / 停机时长 |
| `unit`     | plan / actual 共用后缀；空字符串不添加         | `string`                                                                         | `件`                                               |

本页为既有卡片的兼容接缝。#25 的 Launcher / WorkshopHealth / WorkshopLine 三种新卡由同一 owner 后续复用/扩展，不在本票新增。

<style>
.status-card-doc { display: flex; flex-direction: column; gap: 12px; color: var(--nv-scr-text); }
.status-card-field { display: flex; align-items: center; gap: 8px; }
.status-card-field .nv-scr-in { flex: 1; }
</style>
