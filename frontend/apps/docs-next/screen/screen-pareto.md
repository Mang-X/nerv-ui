---
title: NvScreenPareto 帕累托图
---

<script setup>
import { NvScreenPareto } from '@nerv-ui/screen'
import '@nerv-ui/screen/styles.css'

const items = [
  { label: '格式异常', sub: '第一分组', value: 42, tone: 'danger' },
  { label: '步骤缺失', sub: '第二分组', value: 26, tone: 'warning' },
  { label: '数据缺失', sub: '第三分组', value: 18 },
  { label: '字段错误', sub: '第四分组', value: 11 },
  { label: '其他', value: 6 },
]
</script>

# NvScreenPareto 帕累托图

缺陷 / 问题的帕累托分析：降序柱体配累计占比折线，并画出累计参考线。

## 示例

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenPareto :items="items" unit="项" :total="120" :reference="80" height="200" aria-label="异常帕累托" />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenPareto
      :items="items.slice(0, 3)"
      :sort="false"
      :reference="90"
      height="180"
      aria-label="保持原始顺序"
    />
    <NvScreenPareto :items="[]" empty-label="暂无异常数据" />
  </div>
</Demo>

## API

### NvScreenPareto 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `items` | 分类项，必填；仅有限且非负的值参与计算 | `ScreenParetoItem[]` | — |
| `sort` | 按数量降序排列；预排序输入传 `false` 保序 | `boolean` | `true` |
| `total` | 长尾行的总量；省略则隐藏长尾行 | `number` | — |
| `unit` | 数量单位 | `string` | — |
| `reference` | 累计占比参考线（百分比） | `number` | `80` |
| `height` | 绘图区高度（px） | `number` | `180` |
| `ariaLabel` | 图表的无障碍描述 | `string` | — |
| `emptyLabel` | 无数据文案 | `string` | `暂无数据` |

### ScreenParetoItem

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `key` | 稳定标识 | `string \| number` |
| `label` | 分类名 | `string` |
| `value` | 分类数量 | `number` |
| `sub` | 次级来源说明，如分组名 | `string` |
| `tone` | 柱体语义色 | `'accent' \| 'success' \| 'warning' \| 'danger'` |
