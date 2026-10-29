---
title: NvApp 与 NvAppHeader 应用外壳
---

<script setup>
import { NvAppHeader, NvButton } from '@nerv-iip/ui'
import AppProviderExample from '../../.vitepress/examples/AppProviderExample.vue'
import { BellIcon, SearchIcon } from '@lucide/vue'
import { ref } from 'vue'

const headerReceipt = ref('')
let headerActionCount = 0
function onHeaderAction(action) {
  headerReceipt.value = `已选择${action}（第 ${++headerActionCount} 次）`
}
</script>

# NvApp 与 NvAppHeader 应用外壳

`NvApp` 是根级提供者（参考 Nuxt UI 的 `NvApp`）：它挂载全局 reka `ConfigProvider`、统一的 `TooltipProvider` 与 Toast 出口，并设定基底表面。`NvAppHeader` 是顶部应用栏。

## NvApp 根容器

给整个应用包一层 `NvApp`，统一提供提示上下文与通知出口。当前公开属性只有 `tooltipDelay`、`class` 和默认插槽；没有 `dir` 或滚动锁配置属性。

```vue
<script setup>
import { NvApp } from '@nerv-iip/ui'
</script>

<template>
  <NvApp>
    <NvAppHeader>…</NvAppHeader>
    <main>…</main>
  </NvApp>
</template>
```

| 属性           | 说明                     | 类型     | 默认  |
| -------------- | ------------------------ | -------- | ----- |
| `tooltipDelay` | 全局提示打开延迟（毫秒） | `number` | `200` |

## Header 顶部栏

`#leading` 放置品牌或菜单按钮，默认插槽放置标题或居中导航，`#trailing` 放置操作项。默认采用吸顶与玻璃质感。

<Demo>
  <NvAppHeader :sticky="false" class="w-full rounded-xl border border-border">
    <template #leading>
      <div class="flex size-7 items-center justify-center rounded-md bg-brand text-sm font-bold text-brand-foreground">N</div>
      <span class="text-sm font-semibold">Nerv-IIP</span>
    </template>
    <nav class="ms-2 hidden items-center gap-1 text-sm sm:flex">
      <a class="rounded-md px-2 py-1 font-medium text-brand-strong">控制台</a>
      <a class="rounded-md px-2 py-1 text-muted-foreground">工单</a>
      <a class="rounded-md px-2 py-1 text-muted-foreground">设备</a>
    </nav>
    <template #trailing>
      <NvButton variant="ghost" size="icon" aria-label="搜索" @click="onHeaderAction('搜索')"><SearchIcon class="size-4" /></NvButton>
      <NvButton variant="ghost" size="icon" aria-label="通知" @click="onHeaderAction('通知')"><BellIcon class="size-4" /></NvButton>
      <NvButton variant="brand" size="sm" @click="onHeaderAction('新建工单')">新建工单</NvButton>
    </template>
  </NvAppHeader>
  <p v-if="headerReceipt" role="status">{{ headerReceipt }}</p>
</Demo>

点击顶部操作后，本例显示当前选择及次数；不会创建工单或调用搜索、通知服务。

```vue
<script setup>
import { NvAppHeader, NvButton } from '@nerv-iip/ui'
import { ref } from 'vue'
const headerReceipt = ref('')
let headerActionCount = 0
function onHeaderAction(action) {
  headerReceipt.value = `已选择${action}（第 ${++headerActionCount} 次）`
}
</script>

<template>
  <NvAppHeader>
    <template #leading>Nerv-IIP</template>
    <nav><!-- 居中导航 --></nav>
    <template #trailing>
      <NvButton @click="onHeaderAction('搜索')">搜索</NvButton>
      <NvButton @click="onHeaderAction('通知')">通知</NvButton>
      <NvButton @click="onHeaderAction('新建工单')">新建工单</NvButton>
    </template>
  </NvAppHeader>
  <p v-if="headerReceipt" role="status">{{ headerReceipt }}</p>
</template>
```

| 属性     | 说明            | 类型      | 默认   |
| -------- | --------------- | --------- | ------ |
| `sticky` | 吸顶 + 玻璃背景 | `boolean` | `true` |

## 提供者：阅读安排

此例只挂载一个 `NvApp`。公开 `Tooltip`、`TooltipTrigger`、`TooltipContent` 消费它的提示上下文；悬停使用所选延迟，键盘聚焦可直接查看提示。提示的连续访问可能使用提供者的跳过延迟行为。

<Demo>
  <AppProviderExample />
</Demo>

默认延迟为 200 毫秒，选择 800 毫秒演示显式设置。`class="min-h-0"` 仅约束文档内示例高度，实际应用通常保留默认的全屏最小高度。
点击“确认阅读安排”会显示普通通知和本页回执，不会保存数据。通知自带关闭按钮，也可点击“关闭本页通知”；重复确认复用本例通知 ID，离页时仅清理该 ID。文档主题没有全局 Toaster，本例使用 `NvApp` 自带出口，勿再为它叠加一个 Toaster。

### 学习代码

以下为上方运行示例的完整源码，只通过公共主入口消费组件：

<<< @/.vitepress/examples/AppProviderExample.vue
