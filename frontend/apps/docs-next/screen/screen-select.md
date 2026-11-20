---
title: NvScreenSelect 大屏选择器
---

<script setup>
import { ref } from 'vue'
import { NvScreenSelect } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'

const line = ref(null)
const lines = [
  { value: 'a', label: '总装一线' },
  { value: 'b', label: '总装二线' },
  { value: 'c', label: '涂装区域' },
  { value: 'd', label: '不可选分组', disabled: true },
]
</script>

# NvScreenSelect 大屏选择器

大屏筛选区的下拉选择，可切换弹层呈现方式。

## 示例

<Demo>
  <div class="nv-screen-stage" style="flex-direction: column">
    <NvScreenSelect v-model="line" :options="lines" placeholder="选择分组" />
  </div>
</Demo>

当前选择：{{ line || '—' }}

<Demo>
  <div class="nv-screen-stage" style="flex-direction: column">
    <NvScreenSelect v-model="line" :options="lines" size="lg" placeholder="大号·面板呈现" presentation="sheet" />
    <NvScreenSelect v-model="line" :options="lines" placeholder="禁用" disabled />
  </div>
</Demo>

## API

### NvScreenSelect 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `options` | 选项列表，必填 | `ScreenSelectOption[]` | — |
| `modelValue` | 当前选项值 | `string \| null` | `null` |
| `placeholder` | 未选择时的占位文本 | `string` | `请选择` |
| `disabled` | 禁用 | `boolean` | `false` |
| `readOnly` | 只读 | `boolean` | `false` |
| `required` | 必填 | `boolean` | `false` |
| `name` | 原生字段名 | `string` | — |
| `size` | 尺寸，高度为 56 / 64px | `md \| lg` | `md` |
| `block` | 占满容器宽度 | `boolean` | `false` |
| `presentation` | 选项弹层形态 | `popover \| sheet \| auto` | `popover` |
| `ariaLabel` | 触发器的无障碍标签 | `string` | `选择` |

### ScreenSelectOption

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `value` | 选项值 | `string` |
| `label` | 选项文案 | `string` |
| `disabled` | 是否禁用 | `boolean` |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 当前选项变化，参数为 `string \| null` |
