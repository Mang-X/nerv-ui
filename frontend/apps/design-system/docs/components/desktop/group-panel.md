---
title: NvGroupPanel 可折叠分组面板
---

<script setup>
import { NvGroupPanel, NvStatusBadge } from '@nerv-iip/ui'
</script>

# NvGroupPanel 可折叠分组面板

`blocks/` 层的**分组容器**：把一张长列表按业务父级（记录 / 客户 / 资源 / 批次…）
切成若干组，每组一个常驻标题行 + 可折叠内容区。

**什么时候用它**：列表平铺之后读不出归属关系——比如任务看板把几百个步骤平铺，
同一张记录的四个步骤散落在不同页，负责人看不出接续关系。分组之后，
记录是主语，步骤是它的行。

**什么时候不用**：分组只有一两组，或者用户的主要动作是跨组横向比对
（按资源看负荷、按人看安排）。那种场景平铺表 + 排序更快。
任务看板的做法是**两种视图都给，让用户自己切**。

## 用法

<div class="grid gap-3">
  <NvGroupPanel
    title="REC-2026-0431"
    subtitle="示例条目 · 区域 A"
    count="4 个步骤 · 2 个待指派"
    collapsed-summary="4 个步骤 · 2 个待指派"
  >
    <div class="grid divide-y">
      <div class="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
        <span>第 10 步 · 数据准备</span>
        <NvStatusBadge label="已完成" tone="success" />
      </div>
      <div class="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
        <span>第 20 步 · 内容处理</span>
        <NvStatusBadge label="进行中" tone="info" />
      </div>
      <div class="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
        <span>第 30 步 · 结果汇总</span>
        <NvStatusBadge label="待指派" tone="warning" />
      </div>
    </div>
  </NvGroupPanel>
</div>

```vue
<NvGroupPanel
  v-for="group in groups"
  :key="group.key"
  :title="group.recordNo"
  :subtitle="group.owner"
  :count="`${group.rows.length} 个步骤`"
  :collapsed-summary="`${group.pending} 个待指派`"
>
  <template #meta>
    <RouterLink :to="`/records/${group.recordId}`" @click.stop>打开记录</RouterLink>
  </template>
  <NvDataTable
    :columns="columns"
    :rows="group.rows"
    row-key="stepTaskId"
    :pagination="false"
    :searchable="false"
    :column-settings="false"
    density="compact"
    class="rounded-none border-0"
  />
</NvGroupPanel>
```

## API

| Prop               | 类型               | 默认    | 说明                                                 |
| ------------------ | ------------------ | ------- | ---------------------------------------------------- |
| `title`            | `string`           | —       | 分组标题，通常是父级记录的人读编号。必填。           |
| `subtitle`         | `string`           | —       | 标题下一行的辅助信息（条目 / 负责人 / 截止日期）。   |
| `count`            | `number \| string` | —       | 标题右侧的本组规模，如 `4 个步骤`。                  |
| `collapsedSummary` | `string`           | —       | 折叠时显示的一行摘要，避免收起后完全看不到组内情况。 |
| `muted`            | `boolean`          | `false` | 整组置灰（如该组已全部完成）。                       |
| `open`             | `boolean`          | `true`  | 展开态，支持 `v-model:open`；不绑定时组件自持。      |

| Slot      | 说明                               |
| --------- | ---------------------------------- |
| 默认      | 分组内容（明细表 / 卡片流）。      |
| `meta`    | 标题右侧的徽章或链接，跟着标题走。 |
| `actions` | 组级动作，靠右，独立于折叠按钮。   |

## 约束

- **只管呈现与展开态**，不承担数据获取与分页。分组与排序由调用方算好后逐组渲染。
- 服务端分页时，分组作用于**当前页**的行。组头文案要如实说"本页 N 条"，
  不要写成该父级的全部数量——那是在伪造你没有的数据。
- 组头整行是折叠按钮，`aria-expanded` + `aria-controls` 已接好；
  `#meta` / `#actions` 里的链接与按钮记得 `@click.stop`，否则会连带折叠。
- 内嵌 `NvDataTable` 时用 `class="rounded-none border-0"` + `density="compact"` 消掉双层边框。
