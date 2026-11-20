---
title: NvDescriptions 描述列表
pageClass: nv-wide
---

<script setup>
import { NvDescriptions, NvStatusBadge } from '@nerv-ui/ui'

const items = [
  { key: 'code', label: '记录号', value: 'REC-2406-0413' },
  { label: '名称', value: '示例条目 A2' },
  { label: '所属节点', value: 'RES-07' },
  { label: '负责人', value: '张伟' },
  { label: '计划数量', value: '480 条' },
  { label: '已完成', value: '312 条' },
  { key: 'status', label: '状态', value: 'running' },
  { label: '优先级', value: '高' },
  { label: '截止日期', value: '2026-06-22' },
  { label: '备注', value: '首条需完整检查，通过后方可继续录入其余条目。', span: 3 },
]

const clampItems = [
  { label: '首条检查要求', value: '全字段核对' },
  { label: '关联批次号', value: 'BAT-7782-0034' },
  { label: '归属与交付地点', value: '示例客户 · 某地' },
  { label: '检查报告存储路径', value: 'first-check-v3.pdf' },
]
</script>

# NvDescriptions 描述列表

记录 / 资源等实体详情页的键值列表。`NvDescriptions` 支持多列网格、单元格跨列、`#<key>` 自定义值插槽，以及带边框的正式记录样式。

## 示例

<Demo block>
  <NvDescriptions :items="items" :columns="3">
    <template #code="{ item }">
      <span class="font-mono text-xs">{{ item.value }}</span>
    </template>
    <template #status="{ item }">
      <NvStatusBadge :value="String(item.value)" :pulse="item.value === 'running'" />
    </template>
  </NvDescriptions>
</Demo>

```vue
<NvDescriptions :items="items" :columns="3">
  <template #code="{ item }">
    <span class="font-mono text-xs">{{ item.value }}</span>
  </template>
  <template #status="{ item }">
    <NvStatusBadge :value="String(item.value)" :pulse="item.value === 'running'" />
  </template>
</NvDescriptions>
```

<Demo block>
  <NvDescriptions :items="items" :columns="3" bordered>
    <template #code="{ item }">
      <span class="font-mono text-xs">{{ item.value }}</span>
    </template>
    <template #status="{ item }">
      <NvStatusBadge :value="String(item.value)" :pulse="item.value === 'running'" />
    </template>
  </NvDescriptions>
</Demo>

```vue
<NvDescriptions :items="items" :columns="3" bordered />
```

`ellipsis` + `label-width`：标题单行截断，悬停时显示完整文本。

<Demo block>
  <NvDescriptions :items="clampItems" :columns="2" bordered ellipsis label-width="6rem" />
</Demo>

```vue
<NvDescriptions :items="items" :columns="2" bordered ellipsis label-width="6rem" />
```

## API

| 属性         | 说明                                           | 类型                     | 默认         |
| ------------ | ---------------------------------------------- | ------------------------ | ------------ |
| `items`      | 条目数组（`label` / `value` / `span` / `key`） | `DescriptionItem[]`      | —            |
| `columns`    | 每行键值对数（≤640px 折叠为 1）                | `number`                 | `2`          |
| `bordered`   | 带边框正式记录样式                             | `boolean`                | `false`      |
| `layout`     | 标签布局：横排或上下                           | `horizontal \| vertical` | `horizontal` |
| `labelWidth` | 固定标签列宽（如 `6rem`）                      | `string`                 | —            |
| `ellipsis`   | 标签单行截断 + 悬停时显示完整文本              | `boolean`                | `false`      |
| `size`       | 密度                                           | `default \| compact`     | `default`    |
