---
title: NvTouchList 触屏列表
---

<script setup>
import { ref } from 'vue'
import { NvTouchList } from '@nerv-ui/pad'
import '@nerv-ui/pad/styles.css'

const groups = [
  { value: 'g-01', title: '分组 A', description: '12 条记录 · 最近更新 08:20', meta: '12' },
  { value: 'g-02', title: '分组 B', description: '5 条记录 · 最近更新 07:55', meta: '5' },
  { value: 'g-03', title: '分组 C', description: '已归档，暂不可编辑', meta: '0', disabled: true },
]
const resources = [
  { value: 'r-01', title: '资源 1', description: '可用 · 空闲 3', meta: '空闲' },
  { value: 'r-02', title: '资源 2', description: '占用 · 剩余 12 分钟', meta: '占用' },
]

const picked = ref('g-01')
const emptyItems = []
</script>

# NvTouchList 触屏列表

平板端可单选的行列表，行高 64px 起，选中行带高亮与勾选标记。

## 示例

<Demo block>
  <NvTouchList v-model="picked" :items="groups" label="记录分组" />
</Demo>

<p style="margin: 0; font-size: 14px; opacity: 0.72">
  当前选中：<span v-text="picked ?? '无'"></span>（再次点击同一行可取消选中）
</p>

<Demo block>
  <NvTouchList label="资源状态" :items="resources" default-value="r-02" />
</Demo>

<Demo block>
  <NvTouchList label="空列表" :items="emptyItems" empty-label="暂无可选分组" />
</Demo>

<Demo block>
  <NvTouchList label="整表禁用" :items="resources" disabled />
</Demo>

## API

### NvTouchList 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `items` | 行数据，必填 | `TouchListItem[]` | — |
| `modelValue` | 选中值（`v-model`），`null` 表示未选中 | `string \| null` | — |
| `defaultValue` | 非受控时首先选中的值 | `string \| null` | `null` |
| `label` | 列表上方的标题 | `string` | — |
| `emptyLabel` | `items` 为空时的文案 | `string` | `暂无内容` |
| `disabled` | 整表变暗并阻止交互 | `boolean` | `false` |

### TouchListItem

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `value` | 行标识，由 `v-model` 与 `@select` 报告 | `string` |
| `title` | 主文案 | `string` |
| `description` | 次要说明 | `string` |
| `meta` | 行尾短文本，如计数或时间 | `string` |
| `disabled` | 是否禁用该行 | `boolean` |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 选中值变化，参数为 `string \| null` |
| `select` | 点击任意可用行，参数为 `TouchListItem` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `header` | 自定义列表标题 |
| `leading` | 行首区域，作用域为 `{ item }` |
| `item` | 自定义行内容，作用域为 `{ item, selected }` |
| `trailing` | 行尾区域，作用域为 `{ item }` |
| `empty` | 自定义空状态 |
