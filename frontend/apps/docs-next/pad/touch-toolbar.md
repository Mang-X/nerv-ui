---
title: NvTouchToolbar 触屏工具栏
---

<script setup>
import { ref } from 'vue'
import { NvTouchToolbar } from '@nerv-ui-next/pad'
import '@nerv-ui-next/pad/styles.css'

const items = [
  { value: 'records', label: '记录', active: true },
  { value: 'groups', label: '分组' },
  { value: 'resources', label: '资源' },
  { value: 'settings', label: '设置' },
]
const lastAction = ref('未操作')

function onAction(item) {
  lastAction.value = item.label
}
</script>

# NvTouchToolbar 触屏工具栏

平板端的底部操作条，可固定在视口底部，各操作等宽排列并标记当前项。

## 示例

<Demo block>
  <NvTouchToolbar :items="items" aria-label="示例工具栏" @action="onAction">
    <template #icon="{ item }">
      <svg v-if="item.value === 'records'" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 6h14M5 12h14M5 18h9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <svg v-else-if="item.value === 'groups'" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2" />
        <rect x="4" y="13" width="16" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2" />
      </svg>
      <svg v-else-if="item.value === 'resources'" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="7" r="3" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="M6 19c0-3.2 2.7-5 6-5s6 1.8 6 5" fill="none" stroke="currentColor" stroke-width="2" />
      </svg>
      <svg v-else width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="M12 4v2M12 18v2M4 12h2M18 12h2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </template>
  </NvTouchToolbar>
</Demo>

<p style="margin: 0; font-size: 14px; opacity: 0.72">
  最近点击：<span v-text="lastAction"></span>
</p>

<Demo block>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <NvTouchToolbar :items="items" aria-label="禁用工具栏" disabled />
    <NvTouchToolbar
      :items="[
        { value: 'a', label: '记录' },
        { value: 'b', label: '分组' },
        { value: 'c', label: '资源' },
      ]"
      position="static"
      elevated
      aria-label="带阴影工具栏"
    >
      <span style="display: flex; align-items: center; padding-inline: 12px; font-size: 14px; opacity: 0.72">
        自定义区
      </span>
    </NvTouchToolbar>
  </div>
</Demo>

## API

### NvTouchToolbar 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `items` | 按顺序渲染的操作项，必填 | `TouchToolbarItem[]` | — |
| `disabled` | 变暗并阻止所有操作 | `boolean` | `false` |
| `position` | `fixed` 将工具栏固定在视口底部 | `static \| fixed` | `static` |
| `elevated` | `fixed` 时抬升到页面内容之上 | `boolean` | `false` |
| `aria-label` | 工具栏的无障碍名称 | `string` | `工具条` |

### TouchToolbarItem

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `value` | 操作标识，由 `@action` 报告 | `string` |
| `label` | 操作文案 | `string` |
| `disabled` | 是否禁用该操作 | `boolean` |
| `active` | 标记为该组的当前操作 | `boolean` |

### 事件

| 事件 | 说明 |
| --- | --- |
| `action` | 点击可用操作，参数为 `TouchToolbarItem` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `icon` | 每个操作项上方的图标，作用域为 `{ item }` |
| `default` | 追加在操作项之后的自定义区域 |
