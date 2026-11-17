---
title: NvActionSheet 操作菜单
---

<script setup>
import { ref } from 'vue'
import { NvActionSheet, NvMobileButton } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'

const open = ref(false)
const orderOpen = ref(false)
const picked = ref('尚未选择')

const actions = [
  { value: 'edit', label: '编辑工单', description: '修改数量与交期' },
  { value: 'split', label: '拆分批次' },
  { value: 'delete', label: '删除工单', description: '不可恢复', danger: true },
  { value: 'archive', label: '归档', disabled: true },
]

function onSelect(value) {
  picked.value = value
}
</script>

# NvActionSheet 操作菜单

从底部弹出的动作列表，适合承载针对某条记录的若干操作，危险动作可标红。

## 示例

<Demo>
  <NvMobileButton variant="secondary" @click="open = true">打开操作菜单</NvMobileButton>
  <NvActionSheet
    v-model:open="open"
    title="工单操作"
    description="选择要对当前工单执行的动作"
    :actions="actions"
    @select="onSelect"
  />
  <span style="font-size: 13px">最近选择：<span v-text="picked"></span></span>
</Demo>

<Demo>
  <NvMobileButton variant="outline" @click="orderOpen = true">自定义动作内容</NvMobileButton>
  <NvActionSheet v-model:open="orderOpen" title="更多">
    <NvMobileButton variant="ghost">自定义条目一</NvMobileButton>
    <NvMobileButton variant="ghost">自定义条目二</NvMobileButton>
  </NvActionSheet>
</Demo>

## API

### NvActionSheet 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `open` | 受控展开状态（`v-model:open`） | `boolean` | — |
| `defaultOpen` | 非受控初始展开状态 | `boolean` | `false` |
| `title` | 标题 | `string` | — |
| `description` | 补充说明 | `string` | — |
| `actions` | 动作列表 | `MobileActionSheetItem[]` | `[]` |
| `cancelText` | 取消按钮文案 | `string` | `取消` |
| `showCancel` | 显示取消按钮 | `boolean` | `true` |
| `ariaLabel` | 无标题时的无障碍名称 | `string` | `操作菜单` |
| `modal` | `true` 锁定焦点并屏蔽页面；`'trap-focus'` 只锁定焦点 | `boolean \| 'trap-focus'` | `true` |
| `dismissible` | 是否允许 Esc 与外部按下关闭 | `boolean` | `true` |
| `closeOnOutsidePress` | 是否允许点击遮罩关闭 | `boolean` | `true` |

### MobileActionSheetItem

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `value` | 动作标识，随 `select` 事件回传 | `string` |
| `label` | 动作文案 | `string` |
| `description` | 动作补充说明 | `string` |
| `icon` | 动作图标组件 | `Component` |
| `danger` | 危险动作样式 | `boolean` |
| `disabled` | 禁用该项 | `boolean` |

### NvActionSheet 事件

| 事件 | 说明 |
| --- | --- |
| `update:open` | 展开状态变化，参数为 `boolean` |
| `open-change` | 展开状态变化，参数为 `boolean` |
| `select` | 选中某个动作，参数为动作的 `value` |
| `cancel` | 点击取消按钮 |

### NvActionSheet 插槽

| 插槽 | 说明 |
| --- | --- |
| `title` | 自定义标题 |
| `description` | 自定义说明 |
| `default` | 追加自定义条目，位于 `actions` 之后、取消按钮之前 |
| `cancel` | 自定义取消按钮内容 |
