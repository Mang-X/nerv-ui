---
title: NvCommand 命令面板
---

<script setup>
import { ref } from 'vue'
import { NvCommand } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const lastAction = ref(null)

const entries = [
  {
    label: '生产',
    items: [
      { value: 'new-order', label: '新建生产工单', keywords: ['创建', '订单'], shortcut: '⌘ N' },
      { value: 'schedule', label: '打开排产计划', keywords: ['计划', '甘特'], shortcut: '⌘ K' },
      { value: 'report', label: '导出生产报表', keywords: ['导出', '报表'] },
    ],
  },
  {
    label: '设备',
    items: [
      { value: 'device-status', label: '查看设备状态', keywords: ['监控', 'oee'] },
      { value: 'maintenance', label: '登记保养记录', disabled: true },
    ],
  },
  { value: 'settings', label: '打开系统设置', keywords: ['偏好', '配置'] },
]

const flatEntries = [
  { value: 'a', label: '开始生产', keywords: ['启动'] },
  { value: 'b', label: '暂停产线' },
  { value: 'c', label: '切换班次' },
  { value: 'd', label: '查看报警' },
]
</script>

# NvCommand 命令面板

带搜索的命令列表，支持分组、快捷键提示与键盘高亮；选中后触发 `action`。

## 示例

<Demo block>
  <NvCommand :items="entries" style="max-width: 460px" @action="lastAction = $event" />
  <div style="margin-top: 10px; font-size: 13px; color: var(--vp-c-text-2)">
    最近执行：{{ lastAction ?? '—' }}
  </div>
</Demo>

<Demo block>
  <NvCommand
    :items="flatEntries"
    filter="startsWith"
    empty-text="没有匹配的命令"
    style="max-width: 380px"
  />
</Demo>

<Demo block>
  <NvCommand :items="flatEntries" :query="'切换'" filter="contains" style="max-width: 380px" />
</Demo>

<Demo>
  <NvCommand :items="flatEntries" :auto-highlight="false" style="max-width: 300px" />
</Demo>

## API

### NvCommand 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `items` | 命令数据，含分组的条目按组渲染 | `NvCommandEntry[]` | — |
| `value` | 受控高亮命令（`v-model:value`） | `string \| null` | — |
| `defaultValue` | 非受控初始高亮命令 | `string \| null` | — |
| `query` | 受控搜索文本（`v-model:query`） | `string` | — |
| `defaultQuery` | 非受控初始搜索文本 | `string` | — |
| `filter` | 输入如何缩小列表 | `fuzzy \| contains \| startsWith \| false` | `fuzzy` |
| `autoHighlight` | 自动高亮首个匹配项 | `boolean` | `true` |
| `loop` | 键盘导航首尾循环 | `boolean` | `true` |
| `placeholder` | 搜索框占位文本 | `string` | `输入命令或搜索…` |
| `ariaLabel` | 搜索字段的无障碍名称 | `string` | `搜索命令` |
| `emptyText` | 无匹配时的文案 | `string` | `没有匹配的命令` |

### NvCommand 事件

| 事件 | 说明 |
| --- | --- |
| `action` | 执行命令，参数为命令的 `value` |
| `update:value` | 高亮命令变化，参数为 `string \| null` |
| `update:query` | 搜索文本变化，参数为 `string` |

### NvCommand 插槽

无插槽；搜索框与列表由 `items` 数据驱动。

### 数据条目结构

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `value` | 命令标识，`action` 事件回传该值 | `string` |
| `label` | 行显示文本，同时参与搜索匹配 | `string` |
| `keywords` | 额外参与搜索匹配的词 | `string[]` |
| `disabled` | 禁用该命令 | `boolean` |
| `shortcut` | 快捷键提示，如 `⌘ P` | `string` |
| `items` | 分组时的子命令数组 | `NvCommandItem[]` |
| `label`（分组） | 分组标题 | `string` |
