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
  当前第 {{ page }} 页
</Demo>

<Demo block>
  <NvPagination v-model:page="edgePage" :page-count="20" show-edges />
  当前第 {{ edgePage }} 页
</Demo>

<Demo block>
  <NvPagination v-model:page="totalPage"
    :total="248"
    :page-size="20"
    :siblings="2"
    :boundaries="1" />
  共 248 条 / 每页 20 条，当前第 {{ totalPage }} 页
</Demo>

<Demo block>
  <NvPagination
    v-model:page="hrefPage"
    :page-count="8"
    :get-href="getHref"
    label="工单分页" />
  <span style="font-size: 13px; color: var(--vp-c-text-2)">点击页码会跳转到 {{ getHref(hrefPage) }}</span>
</Demo>

<Demo block>
  <NvPagination :default-page="3" :page-count="10" size="sm" />
  <NvPagination :default-page="3" :page-count="10" size="md" />
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
| `size` | 尺寸 | `sm \| md` | `md` |

### NvPagination 事件

| 事件 | 说明 |
| --- | --- |
| `update:page` | 当前页变化，参数为 `number` |

### NvPagination 插槽

无插槽。
