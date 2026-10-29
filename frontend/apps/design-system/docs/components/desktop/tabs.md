---
title: NvTabs 标签页
---

<script setup>
import BaseTabsExample from '../../.vitepress/examples/BaseTabsExample.vue'
import {
  NvTabs,
  NvTabsList,
  NvTabsTrigger,
  NvTabsContent,
  Progress,
} from '@nerv-iip/ui'
</script>

# NvTabs 标签页

在同一区域内切换平级视图。`NvTabs` 家族由 `NvTabs`（根）、`NvTabsList`、`NvTabsTrigger`、`NvTabsContent` 组成，触发器与列表为复制重建样式，根与内容复用底层原语。

## 基础

<Demo>
  <div class="w-96">
    <NvTabs default-value="overview">
      <NvTabsList>
        <NvTabsTrigger value="overview">概览</NvTabsTrigger>
        <NvTabsTrigger value="quality">质量</NvTabsTrigger>
        <NvTabsTrigger value="maint">维护</NvTabsTrigger>
      </NvTabsList>
      <NvTabsContent value="overview" class="pt-4">
        <p class="text-sm text-muted-foreground">当班共 12 条产线运行，2 条待料。</p>
        <div class="mt-4 space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span>计划达成</span><span class="tabular-nums text-muted-foreground">68%</span>
          </div>
          <Progress :model-value="68" />
        </div>
      </NvTabsContent>
      <NvTabsContent value="quality" class="pt-4">
        <p class="text-sm text-muted-foreground">在线判定良率 99.2%，无重大不合格。</p>
      </NvTabsContent>
      <NvTabsContent value="maint" class="pt-4">
        <p class="text-sm text-muted-foreground">CNC-07 计划保养窗口：今晚 22:00。</p>
      </NvTabsContent>
    </NvTabs>
  </div>
</Demo>

```vue
<NvTabs default-value="overview">
  <NvTabsList>
    <NvTabsTrigger value="overview">概览</NvTabsTrigger>
    <NvTabsTrigger value="quality">质量</NvTabsTrigger>
    <NvTabsTrigger value="maint">维护</NvTabsTrigger>
  </NvTabsList>
  <NvTabsContent value="overview" class="pt-4">…</NvTabsContent>
  <NvTabsContent value="quality" class="pt-4">…</NvTabsContent>
  <NvTabsContent value="maint" class="pt-4">…</NvTabsContent>
</NvTabs>
```

## 属性

| 组件            | 属性            | 说明                       | 类型     |
| --------------- | --------------- | -------------------------- | -------- |
| `NvTabs`        | `default-value` | 默认激活的标签值（非受控） | `string` |
| `NvTabs`        | `model-value`   | 受控当前值（`v-model`）    | `string` |
| `NvTabsTrigger` | `value`         | 该触发器对应的标签值       | `string` |
| `NvTabsContent` | `value`         | 该内容面板对应的标签值     | `string` |


## 基础 Tabs：变体与方向

基础主桶 `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` 与上方 Nv 触发器样式分开展示。切换外观或方向保留当前地点；露台不可选，所有选择只在本页内存中。

<Demo>
  <BaseTabsExample />
</Demo>

::: details 查看同源源码
<<< ../../.vitepress/examples/BaseTabsExample.vue
:::

`TabsList` 的 `variant` 支持 `default`（默认背景）与 `line`（线条指示）；`Tabs` 的 `orientation` 支持 `horizontal` 与 `vertical`。`v-model` 关联当前 trigger 的 `value` 与对应 panel。

默认自动激活：Tab 进入标签组；横向使用左右键、纵向使用上下键移动焦点并激活，Home/End 到首尾，默认循环且跳过禁用项。Enter/Space 也可激活当前可用 trigger。方向键行为由当前 Reka producer 提供；真实键盘、线条位置、横竖对齐与窄屏亮暗阅读需独立浏览器验收。
