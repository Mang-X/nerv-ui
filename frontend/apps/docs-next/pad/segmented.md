---
title: NvSegmented 分段控件
---

<script setup>
import { ref } from 'vue'
import { NvSegmented } from '@nerv-ui/pad'
import '@nerv-ui/pad/styles.css'

const view = ref('grid')
const density = ref('standard')
const options = [
  { value: 'grid', label: '网格' },
  { value: 'list', label: '列表' },
  { value: 'board', label: '看板' },
]
const densityOptions = [
  { value: 'compact', label: '紧凑' },
  { value: 'standard', label: '标准' },
  { value: 'comfortable', label: '宽松' },
  { value: 'disabled', label: '不可用', disabled: true },
]
</script>

# NvSegmented 分段控件

平板端的少量互斥选项切换，滑块指示当前项。

## 示例

<Demo>
  <div style="width: 100%">
    <NvSegmented v-model="view" :options="options" />
  </div>
</Demo>

当前视图：{{ view }}

<Demo>
  <div style="width: 100%">
    <NvSegmented v-model="density" :options="densityOptions" size="lg" block />
  </div>
</Demo>

<Demo>
  <div style="width: 100%">
    <NvSegmented
      v-model="density"
      :options="densityOptions"
      orientation="vertical"
      size="md"
    />
  </div>
</Demo>

## API

### NvSegmented 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `options` | 选项列表，必填 | `SegmentedOption[]` | — |
| `modelValue` | 当前选项值 | `string \| null` | `null` |
| `disabled` | 整组禁用 | `boolean` | `false` |
| `readOnly` | 整组只读 | `boolean` | `false` |
| `required` | 必填 | `boolean` | `false` |
| `name` | 原生字段名 | `string` | — |
| `loop` | 键盘导航是否循环 | `boolean` | `true` |
| `ariaLabel` | 组的无障碍标签 | `string` | `选项` |
| `size` | 尺寸，项高依次为 56 / 64 / 72px | `md \| lg \| xl` | `md` |
| `orientation` | 排列方向 | `horizontal \| vertical` | `horizontal` |
| `block` | 占满容器宽度 | `boolean` | `false` |

### SegmentedOption

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `value` | 选项值 | `string` |
| `label` | 选项文案 | `string` |
| `disabled` | 是否禁用 | `boolean` |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 当前选项变化，参数为 `string \| null` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `option` | 自定义选项内容，作用域为 `{ option }` |
