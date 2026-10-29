---
title: Empty 空状态
---

<script setup>
import EmptyExample from '../../.vitepress/examples/EmptyExample.vue'
</script>

# Empty 空状态

用于内容为空时说明当前状态并提供下一步操作。清空本页安排后可切换文字或图标图示，恢复按钮会重新显示内容并更新下方反馈。全部状态仅在本页内存中保留，刷新后重新开始。

<Demo>
  <EmptyExample />
</Demo>

## 结构与图示

六件均从 `@nerv-iip/ui` 主桶导入，接受默认插槽与 `class`。`Empty` 是外层容器；`EmptyHeader` 组织媒体、标题和描述；`EmptyContent` 放置恢复操作。`EmptyTitle` 输出 div，需要页面标题层级时由宿主另行提供。

`EmptyMedia` 现有 `default` variant 使用透明背景，适合文字等自定义内容；`icon` variant 提供紧凑图标容器。本例的图标仅作装饰，状态含义由可读标题与描述表达。两种图示共用同一恢复操作，不改变内容状态。原生按钮和选择框可通过 Tab 聚焦，按 Enter/Space 激活按钮，方向键更改选项。

## 学习代码

下方直接包含上方 live 的源码：

<<< @/.vitepress/examples/EmptyExample.vue

移动端使用独立组件，见[移动空状态](../mobile/empty.md)。
