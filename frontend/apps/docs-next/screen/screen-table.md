---
title: NvScreenTable 大屏表格
---

<script setup>
import { NvScreenTable } from '@nerv-ui/screen'
import '@nerv-ui/screen/styles.css'

const columns = [
  { key: 'line', label: '分组', width: '22%' },
  { key: 'plan', label: '计划', align: 'end', width: 120 },
  { key: 'actual', label: '实际', align: 'end', width: 120 },
  { key: 'rate', label: '达成率', align: 'end', width: 120, variant: 'status' },
  { key: 'status', label: '状态', variant: 'status' },
]

const rows = [
  { id: 1, line: '第一分组', plan: 320, actual: 305, rate: { value: '95.3%', tone: 'success' }, status: { value: '运行', tone: 'success' } },
  { id: 2, line: '第二分组', plan: 280, actual: 240, rate: { value: '85.7%', tone: 'warning' }, status: { value: '低效', tone: 'warning' } },
  { id: 3, line: '第三分组', plan: 200, actual: 128, rate: { value: '64.0%', tone: 'danger' }, status: { value: '中断', tone: 'danger' } },
  { id: 4, line: '第四分组', plan: 180, actual: 176, rate: '97.8%', status: { value: '运行', tone: 'accent' } },
]
</script>

# NvScreenTable 大屏表格

深色数据表，支持状态点、语义色、对齐、列宽、斑马纹与逐行单元格插槽。

## 示例

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenTable :columns="columns" :rows="rows" aria-label="分组达成情况" />
    <NvScreenTable :columns="columns" :rows="rows" density="sm" :zebra="false" aria-label="紧凑无斑马纹" />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage">
    <NvScreenTable
      :columns="[
        { key: 'line', label: '分组' },
        { key: 'status', label: '状态' },
      ]"
      :rows="[
        { id: 1, line: '第一分组', status: '运行' },
        { id: 2, line: '第二分组', status: '中断' },
      ]"
    >
      <template #cell-status="{ value }">
        <span style="font-weight: 600" v-text="value === '运行' ? '● 正常运行' : '■ 已中断'"></span>
      </template>
    </NvScreenTable>
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage">
    <NvScreenTable :columns="columns" :rows="[]" empty-label="暂无分组数据" />
  </div>
</Demo>

## API

### NvScreenTable 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `columns` | 列定义，必填 | `ScreenTableColumn[]` | — |
| `rows` | 行数据，必填 | `ScreenTableRow[]` | — |
| `rowKey` | 作为行标识的列名 | `string` | `id` |
| `density` | 行高预设，`sm` 收紧纵向内边距 | `md \| sm` | `md` |
| `zebra` | 斑马纹 | `boolean` | `true` |
| `emptyLabel` | 空数据文案 | `string` | `暂无数据` |
| `ariaLabel` | 表格区域的无障碍名称 | `string` | `数据表` |

### ScreenTableColumn

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `key` | 列键，对应行字段 | `string` |
| `label` | 表头文案 | `string` |
| `align` | 对齐方式 | `'start' \| 'center' \| 'end'` |
| `width` | CSS 宽度；数字按 px 处理 | `number \| string` |
| `variant` | `status` 时渲染状态点与着色文字 | `'text' \| 'status'` |

### ScreenTableCell

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `value` | 单元格值 | `string \| number \| null \| undefined` |
| `tone` | 语义色 | `'default' \| 'accent' \| 'success' \| 'warning' \| 'danger'` |
| `dot` | 是否显示状态点；`variant: 'status'` 时默认显示 | `boolean` |

### NvScreenTable 插槽

| 插槽 | 说明 |
| --- | --- |
| `cell-<column.key>` | 自定义某列单元格，作用域参数为 `{ row, value, cell, index }` |
