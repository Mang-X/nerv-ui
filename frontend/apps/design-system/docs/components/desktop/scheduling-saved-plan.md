---
title: 已保存计划只读组合
---

# 已保存计划只读组合

<!--@include: ../../../../../DESIGN/components/scheduling-saved-plan.md-->

实时源码演示：[书房](/#schedule-saved/library)、[创作室](/#schedule-saved/studio)（playground 中访问同名 hash）。三件组件的完整 props、events、slot、默认值和导航示例见[公共合同](../../../../../../docs/scheduling-saved-plan.md)。源码消费者覆盖两维度、搜索、选中、收展、异步分组及有/无链接；真实引擎、键盘和宽窄容器验收单独执行。

<script setup>
import { ref } from 'vue'
import { SchedulingSavedPlan } from '@nerv-iip/scheduling'
const readState = ref('ready')
</script>

<ClientOnly>
<div class="vp-raw">
  <select v-model="readState" aria-label="计划读取状态">
    <option value="ready">等待选择</option><option value="loading">读取中</option>
    <option value="forbidden">无权读取</option><option value="unavailable">暂不可读</option>
  </select>
  <SchedulingSavedPlan plan-id="reading" group-by="room" :state="readState" />
</div>
</ClientOnly>
