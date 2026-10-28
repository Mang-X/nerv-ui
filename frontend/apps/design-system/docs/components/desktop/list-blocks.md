---
title: 列表布局与行操作
---

<script setup>
import ListBlocksExample from '../../.vitepress/examples/ListBlocksExample.vue'
</script>

# 列表布局与行操作

页头、工具栏、统计卡和行菜单可组合成一个清晰的列表页。所有操作仅产生本页回执，不请求后端。

<Demo>
  <ListBlocksExample />
</Demo>

## 组合方式

- `NvPageHeader` 接受 `title`、`breadcrumbs`、`count`，操作放在 `actions` 插槽。它没有描述属性；页面说明由宿主紧随页头提供。
- `NvToolbar` 的搜索由 `v-model:search` 受控，默认 `showSearch=true`，默认搜索标签和占位均为“搜索”。`filters` 放辅助筛选，`actions` 放操作；两区允许换行。它与 [DataTableToolbar](./data-table.md) 是不同组件。
- `NvRowActions` 默认 `disabled=false`、`label="更多操作"`、`align="end"`；默认插槽承载公开菜单项。每行使用稳定 `id` 作为 key，`select` 时再按 id 查找当前记录。试试倒序与更换清单，回执始终对应当前物品。
- `NvSectionCard` 通过 `description` 和 `value` 显示统计，可选 `trend`、`footnote`、`hint`；默认插槽替换页脚。本例用页脚按钮打开安全说明。它不同于通用 [Card](./card.md)，不提供标题或出口事件。
- `NvSectionCards` 默认 `columns=4`，支持 2/3/4 最大列数；小屏单列，sm 两列，lg 才出现三或四列。选择列数不会强制窄屏多列。

搜索只改变可见列表；统计仍表示完整清单。`0` 是真实数量，`—` 表示尚未核实。数量最多三位小数、右对齐，单位与编号分别呈现。页头沿用组件的面包屑标题，正文使用页面标题字体。

完整宿主源码见仓库 `frontend/apps/design-system/docs/.vitepress/examples/ListBlocksExample.vue`。需要完整导航外壳时参见[应用外壳](./dashboard.md)，需要排序分页表格时参见[数据表格](./data-table.md)。本页不替代这些既有示例。
