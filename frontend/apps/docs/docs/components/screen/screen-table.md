---
title: NvScreenTable 数据表格
---

<script setup>
import { ref, computed } from 'vue'
import { NvScreenTable, NvScreenPagination, NvScreenButton } from '@nerv-ui/ui'
const page = ref(1)
const selected = ref('尚未选择')
const columns = [
  { key: 'id', label: '记录编号' },
  { key: 'title', label: '馆藏名称' },
  { key: 'count', label: '份数', align: 'right' },
  { key: 'note', label: '备注', align: 'center' },
  { key: 'action', label: '操作' },
]
const rows = Array.from({ length: 23 }, (_, i) => ({ id: `item-${i + 1}`, title: '城市记忆', count: i, note: i ? '—' : '', action: '' }))
const visibleRows = computed(() => rows.slice((page.value - 1) * 5, page.value * 5))
</script>

# NvScreenTable 数据表格

固定深色、发丝行线、按列对齐。组件只呈现宿主传入的行；查询、排序、分页和领域状态留在宿主。

## 示例

<ScreenDemo wide>
  <NvScreenTable :columns="columns" :rows="visibleRows" row-key="id" style="max-height:260px" tabindex="0" aria-label="馆藏清单">
    <template #cell-action="{ row }"><NvScreenButton size="sm" @click="selected = row.id">选择 {{ row.id }}</NvScreenButton></template>
  </NvScreenTable>
  <NvScreenPagination v-model:page="page" :total="rows.length" :page-size="5" style="margin-top:16px" />
  <p>{{ selected }}</p>
</ScreenDemo>

```vue
<script setup>
import { ref, computed } from 'vue'
const page = ref(1)
const rows = ref([{ id: 'item-1', count: 0, note: '' }])
const visibleRows = computed(() => rows.value.slice((page.value - 1) * 5, page.value * 5))
</script>

<template>
  <NvScreenTable :columns="columns" :rows="visibleRows" row-key="id">
    <template #cell-action="{ row, value }">
      <NvScreenButton size="sm" @click="select(row.id)">{{ value }}</NvScreenButton>
    </template>
  </NvScreenTable>
  <NvScreenPagination v-model:page="page" :total="rows.length" :page-size="5" />
</template>
```

## API

### NvScreenTable 属性

| 属性      | 说明                        | 类型                                                                      | 默认           |
| --------- | --------------------------- | ------------------------------------------------------------------------- | -------------- |
| `columns` | 列与表头/单元格对齐         | `{ key: string; label: string; align?: 'left' \| 'center' \| 'right' }[]` | 兼容示例列     |
| `rows`    | 只展示传入数组，不切页/去重 | `Record<string, unknown>[]`                                               | 兼容示例       |
| `rowKey`  | 唯一且稳定的行字段          | `string`                                                                  | `'wo'`（兼容） |

### 插槽

| 插槽         | 参数             | 说明                                                      |
| ------------ | ---------------- | --------------------------------------------------------- |
| `cell-<key>` | `{ row, value }` | 当前行及原值；回调使用 `row.id`，不使用行位置或业务参考号 |

## 设计说明

默认文本不以真值过滤：`0` 为 `0`、空字符串为空、`—` 保留。中性实体须显式设置 `row-key="id"`；同参考号不同 ID 可以同时存在。宿主保证 key 经 `String(key)` 转换后唯一且稳定（数字 `0` 与字符串 `'0'` 会成为同一 key），组件不按参考号去重。省略 props 的兼容示例继续可用。

指定根容器 `height` / `max-height` 后原生双向内滚，表头吸顶；可传 `tabindex="0"` 供键盘滚动。无需覆盖全局 `th` 或修改公共 CSS 层。独立完整演示见 playground `/#screen/tables`；文档站构建另属 #10。
