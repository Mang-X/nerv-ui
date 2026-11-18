---
title: NvTouchSelect 触屏选择器
---

<script setup>
import { computed, ref } from 'vue'
import { NvTouchSelect } from '@nerv-ui/pad'
import '@nerv-ui/pad/styles.css'

const groupOptions = [
  { value: 'g-01', label: '分组 A' },
  { value: 'g-02', label: '分组 B' },
  { value: 'g-03', label: '分组 C（已归档）', disabled: true },
]
const resourceOptions = [
  { value: 'r-01', label: '资源 1' },
  { value: 'r-02', label: '资源 2' },
  { value: 'r-03', label: '资源 3' },
  { value: 'r-04', label: '资源 4' },
]
const emptyOptions = []

const group = ref('g-01')
const resources = ref(['r-01', 'r-02'])
const emptyValue = ref(null)

const groupLabel = computed(
  () => groupOptions.find((option) => option.value === group.value)?.label ?? '未选择',
)
const resourceLabels = computed(() =>
  resources.value.map((value) => resourceOptions.find((option) => option.value === value)?.label ?? value),
)
</script>

# NvTouchSelect 触屏选择器

平板端的选项选择控件，触发器高度 56 / 64px，选项在浮层中展示，支持单选与多选。

## 示例

<Demo block>
  <NvTouchSelect v-model="group" label="记录分组" :options="groupOptions" />
  <p style="margin: 0; font-size: 14px; opacity: 0.72">当前分组：<span v-text="groupLabel"></span></p>
</Demo>

<Demo block>
  <NvTouchSelect
    v-model="resources"
    label="关联资源"
    :options="resourceOptions"
    multiple
    :max-labels="2"
    size="md"
  />
  <p style="margin: 0; font-size: 14px; opacity: 0.72">
    已选 <span v-text="resourceLabels.length"></span> 项：<span v-text="resourceLabels.join('、')"></span>
  </p>
</Demo>

<Demo block>
  <NvTouchSelect label="无选项状态" :options="emptyOptions" empty-label="暂无可用分组" />
</Demo>

<Demo block>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <NvTouchSelect label="禁用" :options="groupOptions" model-value="g-01" disabled />
    <NvTouchSelect label="只读" :options="groupOptions" model-value="g-02" read-only />
  </div>
</Demo>

## API

### NvTouchSelect 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `options` | 浮层中渲染的选项，也用于解析触发器文案，必填 | `TouchSelectOption[]` | — |
| `modelValue` | 绑定值（`v-model`）；`multiple` 时为数组 | `string \| string[] \| null` | — |
| `defaultValue` | 非受控时首先选中的值 | `string \| string[] \| null` | — |
| `multiple` | 多选，绑定值变为数组 | `boolean` | `false` |
| `disabled` | 禁用 | `boolean` | `false` |
| `readOnly` | 只读 | `boolean` | `false` |
| `required` | 必填 | `boolean` | `false` |
| `name` | 提交时使用的字段名 | `string` | — |
| `label` | 触发器上方的标签 | `string` | — |
| `placeholder` | 未选择时触发器显示的文案 | `string` | `请选择` |
| `maxLabels` | 多选时触发器最多展示的标签数，超出部分计为数量 | `number` | — |
| `emptyLabel` | `options` 为空时显示的文案 | `string` | `暂无可选项` |
| `size` | 触发器高度：`md` 为 56px，`lg` 为 64px | `md \| lg` | `lg` |
| `side` | 浮层相对触发器的方位 | `top \| right \| bottom \| left` | `bottom` |
| `align` | 浮层与触发器的对齐方式 | `start \| center \| end` | `start` |

### TouchSelectOption

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `value` | 选项值 | `string` |
| `label` | 选项文案 | `string` |
| `disabled` | 是否禁用 | `boolean` |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 选中值变化，单选为 `string \| null`，多选为 `string[]` |

### 插槽

无插槽。
