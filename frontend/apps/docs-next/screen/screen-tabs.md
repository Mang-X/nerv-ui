---
title: NvScreenTabs 大屏标签页
---

<script setup>
import { ref } from 'vue'
import { NvScreenTabs } from '@nerv-ui/screen'
import '@nerv-ui/screen/styles.css'

const tab = ref('realtime')

const items = [
  { value: 'realtime', label: '实时', badge: 12 },
  { value: 'history', label: '历史' },
  { value: 'quality', label: '校验' },
  { value: 'disabled', label: '不可用', disabled: true },
]
</script>

# NvScreenTabs 大屏标签页

深色舞台上的标签切换，下划线指示当前页，可横向或纵向排布并携带计数角标。

## 示例

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenTabs v-model:value="tab" :items="items">
      <template #default="{ item }">
        <p style="margin: 0; font-size: 13px; opacity: 0.8">
          <span v-text="item.label"></span> 面板内容
        </p>
      </template>
    </NvScreenTabs>
    <span style="font-size: 13px; opacity: 0.7">当前标签：<span v-text="tab"></span></span>
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="display: flex; gap: 24px; align-items: flex-start">
    <NvScreenTabs
      v-model:value="tab"
      :items="items"
      orientation="vertical"
      size="lg"
      :stretch="false"
      :show-panels="false"
    />
    <NvScreenTabs :items="items" :stretch="false" aria-label="紧凑标签">
      <template #panel="{ item }">
        <span v-text="item.label"></span>
      </template>
    </NvScreenTabs>
  </div>
</Demo>

## API

### NvScreenTabs 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `items` | 标签项，必填 | `ScreenTabItem[]` | — |
| `value` | 受控当前值（`v-model:value`） | `string \| null` | — |
| `defaultValue` | 非受控初始值 | `string \| null` | — |
| `orientation` | 排布方向 | `horizontal \| vertical` | `horizontal` |
| `activation` | 切换方式 | `automatic \| manual` | `automatic` |
| `loop` | 键盘导航是否循环 | `boolean` | `true` |
| `stretch` | 标签等分铺满宽度 | `boolean` | `true` |
| `size` | 字号，`lg` 为 20px | `md \| lg` | `md` |
| `disabled` | 禁用整组 | `boolean` | `false` |
| `showPanels` | 渲染面板；仅在存在面板插槽时生效 | `boolean` | `true` |
| `keepPanels` | 面板卸载后保留 DOM | `boolean` | `false` |
| `ariaLabel` | 标签栏的无障碍名称 | `string` | `标签页` |

### ScreenTabItem

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `value` | 标签值 | `string` |
| `label` | 标签文案 | `string` |
| `disabled` | 禁用该项 | `boolean` |
| `badge` | 文案后的计数角标 | `string \| number` |

### NvScreenTabs 事件

| 事件 | 说明 |
| --- | --- |
| `update:value` | 当前标签变化，参数为 `string \| null` |

### NvScreenTabs 插槽

| 插槽 | 说明 |
| --- | --- |
| `panel` | 每个标签的面板内容，作用域参数为 `{ item, index }` |
| `default` | 未使用 `panel` 时的面板内容，作用域同上 |
