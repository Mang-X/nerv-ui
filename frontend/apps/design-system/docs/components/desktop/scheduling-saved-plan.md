---
title: 已保存计划只读组合
---

# 已保存计划只读组合

<!--@include: ../../../../../DESIGN/components/scheduling-saved-plan.md-->

实时源码演示：[书房](/#schedule-saved/library)、[创作室](/#schedule-saved/studio)（playground 中访问同名 hash）。三件组件的完整 props、events、slot、默认值和导航示例见[公共合同](../../../../../../docs/scheduling-saved-plan.md)。源码消费者覆盖两维度、搜索、选中、收展、异步分组及有/无链接；真实引擎、键盘和宽窄容器验收单独执行。

<script setup>
import SavedPlanExample from '../../.vitepress/examples/SavedPlanExample.vue'
import { ref } from 'vue'
import { SchedulingSavedPlan } from '@nerv-iip/scheduling'
const readState = ref('ready')
</script>

<ClientOnly>
<div class="vp-raw">
  <select v-model="readState" aria-label="计划读取状态">
    <option v-for="[key, label] in [['ready', '等待选择'], ['loading', '读取中'], ['forbidden', '无权读取'], ['unavailable', '暂不可读']]" :key="key" :value="key">{{ label }}</option>
  </select>
  <SchedulingSavedPlan plan-id="reading" group-by="room" :state="readState" />
</div>
</ClientOnly>

## 站内操作

本页使用内存安排和回执，未连接业务服务。可在当前站内操作，并前往[工作台](./scheduling-workbench)、[已保存计划](./scheduling-saved-plan)与[日安排](./scheduling-day-print)。兼容别名与公开组件共用此示例。

<ClientOnly><div class="vp-raw"><SavedPlanExample venue="library" /></div></ClientOnly>
