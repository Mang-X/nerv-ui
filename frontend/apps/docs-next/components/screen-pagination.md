---
title: NvScreenPagination 大屏分页
---

<script setup>
import { ref } from 'vue'
import { NvScreenPagination } from '@nerv-ui/screen'
import '@nerv-ui/screen/styles.css'

const page = ref(3)
</script>

# NvScreenPagination 大屏分页

深色舞台上的分页条，带条数区间读数，支持首尾页按钮与省略号折叠。

## 示例

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenPagination v-model:page="page" :total="240" :page-size="20" show-edges />
    <span style="font-size: 13px; opacity: 0.7">当前页：<span v-text="page"></span></span>
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenPagination :page-count="12" :siblings="2" :boundaries="0" size="lg" />
    <NvScreenPagination :total="0" :page-size="20" show-edges hide-summary />
  </div>
</Demo>

## API

### NvScreenPagination 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `page` | 受控当前页，从 1 开始（`v-model:page`） | `number` | — |
| `defaultPage` | 非受控初始页 | `number` | — |
| `pageCount` | 总页数；也可改用 `total` 与 `pageSize` | `number` | — |
| `total` | 总条数 | `number` | — |
| `pageSize` | 每页条数，用于计算页数与区间读数 | `number` | `10` |
| `siblings` | 当前页两侧各显示的页数 | `number` | `1` |
| `boundaries` | 首尾各固定显示的页数 | `number` | `1` |
| `label` | 分页的无障碍名称 | `string` | `分页` |
| `prevLabel` | 上一页按钮的无障碍标签 | `string` | `上一页` |
| `nextLabel` | 下一页按钮的无障碍标签 | `string` | `下一页` |
| `firstLabel` | 第一页按钮的无障碍标签 | `string` | `第一页` |
| `lastLabel` | 最后一页按钮的无障碍标签 | `string` | `最后一页` |
| `showEdges` | 显示首尾页跳转按钮 | `boolean` | `false` |
| `size` | 尺寸 | `md \| lg` | `md` |
| `hideSummary` | 隐藏“共 N 条 · 区间”读数 | `boolean` | `false` |

### NvScreenPagination 事件

| 事件 | 说明 |
| --- | --- |
| `update:page` | 当前页变化，参数为 `number` |
