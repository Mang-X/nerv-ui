---
title: NvTabBar 底部导航栏
---

<script setup>
import { ref } from 'vue'
import { NvTabBar } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'

const current = ref('home')
const items = [
  { value: 'home', label: '首页' },
  { value: 'tasks', label: '任务', badge: 3 },
  { value: 'messages', label: '消息', dot: true },
  { value: 'me', label: '我的' },
]
</script>

# NvTabBar 底部导航栏

移动端主导航。默认固定在视口底部，在文档或嵌入场景里可用 `fixed=false` 还原为普通布局。

## 示例

<Demo>
  <div style="width: 100%; padding-bottom: 8px">
    <NvTabBar v-model="current" :items="items" :fixed="false" />
  </div>
</Demo>

当前页：{{ current }}

<Demo>
  <div style="width: 100%">
    <NvTabBar
      v-model="current"
      :fixed="false"
      :items="[
        { value: 'home', label: '首页' },
        { value: 'tasks', label: '任务', disabled: true },
        { value: 'me', label: '我的' },
      ]"
    />
  </div>
</Demo>

## API

### NvTabBar 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `items` | 导航项，必填 | `MobileTabBarItem[]` | — |
| `modelValue` | 当前项 | `string \| null` | — |
| `defaultValue` | 非受控初始值；未指定时取首个可用项 | `string \| null` | `null` |
| `ariaLabel` | 导航栏的无障碍标签 | `string` | `主导航` |
| `fixed` | 固定在视口底部 | `boolean` | `true` |

### MobileTabBarItem

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `value` | 导航项值 | `string` |
| `label` | 文案 | `string` |
| `icon` | 图标组件 | `Component` |
| `badge` | 角标文字或数字 | `string \| number` |
| `dot` | 显示小红点（无 `badge` 时生效） | `boolean` |
| `disabled` | 是否禁用 | `boolean` |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 当前项变化，参数为 `string \| null` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `label-<value>` | 自定义某个导航项的文案 |
