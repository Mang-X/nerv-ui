---
title: Pad / 大触控组件
---

# Pad / 大触控组件

`@nerv-ui/ui` 的 `touch/` 层 —— Pad 与大屏触控看板的**大触控**控件。为"戴手套、远一点、少点几下完成提交"而设计：触控目标 **56–72px**（远大于 PC 的 36–40px 与移动的 44px），动作语义强、按压反馈明显、操作路径最短。

与桌面共享同一套语义令牌（`--nv-*`）与亮暗两态，但尺寸、间距、字号全部按大触控放大。**不要**把大触控件直接用到手机（会"肿大"），也不要把 PC 紧凑件塞进 Pad（点不准）。

- **操作**：[NvTouchButton 触控按钮](/components/touch/touch-button)、[NvTouchSegmented 分段切换](/components/touch/touch-segmented)、[NvQtyStepper 数量步进](/components/touch/qty-stepper)
- **信息**：[NvStatTile 指标块](/components/touch/stat-tile)、[NvStationBar 区域栏](/components/touch/station-bar)
- **复用 PC 件**：Pad 布局大量复用桌面 `@nerv-ui/ui` 的 [NvCard](/components/desktop/card)、[图表](/components/desktop/chart)、`Progress` 等——它们在远距离下依旧可读，只需放大字号与间距。

> 想看这些组件如何组成一整块 Pad 看板？查看 [Pad 看板完整示例](/components/board)（提交、节奏、队列的沉浸式实时演示）。
