---
title: NvMobileGrid 宫格
---

<script setup>
import { ref } from 'vue'
import { NvMobileGrid } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'

const selected = ref('report')
const picked = ref('report')

const items = [
  { value: 'report', label: '提交', badge: 3 },
  { value: 'order', label: '记录', badge: '新' },
  { value: 'quality', label: '审核' },
  { value: 'stock', label: '库存' },
  { value: 'device', label: '资源' },
  { value: 'plan', label: '计划' },
  { value: 'notice', label: '通知', disabled: true },
  { value: 'more', label: '更多' },
]

function onSelect(item) {
  picked.value = item.label
}

const threeItems = [
  { value: 'a', label: '待处理', description: '12 项' },
  { value: 'b', label: '进行中', description: '4 项' },
  { value: 'c', label: '已完成', description: '86 项' },
]
</script>

# NvMobileGrid 宫格

移动端首页常用的功能入口矩阵，支持 2 到 5 列、角标与选中状态。

## 示例

<Demo block>
  <NvMobileGrid v-model="selected" :items="items" :columns="4" @select="onSelect" />
  <span style="font-size: 13px">当前选中：<span v-text="picked"></span></span>
</Demo>

<Demo block>
  <NvMobileGrid :items="threeItems" :columns="3" bordered />
</Demo>

## API

### NvMobileGrid 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `items` | 宫格项，必填 | `MobileGridItem[]` | — |
| `modelValue` | 受控选中值（`v-model`） | `string \| null` | — |
| `defaultValue` | 非受控初始选中值 | `string \| null` | `null` |
| `columns` | 列数 | `2 \| 3 \| 4 \| 5` | `4` |
| `bordered` | 显示项之间的分隔线 | `boolean` | `false` |
| `ariaLabel` | 宫格组的无障碍名称 | `string` | — |

### MobileGridItem

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `value` | 项标识 | `string` |
| `label` | 主文案 | `string` |
| `icon` | 图标组件 | `Component` |
| `description` | 副文案 | `string` |
| `badge` | 右上角角标 | `string \| number` |
| `disabled` | 禁用该项 | `boolean` |

### NvMobileGrid 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 选中值变化，参数为 `string` |
| `select` | 选中某项，参数为完整的 `MobileGridItem` |

### NvMobileGrid 插槽

| 插槽 | 说明 |
| --- | --- |
| `empty` | `items` 为空时的占位内容 |
| `icon` | 自定义图标，作用域参数为 `{ item }` |
| `label` | 自定义主文案，作用域参数为 `{ item }` |
