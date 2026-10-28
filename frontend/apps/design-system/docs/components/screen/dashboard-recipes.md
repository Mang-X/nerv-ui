---
title: 大屏分栏组合
---

<script setup>
import Demo from '../../../../playground/src/screen/ScreenDashboardDemo.vue'
</script>

# 大屏分栏组合

<!--@include: ../../../../../DESIGN/components/screen-dashboard-recipes.md-->

<ScreenDemo><Demo /></ScreenDemo>

live 示例源码复用 playground 宿主，无网络依赖；本轮文档站运行 UNRUN。

## 宿主合同

`ScreenDashboardRecipe` 是示例局部组合，不是新增公共组件。`input: DashboardInput`、`page: number`、`view: 'chart' | 'detail'` 和 `now: number` 为受控输入；`page(number)`、`view(mode)`、`entry(label)` 仅请求。来源入口没有业务导航副作用，示例显示已选入口。行用稳定 `id`，同 key 替换、删除与缩总数均直接读取当前 rows。页面每页两条，范围由同一总数计算。

`DashboardInput` 定义在 [宿主源码](../../../../playground/src/screen/dashboardInput.ts)。primary 的 null 显示未确认；空 rows 显示暂无安排。error 独立显示并保留旧数据；updatedAt 为 null 表示尚未更新，now − updatedAt 超过 60 秒为过期。示例用显式内存时钟；真实接入由宿主提供时间戳和时钟。

更新回调只属于示例宿主；每次请求、来源切换和卸载递增身份。成功只接纳当前身份且同来源的结果；失败保留数据。无 poll、SDK、认证、fetch 或领域算法。Trend 的 actual/threshold/layers 和 Pareto 排序占比为已准备输入。
