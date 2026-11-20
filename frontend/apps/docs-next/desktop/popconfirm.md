---
title: NvPopconfirm 二次确认
---

<script setup>
import { ref } from 'vue'
import { NvPopconfirm, NvButton } from '@nerv-ui-next/desktop'
import '@nerv-ui-next/desktop/styles.css'

const open = ref(false)
const busy = ref(false)
const log = ref('—')
function confirm() {
  log.value = '已确认'
  open.value = false
}
function cancel() {
  log.value = '已取消'
  open.value = false
}
</script>

# NvPopconfirm 二次确认

行内确认气泡，锚在触发元素上。用于删除/停用这类就地触发的危险动作——比整屏模态轻，又比直接执行多一道确认。

打开态、外部点击与 Esc 都由 `@ui-sdk/vue/popover` 承担。

## 示例

### 受控用法

<Demo>
  <NvPopconfirm
    v-model:open="open"
    title="确认删除这条记录？"
    description="删除后无法恢复。"
    confirm-text="删除"
    :loading="busy"
    @confirm="confirm"
    @cancel="cancel"
  >
    <template #trigger>
      <NvButton variant="outline">删除记录</NvButton>
    </template>
  </NvPopconfirm>
</Demo>

结果：{{ log }}

### 自管理 + 普通语义

不传 `open` 时组件自己管理开合；`tone="default"` 用于非破坏性确认。

<Demo>
  <NvPopconfirm tone="default" title="提交后不可修改？" description="请再确认一次内容。">
    <template #trigger>
      <NvButton variant="primary">提交</NvButton>
    </template>
  </NvPopconfirm>
</Demo>

## API

| 属性 / 插槽 | 说明 |
| --- | --- |
| `open` | 受控打开态（`v-model:open`）；不给就自管理。 |
| `title` | 标题问题。 |
| `description` | 后果说明，可选。 |
| `confirmText` / `cancelText` | 按钮文字。 |
| `tone` | `default` / `danger`，决定确认按钮的颜色。 |
| `loading` | 确认进行中：确认按钮不可再点。 |
| `trigger` 插槽 | 触发元素。 |

## 事件

| 事件 | 时机 |
| --- | --- |
| `confirm` | 点了确认。组件不自动关闭，由调用方决定（异步确认时通常成功后关）。 |
| `cancel` | 点了取消。 |
| `update:open` | 受控模式下原语请求改状态（外部点击、Esc 也会触发）。 |
