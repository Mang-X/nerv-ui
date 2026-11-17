---
title: NvPopconfirm 气泡确认
---

<script setup>
import { NvPopconfirm, NvButton, NvNotifierHost, nvMessage } from '@nerv-iip/ui'
</script>

# NvPopconfirm 气泡确认

行内危险操作或主操作的二次确认，气泡锚定在触发元素旁，比整页对话框更轻量。

本页确认结果通过消息显示，两个示例共用一个 `NvNotifierHost`。接入应用时在根部挂载一次；已有 Host 时不要重复添加。

<ClientOnly>
  <NvNotifierHost />
</ClientOnly>

## 危险操作

默认 `danger` 基调，确认按钮为红色。

<Demo>
  <NvPopconfirm
    title="确认删除该记录？"
    description="删除后不可恢复。"
    confirm-text="删除"
    @confirm="nvMessage.error('记录已删除')"
  >
    <NvButton variant="outline" size="sm">删除记录</NvButton>
  </NvPopconfirm>
</Demo>

```vue
<NvPopconfirm
  title="确认删除该记录？"
  description="删除后不可恢复。"
  confirm-text="删除"
  @confirm="nvMessage.error('记录已删除')"
>
  <NvButton variant="outline" size="sm">删除记录</NvButton>
</NvPopconfirm>
```

## 主操作确认

设置 `confirm-tone="brand"`，确认按钮使用品牌色。

<Demo>
  <NvPopconfirm
    title="确认分配到该分组？"
    confirm-text="分配"
    confirm-tone="brand"
    @confirm="nvMessage.success('已分配')"
  >
    <NvButton variant="brand" size="sm">分配任务</NvButton>
  </NvPopconfirm>
</Demo>

```vue
<NvPopconfirm
  title="确认分配到该分组？"
  confirm-text="分配"
  confirm-tone="brand"
  @confirm="nvMessage.success('已分配')"
>
  <NvButton variant="brand" size="sm">分配任务</NvButton>
</NvPopconfirm>
```

## 属性

| 属性          | 说明                       | 类型              | 默认               |
| ------------- | -------------------------- | ----------------- | ------------------ |
| `title`       | 确认标题                   | `string`          | `确认执行该操作？` |
| `description` | 补充描述                   | `string`          | —                  |
| `confirmText` | 确认按钮文案               | `string`          | `确定`             |
| `cancelText`  | 取消按钮文案               | `string`          | `取消`             |
| `confirmTone` | 确认按钮基调               | `brand \| danger` | `danger`           |
| `loading`     | 确认按钮加载态（受控时）   | `boolean`         | `false`            |
| `open`        | 受控开关（`v-model:open`） | `boolean`         | —                  |

## 事件

| 事件      | 说明           |
| --------- | -------------- |
| `confirm` | 点击确认时触发 |
| `cancel`  | 点击取消时触发 |
