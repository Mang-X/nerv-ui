---
title: NvDataTable 数据表格
---

<script setup>
import { ref } from 'vue'
import { NvDataTable, NvBadge, NvProgress } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const columns = [
  { key: 'code', title: '工单号', width: 120 },
  { key: 'product', title: '产品', width: 150 },
  { key: 'line', title: '产线' },
  { key: 'qty', title: '计划数量', align: 'right', sortable: true },
  { key: 'progress', title: '完成度', align: 'right', sortable: true },
  { key: 'status', title: '状态' },
]

const rows = [
  { code: 'WO-1024', product: '铝合金支架', line: '3 号产线', qty: 500, progress: 68, status: '进行中' },
  { code: 'WO-1025', product: '不锈钢法兰', line: '1 号产线', qty: 320, progress: 92, status: '进行中' },
  { code: 'WO-1026', product: '铜制接头', line: '2 号产线', qty: 800, progress: 100, status: '已完工' },
  { code: 'WO-1027', product: '尼龙衬套', line: '4 号产线', qty: 1200, progress: 35, status: '暂停' },
  { code: 'WO-1028', product: '铸铁底座', line: '5 号产线', qty: 96, progress: 12, status: '待开工' },
]

const sort = ref(null)
const selected = ref([])
const basicSort = ref({ key: 'progress', direction: 'desc' })
</script>

# NvDataTable 数据表格

数据驱动的表格，支持列定义、排序、行选择、空状态与自定义单元格。

## 示例

<Demo block>
  <NvDataTable
    v-model:sort="sort"
    v-model:selected="selected"
    :rows="rows"
    :columns="columns"
    row-key="code"
    sortable
    selectable
    caption="生产工单列表"
  />
  <div style="display: flex; gap: 16px; margin-top: 10px; font-size: 13px; color: var(--vp-c-text-2)">
    <span>当前排序：{{ sort ? `${sort.key} ${sort.direction}` : '未排序' }}</span>
    <span>已选 {{ selected.length }} 行：{{ selected.join('、') || '—' }}</span>
  </div>
</Demo>

<Demo block>
  <NvDataTable
    v-model:sort="basicSort"
    :rows="rows"
    :columns="columns"
    row-key="code"
    size="sm"
  >
    <template #cell-status="{ value }">
      <NvBadge
        :variant="value === '已完工' ? 'brand' : value === '暂停' ? 'danger' : value === '待开工' ? 'outline' : 'neutral'"
        dot
      >
        {{ value }}
      </NvBadge>
    </template>
    <template #cell-progress="{ value }">
      <div style="min-width: 120px">
        <NvProgress :value="value" size="sm" />
      </div>
    </template>
  </NvDataTable>
</Demo>

<Demo block>
  <NvDataTable :rows="[]" :columns="columns.slice(0, 3)" empty-text="今天还没有生产工单" />
</Demo>

## API

### NvDataTable 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `rows` | 行数据，必填 | `T[]` | — |
| `columns` | 列定义，必填 | `NvDataTableColumn<T>[]` | — |
| `rowKey` | 稳定行标识字段或取值函数，默认用行下标 | `keyof T \| ((row, index) => string \| number)` | — |
| `sort` | 受控排序（`v-model:sort`）；传 `null` 表示不排序 | `NvDataTableSort \| null` | — |
| `defaultSort` | 非受控初始排序 | `NvDataTableSort \| null` | — |
| `sortable` | 让所有列默认可排序 | `boolean` | `false` |
| `selectable` | 增加选择复选列 | `boolean` | `false` |
| `selected` | 受控选中行的键（`v-model:selected`） | `(string \| number)[]` | — |
| `defaultSelected` | 非受控初始选中行 | `(string \| number)[]` | — |
| `emptyText` | 无数据时的文案；`empty` 插槽优先 | `string` | `暂无数据` |
| `caption` | 表格上方的读屏说明 | `string` | — |
| `size` | 尺寸 | `sm \| md` | `md` |

### NvDataTable 事件

| 事件 | 说明 |
| --- | --- |
| `update:sort` | 排序变化，参数为 `NvDataTableSort \| null` |
| `sortChange` | 同上，语义化别名 |
| `update:selected` | 选中行变化，参数为 `(string \| number)[]` |
| `selectChange` | 同上，语义化别名 |

### NvDataTable 插槽

| 插槽 | 说明 |
| --- | --- |
| `header-<key>` | 自定义某列表头，参数 `{ column }` |
| `cell-<key>` | 自定义某列单元格，参数 `{ row, column, value, index }` |
| `empty` | 自定义空状态，参数 `{ columns }` |

### NvDataTableColumn 字段

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `key` | 唯一列键，同时决定插槽名 | `string` |
| `title` | 表头文案 | `string` |
| `align` | 对齐方式 | `left \| center \| right` |
| `width` | 列宽，可传数字（px） | `string \| number` |
| `sortable` | 该列是否可排序，覆盖表格级 `sortable` | `boolean` |
| `value` | 排序与默认单元格取值函数，默认 `row[key]` | `(row, index) => unknown` |
