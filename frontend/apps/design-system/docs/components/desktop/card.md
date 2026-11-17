---
title: NvCard 卡片
---

<script setup>
import CardStructureExample from '../../.vitepress/examples/CardStructureExample.vue'
import { NvCard, NvBadge, NvStatusBadge, Separator } from '@nerv-iip/ui'
</script>

# NvCard 卡片

承载分组信息的「表面」原语。`NvCard` 基于 `@nerv-iip/ui` 稳定导出的卡片基础能力复制重建——发丝级描边 + 顶部内嵌高光读作单一清晰表面。它本身不含内边距与排版，内容由调用方组织（通常 `p-6` 头部 + 内容，放进 `grid`）；`interactive` 为可点击卡片叠加克制的悬浮上浮。

## 本页记录详情

下方“可交互”卡片通过原生链接定位到对应详情；以下内容为固定只读样例。

<section id="card-order-0426" class="scroll-mt-20" aria-labelledby="card-order-0426-title">
  <h3 id="card-order-0426-title">示例项 V3 记录详情</h3>
  <p>记录 <strong>REC-2406-0426</strong>，名称 <strong>示例项 V3</strong>，当前状态：进行中。这里展示本页固定样例，不执行记录变更。</p>
</section>

<section id="card-order-0430" class="scroll-mt-20" aria-labelledby="card-order-0430-title">
  <h3 id="card-order-0430-title">示例项 M 记录详情</h3>
  <p>记录 <strong>REC-2406-0430</strong>，名称 <strong>示例项 M</strong>，当前状态：已完成；数量 <strong>5000 条</strong>，达标率 <strong>99.2%</strong>。这里展示本页固定样例，不执行记录变更。</p>
</section>

## 基础

惯用结构：头部（标题 + 副标题 + 可选状态）紧凑置顶，内容在下，放进栅格自适应。

<Demo>
  <div class="grid w-full gap-4 sm:grid-cols-2">
    <NvCard class="p-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-foreground">示例项 A2</div>
          <div class="mt-0.5 font-mono text-xs text-muted-foreground">REC-2406-0413 · RES-07</div>
        </div>
        <NvStatusBadge value="running" pulse />
      </div>
      <div class="mt-4 text-sm text-muted-foreground">计划 480 条 · 已完成 312 条 · 每条约 42s。</div>
    </NvCard>
    <NvCard class="p-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-foreground">示例项 C</div>
          <div class="mt-0.5 font-mono text-xs text-muted-foreground">REC-2406-0421 · RES-03</div>
        </div>
        <NvBadge variant="warning">待启动</NvBadge>
      </div>
      <div class="mt-4 text-sm text-muted-foreground">计划 320 条 · 安排 14:30 启动。</div>
    </NvCard>
  </div>
</Demo>

```vue
<NvCard class="p-5">
  <div class="flex items-start justify-between gap-3">
    <div>
      <div class="text-sm font-semibold">示例项 A2</div>
      <div class="mt-0.5 font-mono text-xs text-muted-foreground">REC-2406-0413 · RES-07</div>
    </div>
    <NvStatusBadge value="running" pulse />
  </div>
  <div class="mt-4 text-sm text-muted-foreground">计划 480 条 · 已完成 312 条。</div>
</NvCard>
```

## 可交互

`interactive` 只提供悬停上浮外观；导航由宿主使用原生链接接纳。本例点击卡片或聚焦后按 Enter，跳至本页对应记录的只读详情，不连接业务服务。

<Demo>
  <div class="grid w-full gap-4 sm:grid-cols-2">
    <a href="#card-order-0426" class="block rounded-xl text-inherit no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
      <NvCard interactive class="h-full p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-sm font-semibold text-foreground">示例项 V3</div>
            <div class="mt-0.5 font-mono text-xs text-muted-foreground">REC-2406-0426</div>
          </div>
          <NvBadge variant="brand">进行中</NvBadge>
        </div>
        <div class="mt-4 text-sm text-muted-foreground">查看本页记录详情 →</div>
      </NvCard>
    </a>
    <a href="#card-order-0430" class="block rounded-xl text-inherit no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
      <NvCard interactive class="h-full p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-sm font-semibold text-foreground">示例项 M</div>
            <div class="mt-0.5 font-mono text-xs text-muted-foreground">REC-2406-0430</div>
          </div>
          <NvBadge variant="success">已完成</NvBadge>
        </div>
        <div class="mt-4 text-sm text-muted-foreground">5000 条 · 达标率 99.2%。查看本页记录详情 →</div>
      </NvCard>
    </a>
  </div>
</Demo>

学习代码中，链接与对应详情目标由宿主一起提供；`NvCard` 本身不处理导航：

```vue
<a
  href="#order-detail"
  class="block rounded-xl text-inherit no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
>
  <NvCard interactive class="p-5">
    <div class="text-sm font-semibold">示例项 V3 · REC-2406-0426</div>
    <div class="text-sm text-muted-foreground">查看本页记录详情 →</div>
  </NvCard>
</a>
<section id="order-detail" class="scroll-mt-20">
  <h3>示例项 V3 记录详情</h3>
  <p>记录 REC-2406-0426，名称示例项 V3，当前状态：进行中。</p>
</section>
```

## 插槽组合

卡片是空容器，默认插槽里可自由组织头部 / 分隔 / 底部等结构（搭配 `Separator`）。

<Demo>
  <NvCard class="w-full max-w-sm overflow-hidden">
    <div class="flex items-center justify-between p-5">
      <div>
        <div class="text-sm font-semibold text-foreground">审核放行</div>
        <div class="mt-0.5 font-mono text-xs text-muted-foreground">REC-2406-0413</div>
      </div>
      <NvStatusBadge value="running" pulse />
    </div>
    <Separator />
    <div class="flex items-center justify-between p-5 text-sm">
      <span class="text-muted-foreground">初审结论</span>
      <span class="font-medium text-foreground">通过 · 可批量</span>
    </div>
  </NvCard>
</Demo>

```vue
<NvCard class="overflow-hidden">
  <div class="p-5"><!-- 头部 --></div>
  <Separator />
  <div class="p-5"><!-- 底部 --></div>
</NvCard>
```

## 属性

| 属性          | 说明                                       | 类型      | 默认    |
| ------------- | ------------------------------------------ | --------- | ------- |
| `interactive` | 开启悬停上浮，用于可点击卡片               | `boolean` | `false` |
| `class`       | 透传类名（内边距、宽度、栅格由调用方控制） | `string`  | —       |

> 需要带固定标题/底部结构的卡片可用 blocks 里的 `NvSectionCard`；指标卡用 `NvMetricCard`。

列表页的页头、工具栏、行菜单与统计分区组合见[列表布局与行操作](./list-blocks.md)。

## 公开结构子件

下面使用五个公开结构子件组织头部与底部，内容仍使用已有 `NvCardContent`。五件均接受 `class` 与默认插槽，没有标题属性或具名插槽；`NvCardTitle` 输出 div，不自动建立 heading 层级。`NvCard` 默认 `interactive=false`，已有纵向间距；头部按钮显示参与提示，底部按钮确认本页状态，不连接后端，刷新后不保留。标题、描述与正文完整换行，底部允许折行。

品牌 `NvCardAction` 与基础 `CardAction` 是不同 producer。当前品牌 Header 的自动布局选择器匹配基础 `card-action` / `card-description`，因此本例通过公开 `class` 显式设置列：窄屏操作位于描述下方，宽屏位于右侧；文字列使用 `minmax(0,1fr)` 完整换行。Action 只是布局 div，按钮提供操作语义，回执只在本页显示。

<Demo>
  <CardStructureExample />
</Demo>

学习代码与上方 live 使用同一组合：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  NvButton,
  NvCard,
  NvCardHeader,
  NvCardAction,
  NvCardTitle,
  NvCardDescription,
  NvCardContent,
  NvCardFooter,
} from '@nerv-iip/ui'

const confirmed = ref(false)
const tipsViewed = ref(false)
</script>

<template>
  <NvCard class="w-full min-w-0 max-w-lg break-words">
    <NvCardHeader class="grid-cols-[minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_auto]">
      <NvCardTitle class="min-w-0">项目 A 协作安排</NvCardTitle>
      <NvCardDescription class="min-w-0">
        邀请成员一起协作、交流与整理共享空间。无论是初次参加，还是带着新的想法再次到来，都可以按自己的节奏参与。
      </NvCardDescription>
      <NvCardAction
        class="col-start-1 row-start-3 row-span-1 justify-self-start sm:col-start-2 sm:row-start-1 sm:row-span-2 sm:justify-self-end"
      >
        <NvButton type="button" variant="outline" size="sm" @click="tipsViewed = true">
          查看参与提示
        </NvButton>
      </NvCardAction>
    </NvCardHeader>
    <NvCardContent class="space-y-2 text-sm">
      <p>请带上一份愿意分享的条目，也可以空手前来，听听大家最近的想法。</p>
      <p>交流结束后，我们会一起整理清单，将想继续讨论的话题留给下一次相聚。</p>
      <p role="status" class="text-muted-foreground">
        {{
          tipsViewed
            ? '参与提示：按自己的节奏参与即可；仅在本页显示，刷新后不保留。'
            : '尚未查看参与提示'
        }}
      </p>
    </NvCardContent>
    <NvCardFooter class="flex-wrap gap-3">
      <NvButton type="button" variant="outline" @click="confirmed = true">确认阅读安排</NvButton>
      <p role="status" class="min-w-0 text-sm text-muted-foreground">
        {{ confirmed ? '已在本页确认阅读安排；刷新后不保留。' : '尚未确认' }}
      </p>
    </NvCardFooter>
  </NvCard>
</template>
```
