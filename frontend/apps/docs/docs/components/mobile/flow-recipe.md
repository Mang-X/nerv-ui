---
layout: page
title: 候选与分步执行
---

<script setup>
import Demo from '../../../../playground/src/mobile-flow/MobileFlowDemo.vue'
</script>

# 候选与分步执行

<!--@include: ../../../../../DESIGN/components/mobile-flow-recipe.md-->

<MobileDoc>
<template #phone><Demo /></template>
</MobileDoc>

## 接入与源码

局部 recipe 接受 `input: FlowInput`，发出 `code(string)` 请求；宿主决定编码对应的候选。类型见 [flow.ts](../../../../playground/src/mobile-flow/flow.ts)，live 宿主见 [MobileFlowDemo.vue](../../../../playground/src/mobile-flow/MobileFlowDemo.vue)。`/#mobile-flow` 提供本页内存演示，可清空、只读查看、暂缓确认后重试。无 SDK、认证、fetch、领域算法或生成客户端依赖。文档 live 渲染未执行。
