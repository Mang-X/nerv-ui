---
title: NvScreenPareto 帕累托
---

<script setup>
import { NvScreenPareto } from '@nerv-ui/ui'

const defects = [
  { label: '字段校验失败', sub: '分组一线', count: 46, pct: 32.4 },
  { label: '重复提交', sub: '分组一线', count: 31, pct: 21.8 },
  { label: '缺少必填项', sub: '分组二线', count: 12, pct: 8.5 },
  { label: '格式不符', sub: '分组三线', count: 9, pct: 6.3 },
  { label: '超时未回执', sub: '分组四线', count: 6, pct: 4.2 },
]
const downtime = [
  { label: '资源故障', sub: '资源 1 号', count: 96, pct: 45.3 },
  { label: '切换调整', sub: '分组二线', count: 54, pct: 25.5 },
  { label: '等待回填', sub: '分组三线', count: 31, pct: 14.6 },
]
</script>

# NvScreenPareto 帕累托

帕累托 TOP-N——失败原因 / 中断原因 / 异常类别等「**少数关键项**」分析的正确形态:名称 + 发丝级条 + 数量/占比 + **累计占比 Σ**(没有累计不算真帕累托,80/20 集中度要能直接读出)。条长按 TOP1 归一便于对比;轨道即 100% 全量口径,竖刻度标累计位置;TOP1 红 / TOP2 橙强调、其余青色渐弱;填充语义色渐隐(左实右消),不发光、不描边。底部汇总 = TOP 合计与长尾。基于独立的 `--nv-scr-*` 令牌。

## 示例

### 基础用法

`items` 传降序项(`pct` 为占**全量**的百分比);`total` 传全量总数以显示长尾行。

<ScreenDemo>
  <NvScreenPareto :items="defects" :total="142" />
</ScreenDemo>

```vue
<template>
  <NvScreenPareto
    :items="[
      { label: '字段校验失败', sub: '分组一线', count: 46, pct: 32.4 },
      { label: '重复提交', sub: '分组一线', count: 31, pct: 21.8 },
      /* … */
    ]"
    :total="142"
  />
</template>
```

### 其他口径（中断原因 / 分钟）

`unit` 换数量单位;不传 `total` 时无长尾行。

<ScreenDemo>
  <NvScreenPareto :items="downtime" unit="min" />
</ScreenDemo>

```vue
<NvScreenPareto :items="downtimeReasons" unit="min" />
```

## API

### NvScreenPareto 属性

| Prop    | 类型                            | 默认 | 说明                              |
| ------- | ------------------------------- | ---- | --------------------------------- |
| `items` | `{ label, sub?, count, pct }[]` | —    | 降序项;`pct` 为占全量 %           |
| `total` | `number`                        | —    | 全量总数(算长尾行;不传则无长尾行) |
| `unit`  | `string`                        | `条` | 数量单位                          |

## 设计说明

组件保留输入顺序，不排序、不从 count 推算领域 pct。label 应唯一；count 为有限、非负数量，pct 为宿主提供的有限百分比。Σ 只累计输入 pct（显示一位小数）；条长独立按最大 count 归一化，小数数量也遵循相同比例，全部为零时条长为零。长名称可换行，数量/百分比保留可达。

`total` 未传时不展示长尾；显式 `total=0` 仍展示长尾，空全量的长尾数量/占比均为 0。正 total 的长尾数量为 total 减 TOP count 合计，百分比为 100 减 Σ。宿主必须使 count/pct/total 使用相同分母，且 total 不小于 TOP 合计；组件不推断或修复矛盾的业务口径。number 类型和默认单位 `件` 保留，不新增运行时拒绝。

```vue
<NvScreenPareto
  :items="[
    { label: '阅读', sub: '内容 A', count: 53, pct: 53 },
    { label: '影像', sub: '内容 B', count: 27, pct: 27 },
  ]"
  :total="100"
  unit="次"
/>
```

该例 TOP2 合计/Σ 为 80%，长尾 20 次/20%；`/#screen/charts` 的替换例保留较小项在前，证明组件没有偷偷排序。零值/替换与浏览器证据见 `docs/evidence/t05-a05/README.md`。
