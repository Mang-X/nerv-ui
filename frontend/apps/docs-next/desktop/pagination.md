---
title: NvPagination 分页
---

<script setup>
import { ref } from 'vue'
import { NvPagination } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const page = ref(1)
const edgePage = ref(5)
const totalPage = ref(2)
const hrefPage = ref(1)
const getHref = (n) => `#/orders?page=${n}`
</script>

# NvPagination 分页

在多页数据之间导航，支持页码窗口、首尾跳转、URL 链接模式与尺寸控制。

## 示例

<Demo block>
  <NvPagination v-model:page="page" :page-count="12" />
  <p style="margin: 10px 0 0">当前第 {{ page }} 页</p>
</Demo>

<Demo block>
  <NvPagination v-model:page="edgePage" :page-count="20" show-edges />
  <p style="margin: 10px 0 0">当前第 {{ edgePage }} 页</p>
</Demo>

<Demo block>
  <NvPagination v-model:page="totalPage"
    :total="248"
    :page-size="20"
    :siblings="2"
    :boundaries="1" />
  <p style="margin: 10px 0 0">共 248 条 / 每页 20 条，当前第 {{ totalPage }} 页</p>
</Demo>

<Demo block>
  <NvPagination
    v-model:page="hrefPage"
    :page-count="8"
    :get-href="getHref"
    label="记录分页" />
  <p style="margin: 10px 0 0">点击页码会跳转到 {{ getHref(hrefPage) }}</p>
</Demo>

<Demo block>
  <NvPagination :default-page="3" :page-count="10" size="sm" />
  <NvPagination :default-page="3" :page-count="10" size="md" />
</Demo>

## 附加控件

<Demo block>
  <NvPagination
    v-model:page="totalPage"
    :total="248"
    :page-size="20"
    show-total
    :size-can-change="[10, 20, 50]"
    show-jumper
  />
  <p style="margin: 10px 0 0">共 248 条 / 每页 20 条，当前第 {{ totalPage }} 页</p>
</Demo>

<Demo block>
  <NvPagination v-model:page="page" :page-count="12" simple />
  <p style="margin: 10px 0 0">精简模式：点中间的「页码 / 总页数」可直接输入跳转</p>
</Demo>

<Demo block>
  <NvPagination :page-count="1" hide-on-single-page />
  <p style="margin: 10px 0 0">只有一页且开启 hideOnSinglePage 时整块隐藏（这里没有分页器）</p>
</Demo>

## API

### NvPagination 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `page` | 受控当前页码（`v-model:page`），从 1 开始 | `number` | — |
| `defaultPage` | 非受控时的初始页码 | `number` | — |
| `pageCount` | 总页数；或改用 `total` + `pageSize` | `number` | — |
| `total` | 总条数，与 `pageSize` 配合计算页数 | `number` | — |
| `pageSize` | 每页条数 | `number` | — |
| `siblings` | 当前页两侧显示的页码数 | `number` | — |
| `boundaries` | 两端始终显示的页码数 | `number` | — |
| `getHref` | URL 构造器；提供后页码变为真实链接 | `(page: number) => string` | — |
| `label` | 导航地标的无障碍名称 | `string` | `分页` |
| `showEdges` | 两端显示首页/末页跳转 | `boolean` | `false` |
| `prevLabel` | 上一页按钮的无障碍名称 | `string` | `上一页` |
| `nextLabel` | 下一页按钮的无障碍名称 | `string` | `下一页` |
| `firstLabel` | 首页按钮的无障碍名称 | `string` | `第一页` |
| `lastLabel` | 末页按钮的无障碍名称 | `string` | `最后一页` |
| `size` | 尺寸 | `sm \| md \| lg` | `md` |
| `disabled` | 禁用整个分页器 | `boolean` | `false` |
| `hideOnSinglePage` | 只有一页时隐藏 | `boolean` | `false` |
| `showTotal` | 显示「共 N 条」；传函数可自定义文案 | `boolean \| (args) => string` | `false` |
| `sizeCanChange` | 显示每页条数选择器；传数组直接指定选项 | `boolean \| number[]` | `false` |
| `sizeOptions` | `sizeCanChange` 为 `true` 时的可选条数 | `number[]` | `[10, 20, 50, 100]` |
| `pageSizeChangeResetPage` | 每页条数变化时重置到第 1 页 | `boolean` | `true` |
| `showJumper` | 显示「跳至」输入框 | `boolean` | `false` |
| `simple` | 精简模式 `‹ 2 / 12 ›` | `boolean` | `false` |
| `simpleJumper` | 精简模式下允许点页码输入跳转 | `boolean` | `true` |

### NvPagination 事件

| 事件 | 说明 |
| --- | --- |
| `update:page` | 当前页变化，参数为 `number` |
| `pageSizeChange` | 每页条数变化，参数为 `(size, page)`；`page` 已按 `pageSizeChangeResetPage` 处理 |

### NvPagination 插槽

无插槽。
