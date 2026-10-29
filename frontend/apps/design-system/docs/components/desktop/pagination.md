---
title: Pagination 基础分页
---

<script setup>
import PaginationExample from '../../.vitepress/examples/PaginationExample.vue'
</script>

# Pagination 基础分页

本页用 29 条本地阅读片段展示受控分页，每页 3 条；首、前、页码、后、末会一起更新当前结果和反馈。数量 0 是真实值。无后端请求，刷新后回到第一页。

<Demo>
  <PaginationExample />
</Demo>

## 组合与合同

九件均从 `@nerv-iip/ui` 主桶导入。`Pagination` 接受 `v-model:page`、`total`、`itemsPerPage`、`siblingCount` 和 `showEdges`；`PaginationContent` 的 `items` 插槽给出页码及省略号，分别交给 `PaginationItem` 和 `PaginationEllipsis`。`PaginationFirst`、`PaginationPrevious`、`PaginationNext`、`PaginationLast` 按当前页自动禁用首尾操作。

`PaginationItem` 默认是 Reka 按钮，以 `value` 更新受控页码，选中时输出 `aria-current="page"`；`isActive` 控制其样式。`PaginationLink` 是普通 `a`，接受 `href` 和 `isActive`，后者同时输出 `aria-current="page"`。本页第二段只链接到上方结果和当前章节，第二项标记当前章节；不会更新结果页，不把链接放进按钮中。

总量是条目数。当前 Reka producer 按 `max(1, ceil(total / (itemsPerPage || 1)))` 计算页数，因此 `total=0` 仍为一页；空结果文案和页码重置由宿主负责。本例固定非空总量，不演绎未知总量合同，也不改变现有 NvPagination。

按钮可用 Tab 聚焦、Enter/Space 激活，链接用 Enter 定位；分页控制在窄屏换行，无额外滚动焦点。真实浏览器键盘和亮暗窄屏验证由独立验收席执行。

## 学习代码

下方直接包含上方 live 的源码：

<<< @/.vitepress/examples/PaginationExample.vue
