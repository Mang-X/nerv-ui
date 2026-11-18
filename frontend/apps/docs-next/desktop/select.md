---
title: NvSelect 选择器
---

<script setup>
import { ref } from 'vue'
import {
  NvSelect,
  NvSelectTrigger,
  NvSelectValue,
  NvSelectContent,
  NvSelectItem,
  NvSelectLabel,
} from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const single = ref('apple')
const multiple = ref(['apple'])
const empty = ref(null)
</script>

# NvSelect 选择器

从选项列表中选择一项或多项，弹层支持分组标签、禁用项与键盘操作。

## 示例

<Demo>
  <div style="width: 240px">
    <NvSelect v-model:value="single" placeholder="选择水果">
      <NvSelectTrigger>
        <NvSelectValue placeholder="选择水果" />
      </NvSelectTrigger>
      <NvSelectContent>
        <NvSelectLabel>常见水果</NvSelectLabel>
        <NvSelectItem value="apple">苹果</NvSelectItem>
        <NvSelectItem value="banana">香蕉</NvSelectItem>
        <NvSelectItem value="orange">橙子</NvSelectItem>
        <NvSelectItem value="durian" disabled>榴莲（缺货）</NvSelectItem>
      </NvSelectContent>
    </NvSelect>
  </div>
</Demo>

当前选择：{{ single || '—' }}

<Demo>
  <div style="width: 260px">
    <NvSelect v-model:value="multiple" multiple>
      <NvSelectTrigger>
        <NvSelectValue placeholder="选择标签" :max-labels="2" />
      </NvSelectTrigger>
      <NvSelectContent>
        <NvSelectItem value="apple">苹果</NvSelectItem>
        <NvSelectItem value="banana">香蕉</NvSelectItem>
        <NvSelectItem value="orange">橙子</NvSelectItem>
        <NvSelectItem value="grape">葡萄</NvSelectItem>
      </NvSelectContent>
    </NvSelect>
  </div>
</Demo>

已选：{{ multiple.length ? multiple.join('、') : '—' }}

<Demo>
  <div style="width: 240px">
    <NvSelect v-model:value="empty" placeholder="禁用状态" disabled>
      <NvSelectTrigger>
        <NvSelectValue placeholder="禁用状态" />
      </NvSelectTrigger>
      <NvSelectContent>
        <NvSelectItem value="a">选项 A</NvSelectItem>
        <NvSelectItem value="b">选项 B</NvSelectItem>
      </NvSelectContent>
    </NvSelect>
  </div>
  <div style="width: 240px">
    <NvSelect v-model:value="single">
      <NvSelectTrigger hide-chevron>
        <NvSelectValue placeholder="无箭头触发器" />
      </NvSelectTrigger>
      <NvSelectContent align="end" :side-offset="8">
        <NvSelectItem value="apple">苹果</NvSelectItem>
        <NvSelectItem value="banana">香蕉</NvSelectItem>
        <NvSelectItem value="orange">橙子</NvSelectItem>
      </NvSelectContent>
    </NvSelect>
  </div>
</Demo>

## API

### NvSelect 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 绑定值（`v-model:value`）；`multiple` 时为数组 | `string \| string[] \| null` | — |
| `defaultValue` | 非受控初始值 | `string \| string[] \| null` | — |
| `multiple` | 多选，绑定值变为数组 | `boolean` | `false` |
| `open` | 受控展开状态（`v-model:open`） | `boolean` | — |
| `defaultOpen` | 非受控初始展开状态 | `boolean` | — |
| `disabled` | 禁用 | `boolean` | `false` |
| `readOnly` | 只读 | `boolean` | `false` |
| `required` | 必填 | `boolean` | `false` |
| `name` | 提交时的字段名 | `string` | — |
| `placeholder` | 未选择时的占位文本 | `string` | — |
| `items` | 选项数据源，供打开前解析标签 | `ListData` | — |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:value` | 选中值变化，参数为 `string \| string[] \| null` |
| `update:open` | 展开状态变化，参数为 `boolean` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 放置 Trigger 与 Content |

### NvSelectTrigger 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `disabled` | 禁用触发器 | `boolean` | `false` |
| `hideChevron` | 隐藏内置的下拉箭头 | `boolean` | `false` |

### NvSelectTrigger 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 触发器内容，通常放 `NvSelectValue` |

### NvSelectValue 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `placeholder` | 未选择时的占位文本 | `string` | — |
| `maxLabels` | 多选时最多显示的标签数，其余折叠计数 | `number` | — |

### NvSelectContent 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `side` | 弹层相对触发器的方向 | `top \| right \| bottom \| left` | `bottom` |
| `align` | 弹层对齐方式 | `start \| center \| end` | `start` |
| `sideOffset` | 与触发器的间距（px） | `number` | `4` |

### NvSelectContent 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 选项与分组标签 |

### NvSelectItem 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 该选项的值，必填 | `string` | — |
| `label` | 选项内容不是纯文本时，触发器上显示的文案 | `string` | — |
| `disabled` | 禁用该选项 | `boolean` | `false` |

### NvSelectItem 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 选项内容；缺省时显示 `label` |

### NvSelectLabel 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `id` | 分组标签的 id，触发器会自动关联 | `string` | — |

### NvSelectLabel 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 分组文案 |
