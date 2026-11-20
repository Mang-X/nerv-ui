---
title: NvDescriptions 描述列表
---

<script setup>
import { NvDescriptions, NvDescriptionsItem } from '@nerv-ui-next/desktop'
import '@nerv-ui-next/desktop/styles.css'
</script>

# NvDescriptions 描述列表

按标签与取值成对排布的详情网格，支持多列、跨列、横纵布局与带分隔线的样式。

## 示例

<Demo block>
  <NvDescriptions :columns="3">
    <NvDescriptionsItem label="记录号" value="REC-1031" />
    <NvDescriptionsItem label="类型" value="示例条目" />
    <NvDescriptionsItem label="所属分组" value="第三分组" />
    <NvDescriptionsItem label="计划数量" value="500 项" />
    <NvDescriptionsItem label="已完成" value="318 项" />
    <NvDescriptionsItem label="负责人" value="张明" />
    <NvDescriptionsItem label="备注" :span="3">
      首次校验通过后方可批量提交，异常项单独隔离。
    </NvDescriptionsItem>
  </NvDescriptions>
</Demo>

<Demo block>
  <NvDescriptions :columns="3" bordered label-width="6rem">
    <NvDescriptionsItem label="记录号" value="REC-1032" />
    <NvDescriptionsItem label="当前阶段" value="细化" />
    <NvDescriptionsItem label="资源编号" value="R-07" />
    <NvDescriptionsItem label="开始时间" value="2026-11-18 08:40" />
    <NvDescriptionsItem label="完成度" value="64%" />
    <NvDescriptionsItem label="状态" value="进行中" />
    <NvDescriptionsItem label="校验要求" :span="3">
      每 50 条抽查一次，记录长度与格式规范。
    </NvDescriptionsItem>
  </NvDescriptions>
</Demo>

<Demo block>
  <NvDescriptions :columns="2" layout="vertical">
    <NvDescriptionsItem label="记录号" value="REC-1033" />
    <NvDescriptionsItem label="类型" value="示例文档" />
    <NvDescriptionsItem label="流程" value="解析 → 转换 → 校验" :span="2" />
    <NvDescriptionsItem label="补充说明" :span="2">
      上下布局适合标签较长的详情面板。
    </NvDescriptionsItem>
  </NvDescriptions>
</Demo>

## API

### NvDescriptions 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `columns` | 每行的标签取值对数量 | `number` | `3` |
| `layout` | 标签在值旁或值上方 | `horizontal \| vertical` | `horizontal` |
| `bordered` | 绘制单元格分隔线与外框 | `boolean` | `false` |
| `labelWidth` | 横向布局下标签列的宽度 | `number \| string` | `88` |

### NvDescriptionsItem 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `label` | 标签文案，必填 | `string` | — |
| `value` | 取值文案；默认插槽优先 | `string \| number` | — |
| `span` | 跨占的列数，按 `columns` 截断 | `number` | `1` |

### NvDescriptionsItem 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 自定义取值内容，优先于 `value` |
