---
title: NvDataTable 数据表格
pageClass: nv-wide
---

<script setup>
import BaseTableExample from '../../.vitepress/examples/BaseTableExample.vue'
import {
  NvDataTable,
  NvDataTableToolbar,
  NvPagination,
  NvButton,
  NvStatusBadge,
  NvNotifierHost,
  nvMessage,
} from '@nerv-ui/ui'
import { PlusIcon, ListFilterIcon } from '@lucide/vue'
import { ref } from 'vue'

const columns = [
  { key: 'code', header: '记录号', width: '160px', sortable: true, filter: 'text', cellClass: 'font-mono text-xs', hideable: false },
  { key: 'product', header: '名称', sortable: true, filter: 'text', cellClass: 'font-medium' },
  { key: 'center', header: '资源节点', width: '140px', filter: 'enum', cellClass: 'font-mono text-xs text-muted-foreground' },
  { key: 'owner', header: '负责人', width: '110px', filter: 'enum' },
  { key: 'qty', header: '数量', width: '110px', align: 'end', sortable: true, cellClass: 'tabular-nums' },
  {
    key: 'status',
    header: '状态',
    filter: 'enum',
    filterOptions: [
      { label: '执行中', value: 'running' },
      { label: '已完成', value: 'completed' },
      { label: '可启动', value: 'ready' },
      { label: '阻塞', value: 'blocked' },
      { label: '待处理', value: 'pending' },
    ],
  },
]

const PRODUCTS = ['示例项 A2', '示例项 L', '示例项 C', '示例项 V3', '示例项 M', '示例项 B']
const CENTERS = ['RES-07', 'RES-02', 'RES-11', 'RES-04', 'RES-01']
const OWNERS = ['张伟', '李娜', '王强', '刘洋', '陈静']
const STATUS = ['running', 'completed', 'ready', 'blocked', 'pending']
const QTYS = [480, 1200, 320, 640, 5000, 260, 180, 900]
const rows = Array.from({ length: 24 }, (_, i) => ({
  code: `REC-2406-${String(401 + i * 3).padStart(4, '0')}`,
  product: PRODUCTS[i % PRODUCTS.length],
  center: CENTERS[i % CENTERS.length],
  owner: OWNERS[i % OWNERS.length],
  qty: QTYS[(i * 5) % QTYS.length],
  status: STATUS[(i * 2) % STATUS.length],
}))

const tabs = [
  { label: '全部', value: '' },
  { label: '执行中', value: 'running' },
  { label: '待处理', value: 'pending' },
  { label: '已完成', value: 'completed' },
]
const selected = ref(['REC-2406-0401'])

const tbSearch = ref('')
const tbTab = ref('running')
const tbDensity = ref('comfortable')
const tbTabs = [
  { label: '全部', value: 'all', count: 48 },
  { label: '执行中', value: 'running', count: 12 },
  { label: '待处理', value: 'pending', count: 9 },
  { label: '已完成', value: 'completed', count: 18 },
]

const page = ref(8)
const pageSize = ref(10)
</script>

# NvDataTable 数据表格

完整的高级数据表体验。`NvDataTable` 内置工具栏（搜索 · 字段筛选 · 列显隐 · 密度）、可排序表头、行选择与可点击页码分页；默认在客户端处理筛选/排序/分页。工具栏 `NvDataTableToolbar` 与分页 `NvPagination` 也可独立使用。

## 示例

本页操作消息共用一个 `NvNotifierHost`，只展示刷新、重试、导出、打印等操作回执，不执行真实业务或生成文件。接入应用时在根部挂载一次；已有 Host 时不要重复添加。

<ClientOnly>
  <NvNotifierHost />
</ClientOnly>

<Demo block>
  <NvDataTable
    :columns="columns"
    :rows="rows"
    row-key="code"
    title="记录列表"
    description="近 30 天已分配的全部记录"
    :tabs="tabs"
    tab-key="status"
    selectable
    refreshable
    search-placeholder="搜索记录号 / 名称 / 资源节点…"
    :page-size="8"
    v-model:selected="selected"
    @refresh="nvMessage.success('已刷新记录列表')"
  >
    <template #cell-status="{ value }">
      <NvStatusBadge :value="String(value)" :pulse="value === 'running'" />
    </template>
    <template #bulk-actions>
      <NvButton variant="outline" size="sm" @click="nvMessage.info(`导出范围：${selected.length} 条已选记录`)">导出所选</NvButton>
      <NvButton variant="brand" size="sm" @click="nvMessage.info(`分配范围：${selected.length} 条已选记录`)">批量分配</NvButton>
    </template>
    <template #actions>
      <NvButton variant="brand" size="sm" @click="nvMessage.info('已选择表格页新建记录')">
        <template #leading><PlusIcon /></template>
        新建记录
      </NvButton>
    </template>
  </NvDataTable>
</Demo>

```vue
<NvDataTable
  :columns="columns"
  :rows="rows"
  row-key="code"
  title="记录列表"
  :tabs="tabs"
  tab-key="status"
  selectable
  refreshable
  :page-size="8"
  v-model:selected="selected"
  @refresh="onRefresh"
>
  <template #cell-status="{ value }">
    <NvStatusBadge :value="String(value)" :pulse="value === 'running'" />
  </template>
  <template #actions>
    <NvButton variant="brand" size="sm">新建记录</NvButton>
  </template>
</NvDataTable>
```

表格必须能表达「请求失败」和「还没查」，不能把它们都塞进空态——一个 500 和「真的 0 条」如果渲染成同一句「暂无数据」，看板上就是在骗人。

- **失败**：传 `:error`（`Error` / 响应对象 / 现成中文文案），红色警示章 + 具体原因 + 「重新加载」按钮（触发 `retry`）。失败态里不会出现任何「暂无 / 没有」的安慰话。
- **未查询**：传 `awaiting-scope` + `awaiting-scope-message`，虚线待办章 + 一句话说清还要选什么。
- **空**：既没失败也已查过，才用 `empty-message`。

优先级：`error` > `loading` > `awaitingScope` > 有数据 > 空。`error` 与 `loading` 同时为真表示正在重试，仍停在失败态，只把按钮切成「重试中…」。

<Demo block>
  <NvDataTable
    :columns="columns"
    :rows="[]"
    row-key="code"
    title="记录列表"
    :searchable="false"
    :column-settings="false"
    :error="'网关返回 502，未能读取记录列表。'"
    empty-message="暂无记录"
    @retry="nvMessage.info('正在重试…')"
  />
</Demo>

<Demo block>
  <NvDataTable
    :columns="columns"
    :rows="[]"
    row-key="code"
    title="记录列表"
    :searchable="false"
    :column-settings="false"
    awaiting-scope
    awaiting-scope-message="请先选择项目与资源节点。"
    empty-message="暂无记录"
  />
</Demo>

```vue
<NvDataTable
  :columns="columns"
  :rows="rows"
  row-key="code"
  :loading="pending"
  :error="error"
  :awaiting-scope="!hasSkuSelection"
  awaiting-scope-message="请先选择条目后查询批次。"
  empty-message="该条目在当前项目没有批次记录。"
  @retry="refetch"
/>
```

自定义呈现走 `#error` / `#awaiting` / `#empty` 插槽；`#error` 提供 `{ message, error }` 作用域参数。错误面板是 `role="alert"` 活动区域，进入错误态时读屏会播报失败原因（`#error` 插槽内容同样被包住）；调用点不需要再自己加 `role="alert"`。

`NvDataTableToolbar` 独立承担工具栏职责：

<Demo block>
  <NvDataTableToolbar
    v-model:search="tbSearch"
    v-model:tab="tbTab"
    v-model:density="tbDensity"
    title="记录列表"
    :count="48"
    :tabs="tbTabs"
    searchable
    search-placeholder="搜索记录…"
    show-density
    refreshable
    show-more
    @refresh="nvMessage.info('正在刷新…')"
    @export="nvMessage.success('已导出 CSV')"
    @print="nvMessage.info('已选择打印当前记录列表')"
  >
    <template #filters>
      <NvButton variant="outline" size="sm" @click="nvMessage.info('已选择工具栏筛选记录')">
        <template #leading><ListFilterIcon /></template>
        筛选
      </NvButton>
    </template>
    <template #actions>
      <NvButton variant="brand" size="sm" @click="nvMessage.info('已选择工具栏新建记录')">
        <template #leading><PlusIcon /></template>
        新建记录
      </NvButton>
    </template>
  </NvDataTableToolbar>
</Demo>

```vue
<NvDataTableToolbar
  v-model:search="search"
  v-model:tab="tab"
  v-model:density="density"
  title="记录列表"
  :count="48"
  :tabs="tabs"
  searchable
  show-density
  refreshable
  show-more
  @print="nvMessage.info('已选择打印当前记录列表')"
/>
```

`NvPagination` 独立分页：

<Demo block>
  <NvPagination
    :page="page"
    :page-size="pageSize"
    :total-items="528"
    show-jump
    @update:page="page = $event"
    @update:page-size="pageSize = $event"
  />
</Demo>

```vue
<NvPagination
  :page="page"
  :page-size="pageSize"
  :total-items="528"
  show-jump
  @update:page="page = $event"
  @update:page-size="pageSize = $event"
/>
```

基础 `Table` 适合直接组织少量记录；下方展示物品、数量和单位三列，表题随当前记录数更新，页脚只合计当前记录。真实数量 0 仍显示为 0；清空后显示独立空行，合计为 0。恢复只影响本页内存，刷新后重新开始。

<Demo block>
  <BaseTableExample />
</Demo>

<<< ../../.vitepress/examples/BaseTableExample.vue

`TableCaption`、`TableFooter` 和 `TableEmpty` 均来自主桶 `@nerv-ui/ui`。空行的 `colspan` 与三列表头使用同一列数组；这与上方 `NvDataTable` 的内建空态是两种组合。数量右对齐，最多三位小数；单位单列弱化显示，不参与数量格式化。

窄屏可先用 Tab 聚焦物品清单的实际滚动容器，再用左右方向键横向查看末列；外层边框不额外加入 Tab 顺序。按钮支持 Tab 聚焦及 Enter/Space 激活。

## API

### NvDataTable

| 属性                   | 说明                                                  | 类型                                  | 默认                       |
| ---------------------- | ----------------------------------------------------- | ------------------------------------- | -------------------------- |
| `columns`              | 列定义（`key` / `header` / `sortable` / `filter` 等） | `NvDataTableColumn[]`                 | —                          |
| `rows`                 | 行数据                                                | `T[]`                                 | —                          |
| `rowKey`               | 行主键字段名或取值函数                                | `string \| (row) => string \| number` | —                          |
| `selectable`           | 行选择 + 批量操作栏                                   | `boolean`                             | `false`                    |
| `refreshable`          | 显示刷新按钮（触发 `refresh`）                        | `boolean`                             | `false`                    |
| `tabs` / `tabKey`      | 快捷筛选分段标签及其作用列                            | `{ label, value }[]` / `string`       | —                          |
| `pageSize`             | 初始每页条数                                          | `number`                              | —                          |
| `selected`             | 选中行主键（`v-model:selected`）                      | `(string \| number)[]`                | —                          |
| `loading`              | 加载骨架                                              | `boolean`                             | `false`                    |
| `error`                | 非空即进入失败态（`Error` / 对象 / 文案）             | `unknown`                             | —                          |
| `errorMessage`         | 覆盖失败态正文（默认取 `error` 的 `message`）         | `string`                              | —                          |
| `awaitingScope`        | 业务范围未选定 → 未查询态                             | `boolean`                             | `false`                    |
| `awaitingScopeMessage` | 未查询态引导语                                        | `string`                              | `请先在上方选择查询范围。` |
| `emptyMessage`         | 空态文案（仅在已查询且确实 0 条时出现）               | `string`                              | `暂无数据`                 |

事件：`refresh`（工具栏刷新，用户在已有结果上主动要最新数据）与 `retry`（失败后的恢复动作）语义分开，互不触发。

### NvDataTableColumn

| 属性            | 说明                                           | 类型                           | 默认      |
| --------------- | ---------------------------------------------- | ------------------------------ | --------- |
| `key`           | 稳定列键                                       | `string`                       | —         |
| `header`        | 可见列头                                       | `string`                       | —         |
| `headerTitle`   | 可聚焦的列头帮助提示，支持悬停、键盘与触屏触发 | `string`                       | —         |
| `align`         | 对齐方式                                       | `'start' \| 'center' \| 'end'` | `'start'` |
| `sortable`      | 该列可点击排序                                 | `boolean`                      | `false`   |
| `filter`        | 筛选方式：`'text'` 子串匹配 / `'enum'` 多选    | `'text' \| 'enum'`             | —         |
| `width`         | 列宽声明，见下                                 | `string`                       | —         |
| `cellClass`     | 追加到该列表体单元格的类                       | `string`                       | —         |
| `headerClass`   | 追加到该列表头单元格的类                       | `string`                       | —         |
| `hideable`      | 允许在列设置里隐藏；默认 `true`                | `boolean`                      | `true`    |
| `defaultHidden` | 初始隐藏（`hideable` 为 false 时不再可切换）   | `boolean`                      | `false`   |
| `accessor`      | 取值函数，默认取 `row[key]`                    | `(row: T) => unknown`          | —         |

`headerTitle` 是桌面端的轻量补充提示，不应承载完成操作所必需的信息。组件会为该列渲染可聚焦帮助触发器；核心列名和状态仍必须脱离提示独立可读。

表格使用 `table-layout: fixed` 排布，**列宽声明即渲染宽度**：表格不会被列内容撑开，也不会把列挤窄到装不下内容。这条契约对两种写法一致成立：

| 写法            | 例                  | 落地方式                 |
| --------------- | ------------------- | ------------------------ |
| Tailwind 宽度类 | `w-48`、`w-[22rem]` | class 交给 Tailwind 解析 |
| CSS 尺寸        | `192px`、`12rem`    | inline `width`           |

未声明 `width` 的列均分剩余空间。三条注意：

- 声明宽在**有余量**时会被等比放大到填满容器（不会缩窄）。要「就这么多」请配合同行的其它列宽一起看，而不是指望某一列不被放大。
- 声明宽的列**不会**被内容撑大；内容放不下时在格内截断（如 `truncate` + tooltip）。
- **`min-w-*` 不是列宽声明**。`fixed` 布局只按 `width` 定列宽，`min-width` 不参与计算，「至少这么宽」请写等价的 `w-[22rem]`。

### NvPagination

| 属性         | 说明                            | 类型      | 默认    |
| ------------ | ------------------------------- | --------- | ------- |
| `page`       | 当前页（`v-model:page`）        | `number`  | —       |
| `pageSize`   | 每页条数（`v-model:page-size`） | `number`  | —       |
| `totalItems` | 总条数                          | `number`  | —       |
| `showJump`   | 显示跳页输入                    | `boolean` | `false` |

列表页的页头、工具栏、行菜单与统计分区组合见[列表布局与行操作](./list-blocks.md)。
