---
title: NvStatTile 指标块
---

<script setup>
import { NvStatTile } from '@nerv-iip/ui'
</script>

# NvStatTile 指标块

Pad 看板的**超大可读** KPI 块：大号等宽数字，隔一段距离也一眼看清；可选 `tone` 给面板与数字染色，用于"健康度一瞥"。与大屏 NvKpiBar 定位相近，尺寸与留白按 Pad 近距离触控放大。

## 语气（tone）

`neutral` 中性、`brand` 品牌、`success` 良好、`warning` 关注、`danger` 异常。

<Demo block>
  <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
    <NvStatTile label="今日已完成" :value="412" unit="条" tone="brand" />
    <NvStatTile label="当前节奏" value="45" unit="s/条" tone="neutral" />
    <NvStatTile label="合格率" value="99.2" unit="%" tone="success" />
    <NvStatTile label="利用率" value="78.6" unit="%" tone="warning" />
  </div>
</Demo>

```vue
<NvStatTile label="今日已完成" :value="412" unit="条" tone="brand" />
<NvStatTile label="合格率" value="99.2" unit="%" tone="success" />
```

## 属性

| 属性    | 说明              | 类型                                               | 默认      |
| ------- | ----------------- | -------------------------------------------------- | --------- |
| `label` | 指标名称          | `string`                                           | —         |
| `value` | 指标数值          | `string \| number`                                 | —         |
| `unit`  | 单位（可选）      | `string`                                           | —         |
| `tone`  | 语气 / 健康度着色 | `neutral \| brand \| success \| warning \| danger` | `neutral` |

## 插槽

| 插槽      | 说明                       |
| --------- | -------------------------- |
| `default` | 数值下方的补充内容（可选） |
