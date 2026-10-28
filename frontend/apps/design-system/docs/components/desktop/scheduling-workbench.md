---
title: 工作台组合与中性历史
---

# 工作台组合与中性历史

<!--@include: ../../../../../DESIGN/components/scheduling-workbench.md-->

完整 props/events/slots/defaults 与生命周期见 [公共合同](../../../../../../docs/scheduling-workbench.md)。playground 实时演示：[书房](/#schedule-workbench/library)、[创作室](/#schedule-workbench/studio)，并可往返 P01–P15 既有入口。

<script setup>
import { SchedulingHistory } from '@nerv-iip/scheduling'
const input = {source:'docs',revision:'1',state:'ready',entries:[{key:'reading',label:'晨间共读',status:{key:'saved',label:'已保存',tone:'neutral'},createdAt:'2026-10-29T00:00:00Z',timezone:'Asia/Shanghai',quantity:0}]}
</script>

<ClientOnly><div class="vp-raw"><SchedulingHistory :input="input" /></div></ClientOnly>
