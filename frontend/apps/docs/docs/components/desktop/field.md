---
title: NvField 表单字段
---

<script setup>
import {
  NvField,
  NvFieldGroup,
  NvFieldLabel,
  NvFieldDescription,
  NvFieldError,
  NvInput,
} from '@nerv-iip/ui'
import FieldContentExample from '../../.vitepress/examples/FieldContentExample.vue'
import FieldGroupExample from '../../.vitepress/examples/FieldGroupExample.vue'
import { ref } from 'vue'

const orderNo = ref('REC-2406-0431')
const planQty = ref('')
</script>

# NvField 表单字段

为表单控件提供语义与布局骨架。`NvField` 串联标签、描述与错误提示，`NvFieldGroup` 在纵向上把多个字段对齐成统一的表单节奏。

## 示例

`NvFieldGroup` 内放置多个 `NvField`。每个字段由 `NvFieldLabel`（通过 `for` 关联控件）、控件本体与 `NvFieldDescription` / `NvFieldError` 组成。

<Demo>
  <div style="width: 360px; max-width: 100%">
    <NvFieldGroup>
      <NvField>
        <NvFieldLabel for="field-order-no">记录编号</NvFieldLabel>
        <NvInput id="field-order-no" v-model="orderNo" placeholder="请输入编号" />
        <NvFieldDescription>指派后将以此编号锁定关联条目并生成回执。</NvFieldDescription>
      </NvField>
      <NvField data-invalid="true">
        <NvFieldLabel for="field-plan-qty">计划数量</NvFieldLabel>
        <NvInput id="field-plan-qty" v-model="planQty" invalid placeholder="请输入计划数量" />
        <NvFieldError>计划数量不能为空。</NvFieldError>
      </NvField>
    </NvFieldGroup>
  </div>
</Demo>

```vue
<script setup>
import {
  NvField,
  NvFieldGroup,
  NvFieldLabel,
  NvFieldDescription,
  NvFieldError,
  NvInput,
} from '@nerv-iip/ui'
import { ref } from 'vue'
const orderNo = ref('REC-2406-0431')
const planQty = ref('')
</script>

<template>
  <NvFieldGroup>
    <NvField>
      <NvFieldLabel for="field-order-no">记录编号</NvFieldLabel>
      <NvInput id="field-order-no" v-model="orderNo" placeholder="请输入编号" />
      <NvFieldDescription>指派后将以此编号锁定关联条目并生成回执。</NvFieldDescription>
    </NvField>
    <NvField data-invalid="true">
      <NvFieldLabel for="field-plan-qty">计划数量</NvFieldLabel>
      <NvInput id="field-plan-qty" v-model="planQty" invalid placeholder="请输入计划数量" />
      <NvFieldError>计划数量不能为空。</NvFieldError>
    </NvField>
  </NvFieldGroup>
</template>
```

`NvFieldSet` 输出原生 `fieldset`，以首个 `NvFieldLegend`（原生 `legend`）为组名。下例使用默认 `legend` 变体；紧凑标签可使用公开的 `variant="label"`。不需要另加 `role="group"` 模拟分组。

<Demo>
  <FieldGroupExample />
</Demo>

<<< ../../.vitepress/examples/FieldGroupExample.vue

按 Tab 进入「准备内容」，编辑后用 Enter 提交，或 Tab 到「确认本页安排」按钮再提交。反馈只显示本页当前输入，刷新后不保留。`useId()` 为每个实例生成独立 ID，标签和说明分别关联到真实 input；不会与上方基础示例的 ID 冲突。

`NvFieldContent` 是单个字段的弹性内容区，包裹真实控件和说明；`NvFieldGroup` 才是多个字段的容器。`NvFieldTitle` 输出非 label 的标题，下例赋予标题语义；每个真实控件仍由 `NvFieldLabel` 的 `for` 关联独立 ID。

<Demo>
  <FieldContentExample />
</Demo>

<<< ../../.vitepress/examples/FieldContentExample.vue

主题字段显式使用 `orientation="horizontal"`；内容密度使用 `orientation="responsive"`，按 FieldGroup 容器宽度切换上下与并排。未传 orientation 时公开默认仍为 `vertical`。分隔线的可选插槽显示「显示方式」；省略插槽可只保留线条。Tab 可依次进入输入和原生选择框，修改立即反馈，全部状态仅保存在本页内存。`useId()` 隔离本例多实例及上方 F4 的 ID。

## API

| 组件                           | 说明                                                     |
| ------------------------------ | -------------------------------------------------------- |
| `NvFieldGroup`                 | 字段组容器，纵向堆叠并统一字段间距                       |
| `NvField`                      | 单个字段根容器，支持 `orientation` 切换横纵布局          |
| `NvFieldLabel`                 | 字段标签（基于原版 `Label`，可经 `for` 关联控件）        |
| `NvFieldContent`               | 字段内容区，包裹控件并撑满剩余空间                       |
| `NvFieldDescription`           | 辅助说明文案                                             |
| `NvFieldError`                 | 错误提示，可经默认插槽或 `errors` 传入                   |
| `NvFieldSet` / `NvFieldLegend` | `fieldset` / `legend`，用于多控件分组（如复选 / 单选组） |
| `NvFieldTitle`                 | 分组标题                                                 |
| `NvFieldSeparator`             | 字段间分隔线，可带内嵌文案                               |

| 属性          | 所属            | 说明                               | 类型                                         | 默认         |
| ------------- | --------------- | ---------------------------------- | -------------------------------------------- | ------------ |
| `orientation` | `NvField`       | 字段排布方向                       | `'vertical' \| 'horizontal' \| 'responsive'` | `'vertical'` |
| `for`         | `NvFieldLabel`  | 关联控件的 `id`（原生属性透传）    | `string`                                     | —            |
| `errors`      | `NvFieldError`  | 错误信息列表；省略时取默认插槽内容 | `Array<string \| { message?: string }>`      | —            |
| `variant`     | `NvFieldLegend` | 图例样式                           | `'legend' \| 'label'`                        | `'legend'`   |
