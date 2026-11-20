---
title: NvSwipeCell 滑动单元格
---

<script setup>
import { ref } from 'vue'
import { NvSwipeCell } from '@nerv-ui-next/mobile'
import '@nerv-ui-next/mobile/styles.css'

const lastAction = ref('尚未操作')

const actions = [
  { value: 'pin', label: '置顶', variant: 'brand' },
  { value: 'delete', label: '删除', variant: 'danger' },
]

const startActions = [
  { value: 'read', label: '标为已读', variant: 'neutral' },
  { value: 'done', label: '完成', variant: 'brand' },
]

function onAction(value) {
  lastAction.value = value
}
</script>

# NvSwipeCell 滑动单元格

列表行的滑动操作容器，向左或向右拖动露出预置动作，适用于置顶、删除、标记等操作。

## 示例

<Demo block>
  <NvSwipeCell :actions="actions" actions-label="行操作" @action="onAction">
    <div style="padding: 14px 16px; background: #fff; border-bottom: 1px solid #e5e7eb">
      <div style="font-weight: 600">REC-2026-1138 · 第一分组</div>
      <div style="font-size: 13px; opacity: 0.7">用鼠标向左拖动可露出操作按钮</div>
    </div>
  </NvSwipeCell>
  <span style="font-size: 13px">最近操作：<span v-text="lastAction"></span></span>
</Demo>

<Demo block>
  <NvSwipeCell :actions="startActions" side="start" @action="onAction">
    <div style="padding: 14px 16px; background: #fff; border-bottom: 1px solid #e5e7eb">
      <div style="font-weight: 600">REC-2026-0451 · 首次校验</div>
      <div style="font-size: 13px; opacity: 0.7">向右拖动从起始边露出操作</div>
    </div>
  </NvSwipeCell>
</Demo>

## API

### NvSwipeCell 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `actions` | 动作列表 | `MobileSwipeAction[]` | `[]` |
| `actionWidth` | 每个露出动作的宽度（px） | `number` | `76` |
| `disabled` | 禁用拖动 | `boolean` | `false` |
| `actionsLabel` | 动作面板的无障碍名称 | `string` | `操作` |
| `side` | 动作所在边；拖拽从该边露出 | `end \| start` | `end` |

### MobileSwipeAction

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `value` | 动作标识，随 `action` 事件回传 | `string` |
| `label` | 动作文案 | `string` |
| `variant` | 动作底色 | `'brand' \| 'danger' \| 'neutral'` |
| `disabled` | 禁用该动作 | `boolean` |

### NvSwipeCell 事件

| 事件 | 说明 |
| --- | --- |
| `action` | 点击某个动作，参数为动作的 `value` |
| `open-change` | 动作面板开合状态变化，参数为 `boolean` |

### NvSwipeCell 暴露方法

| 方法 | 说明 |
| --- | --- |
| `close()` | 收起动作面板 |

### NvSwipeCell 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 单元格内容 |
