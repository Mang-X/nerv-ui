---
title: NvTabs 标签页
---

<script setup>
import { ref } from 'vue'
import { NvTabs, NvTabsList, NvTabsTrigger, NvTabsPanel } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const tab = ref('overview')
const manualTab = ref('a')
const verticalTab = ref('general')
</script>

# NvTabs 标签页

在同级内容之间切换视图，支持横向、纵向排布与手动激活模式。

## 示例

<Demo>
  <div style="width: 100%">
    <NvTabs v-model:value="tab">
      <NvTabsList>
        <NvTabsTrigger value="overview">概览</NvTabsTrigger>
        <NvTabsTrigger value="quality">质量</NvTabsTrigger>
        <NvTabsTrigger value="logs" disabled>日志</NvTabsTrigger>
      </NvTabsList>
      <NvTabsPanel value="overview">工单总数 1,284，今日新增 37。</NvTabsPanel>
      <NvTabsPanel value="quality">一次通过率 98.2%，超差批次 3 个。</NvTabsPanel>
      <NvTabsPanel value="logs">该面板被禁用，无法切换过来。</NvTabsPanel>
    </NvTabs>
  </div>
</Demo>

当前标签：{{ tab }}

<Demo>
  <NvTabs default-value="a" activation="manual">
    <NvTabsList>
      <NvTabsTrigger value="a">标签 A</NvTabsTrigger>
      <NvTabsTrigger value="b">标签 B</NvTabsTrigger>
    </NvTabsList>
    <NvTabsPanel value="a">手动激活：方向键只移动焦点，按 Enter 或空格才切换。</NvTabsPanel>
    <NvTabsPanel value="b">这是标签 B 的面板。</NvTabsPanel>
  </NvTabs>
  <NvTabs v-model:value="manualTab" activation="manual">
    <NvTabsList>
      <NvTabsTrigger value="a">受控 A</NvTabsTrigger>
      <NvTabsTrigger value="b">受控 B</NvTabsTrigger>
    </NvTabsList>
    <NvTabsPanel value="a">当前值：{{ manualTab }}</NvTabsPanel>
    <NvTabsPanel value="b">当前值：{{ manualTab }}</NvTabsPanel>
  </NvTabs>
</Demo>

<Demo>
  <div style="display: flex; gap: 24px; align-items: flex-start; width: 100%">
    <NvTabs v-model:value="verticalTab" orientation="vertical" style="display: flex; gap: 16px; align-items: flex-start; width: auto">
      <NvTabsList>
        <NvTabsTrigger value="general">基本信息</NvTabsTrigger>
        <NvTabsTrigger value="params">参数</NvTabsTrigger>
      </NvTabsList>
      <NvTabsPanel value="general" style="margin-top: 0">纵向排布，列表在左，面板在右。</NvTabsPanel>
      <NvTabsPanel value="params" style="margin-top: 0">工艺参数共 12 项。</NvTabsPanel>
    </NvTabs>
  </div>
</Demo>

## API

### NvTabs 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 受控选中值（`v-model:value`） | `string \| null` | — |
| `defaultValue` | 非受控初始选中值 | `string \| null` | — |
| `orientation` | 标签排列方向 | `horizontal \| vertical` | `horizontal` |
| `activation` | `'automatic'` 方向键聚焦即选中；`'manual'` 需 Enter 或空格 | `automatic \| manual` | `automatic` |
| `loop` | 首尾之间循环切换 | `boolean` | `true` |

### NvTabs 事件

| 事件 | 说明 |
| --- | --- |
| `update:value` | 选中值变化，参数为 `string \| null` |

### NvTabs 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 放置 `NvTabsList` 与各 `NvTabsPanel` |

### NvTabsTrigger 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 该标签对应的面板值，必填 | `string` | — |
| `disabled` | 禁用该标签 | `boolean` | `false` |

### NvTabsTrigger 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 标签文字或图标 |

### NvTabsPanel 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 显示该面板的标签值，必填 | `string` | — |
| `keepMounted` | 未选中时仍保留内容 | `boolean` | `false` |

### NvTabsPanel 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 面板内容 |
