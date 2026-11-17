---
title: NvSelect 选择器
---

<script setup>
import {
  NvSelect,
  NvSelectContent,
  NvSelectItem,
  NvSelectTrigger,
  NvSelectValue,
} from '@nerv-iip/ui'
import { ref } from 'vue'
import LocalFormSectionExample from '../../.vitepress/examples/localFormSectionExample.vue'

const groupValue = ref('group-a')
const statusValue = ref()
</script>

# NvSelect 选择器

从预设选项中单选。`NvSelect` 由触发器、值占位与下拉内容组合而成，保持品牌聚焦与一致的浮层质感。

## 示例

<Demo>
  <div style="max-width: 280px">
    <NvSelect v-model="groupValue">
      <NvSelectTrigger><NvSelectValue placeholder="选择分组" /></NvSelectTrigger>
      <NvSelectContent>
        <NvSelectItem value="group-a">Alpha 组 · 设计</NvSelectItem>
        <NvSelectItem value="group-b">Beta 组 · 实现</NvSelectItem>
        <NvSelectItem value="group-c">Gamma 组 · 验证</NvSelectItem>
      </NvSelectContent>
    </NvSelect>
  </div>
</Demo>

```vue
<NvSelect v-model="groupValue">
  <NvSelectTrigger><NvSelectValue placeholder="选择分组" /></NvSelectTrigger>
  <NvSelectContent>
    <NvSelectItem value="group-a">Alpha 组 · 设计</NvSelectItem>
    <NvSelectItem value="group-b">Beta 组 · 实现</NvSelectItem>
    <NvSelectItem value="group-c">Gamma 组 · 验证</NvSelectItem>
  </NvSelectContent>
</NvSelect>
```

<Demo>
  <div style="max-width: 280px">
    <NvSelect v-model="statusValue">
      <NvSelectTrigger><NvSelectValue placeholder="选择条目状态" /></NvSelectTrigger>
      <NvSelectContent>
        <NvSelectItem value="running">进行中</NvSelectItem>
        <NvSelectItem value="ready">已就绪</NvSelectItem>
        <NvSelectItem value="completed">已完成</NvSelectItem>
        <NvSelectItem value="blocked">阻塞</NvSelectItem>
      </NvSelectContent>
    </NvSelect>
  </div>
</Demo>

```vue
<NvSelect v-model="statusValue">
  <NvSelectTrigger><NvSelectValue placeholder="选择条目状态" /></NvSelectTrigger>
  <NvSelectContent>
    <NvSelectItem value="running">进行中</NvSelectItem>
    <NvSelectItem value="completed">已完成</NvSelectItem>
  </NvSelectContent>
</NvSelect>
```

下方示例演示 `NvFormSection` 与品牌 `NvSelect`、基础 `Select` 在同一个表单里的分节组合。

<Demo>
  <LocalFormSectionExample />
</Demo>

<<< ../../.vitepress/examples/localFormSectionExample.vue

## API

| 组件              | 说明                                   |
| ----------------- | -------------------------------------- |
| `NvSelect`        | 根容器，承载 `v-model` 绑定选中值      |
| `NvSelectTrigger` | 触发器，点击展开下拉                   |
| `NvSelectValue`   | 值展示，`placeholder` 为未选中占位文本 |
| `NvSelectContent` | 下拉浮层容器                           |
| `NvSelectItem`    | 选项，`value` 为选项值                 |

| 属性          | 说明                              | 类型      | 默认    |
| ------------- | --------------------------------- | --------- | ------- |
| `v-model`     | 绑定选中值（`NvSelect`）          | `string`  | —       |
| `placeholder` | 未选中占位（`NvSelectValue`）     | `string`  | —       |
| `value`       | 选项值（`NvSelectItem`）          | `string`  | —       |
| `invalid`     | 触发器错误态（`NvSelectTrigger`） | `boolean` | `false` |

## 设计说明

本页表单共用局部 host，区域与活动分别持有当前值，重置只作用于当前实例，不提交或保存。标签使用 `useId()` 关联真实触发器。

`NvFormSection` 接收必填 `title`、可选 `description`，默认 `columns=2`，默认插槽放字段，`actions` 放操作。本例依次展示 2、1、3 列；窄屏回到一列，3 列在 sm 为两列、lg 为三列。它仅负责布局，没有提交事件。

区域使用品牌 `NvSelect/NvSelectTrigger/NvSelectContent/NvSelectItem`，`NvSelectGroup` 与 `NvSelectValue` 是 Reka 上下文助手。品牌没有独立 Label/Separator 导出，因此使用公开基础 `SelectLabel/SelectSeparator` 表达真实组名与分隔。品牌 Content 默认 `position="popper"`、`align="start"`、`sideOffset=6`，以自身溢出滚动承载选项，不含基础滚动按钮。

活动独立使用基础 `Select/SelectTrigger/SelectValue/SelectContent/SelectGroup/SelectLabel/SelectSeparator/SelectItem`。基础 Content 默认 `position="item-aligned"`、`align="center"`，内部已组合 `SelectScrollUpButton/SelectScrollDownButton`；不要在 consumer 重复包裹。每组十项共二十项，为有限视口留下溢出条件；按钮是否显示取决于 Reka 的实际视口与滚动位置。

两族根组件通过 `v-model` 消费公开 `modelValue/update:modelValue`，其余 Reka props/emits 由 producer 转发。Tab、方向键、Enter、Escape 和焦点管理交给 Reka；示例不另写 keydown。
