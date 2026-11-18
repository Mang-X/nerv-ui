---
title: NvMobileTabs 标签页
---

<script setup>
import { ref } from 'vue'
import { NvMobileTabs } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'

const tab = ref('overview')
const items = [
  { value: 'overview', label: '概览' },
  { value: 'detail', label: '明细' },
  { value: 'disabled', label: '不可用', disabled: true },
]
</script>

# NvMobileTabs 标签页

页内内容切换的标签栏，选中下划线跟随当前项。

## 示例

<Demo>
  <div style="width: 100%">
    <NvMobileTabs v-model="tab" :items="items">
      <template #panel-overview>
        <span>概览内容：今日完成 1,240 项。</span>
      </template>
      <template #panel-detail>
        <span>明细内容：共 36 条记录。</span>
      </template>
    </NvMobileTabs>
  </div>
</Demo>

当前标签：{{ tab }}

## API

### NvMobileTabs 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `items` | 标签项，必填 | `MobileTabItem[]` | — |
| `modelValue` | 当前标签值 | `string \| null` | — |
| `defaultValue` | 非受控初始值；未指定时取首个可用项 | `string \| null` | `null` |
| `ariaLabel` | 标签栏的无障碍标签 | `string` | `标签页` |
| `activation` | 切换方式 | `automatic \| manual` | `automatic` |
| `loop` | 键盘导航是否循环 | `boolean` | `true` |

### MobileTabItem

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `value` | 标签值 | `string` |
| `label` | 标签文案 | `string` |
| `icon` | 标签图标组件 | `Component` |
| `disabled` | 是否禁用 | `boolean` |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 当前标签变化，参数为 `string \| null` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `label-<value>` | 自定义某个标签的文案 |
| `panel-<value>` | 某个标签对应的面板内容；提供后该面板才会渲染 |
