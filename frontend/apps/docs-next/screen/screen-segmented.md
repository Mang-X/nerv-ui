---
title: NvScreenSegmented 大屏分段控件
---

<script setup>
import { ref } from 'vue'
import { NvScreenSegmented } from '@nerv-ui/screen'
import '@nerv-ui/screen/styles.css'

const range = ref('today')
const align = ref('left')

const rangeOptions = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'custom', label: '自定义', disabled: true },
]

const alignOptions = [
  { value: 'left', label: '左对齐' },
  { value: 'center', label: '居中' },
  { value: 'right', label: '右对齐' },
]
</script>

# NvScreenSegmented 大屏分段控件

在少量互斥选项之间切换的分段按钮组，带滑动指示块，适合大屏上的时间范围选择。

## 示例

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenSegmented v-model:value="range" :options="rangeOptions" aria-label="时间范围" />
    <span style="font-size: 13px; opacity: 0.7">当前范围：<span v-text="range"></span></span>
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px; width: 100%">
    <NvScreenSegmented v-model:value="align" :options="alignOptions" size="lg" block aria-label="对齐方式" />
    <NvScreenSegmented :options="alignOptions" orientation="vertical" :stretch="false" size="xl" />
    <NvScreenSegmented :options="alignOptions" :default-value="'left'" disabled aria-label="禁用分组" />
  </div>
</Demo>

## API

### NvScreenSegmented 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `options` | 选项，必填 | `ScreenSegmentedOption[]` | — |
| `value` | 受控当前值（`v-model:value`） | `string \| null` | — |
| `defaultValue` | 非受控初始值 | `string \| null` | — |
| `disabled` | 禁用整组 | `boolean` | `false` |
| `readOnly` | 只读 | `boolean` | `false` |
| `required` | 标记为必选项 | `boolean` | `false` |
| `name` | 提交字段名 | `string` | — |
| `loop` | 键盘导航是否循环 | `boolean` | `true` |
| `orientation` | 排布方向 | `horizontal \| vertical` | `horizontal` |
| `size` | 项高度 44 / 52 / 60px | `md \| lg \| xl` | `md` |
| `block` | 整宽铺满父容器 | `boolean` | `false` |
| `ariaLabel` | 分组的无障碍名称 | `string` | `选项` |

### ScreenSegmentedOption

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `value` | 选项值 | `string` |
| `label` | 选项文案 | `string` |
| `disabled` | 禁用该项 | `boolean` |

### NvScreenSegmented 事件

| 事件 | 说明 |
| --- | --- |
| `update:value` | 当前值变化，参数为 `string \| null` |

### NvScreenSegmented 插槽

| 插槽 | 说明 |
| --- | --- |
| `option` | 自定义选项内容，作用域参数为 `{ option }` |
