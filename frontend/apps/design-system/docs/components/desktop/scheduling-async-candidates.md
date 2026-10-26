---
title: 异步候选与停机影响
---

# 异步候选与停机影响

`@nerv-iip/scheduling` 主桶提供 `SchedulingCandidatePanel`、`SchedulingRushInsertionResult`、`SchedulingInsertionPreview` 和 `SchedulingDowntimeBanner`。它们只显示 host 的候选、任务、历史分页与停机事实；请求、轮询、取消、ETR 判定和保存均由 host 管理。

```vue
<script setup lang="ts">
import { SchedulingRushInsertionResult, type SchedulingAsyncJob } from '@nerv-iip/scheduling'
const job: SchedulingAsyncJob = {
  id: 'job-1',
  contextKey: 'reading',
  requestKey: 'request-1',
  status: 'created',
  input: { baselineId: 'saved-1', targetKey: 'reading-morning', targetLabel: '晨间共读' },
}
function stop(jobId: string, requestKey: string) {
  // 宿主取消传输并回写 status: 'stopped'；旧请求晚回仍需身份核对。
  void [jobId, requestKey]
}
</script>

<template>
  <SchedulingRushInsertionResult :job="job" @stop="stop" />
</template>
```

| 组件                            | 核心输入                                                                                                                   | 动作事件                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `SchedulingCandidatePanel`      | `candidates`、`contextKey`、`baselineId`、`jobId?`、`requestKey?`、`baseline?`、`pending?`、`readOnly?`、`disabledReason?` | `preview(contextKey, baselineId)`、`select(jobId, candidateId)`                     |
| `SchedulingRushInsertionResult` | `job?`、`failureMessage?`、`saving?`、`selected?`、`readOnly?`                                                             | `retry(jobId, requestKey)`、`stop(jobId, requestKey)`、`select(jobId, candidateId)` |
| `SchedulingInsertionPreview`    | `plans?`、`pageIndex`、`pageSize`、`total?`、`selectedPlanId?`、`job?`、`contextKey`、`targetKey`、`targetLabel`           | `page(index)`、`choose(planId)`、`start(request)`、`stop`、`retry`                  |
| `SchedulingDowntimeBanner`      | `items?`、带时区的 `now`、`contextKey`、`pending?`、`readOnly?`                                                            | `preview(contextKey)`                                                               |

结果的 `jobId/contextKey/requestKey` 必须匹配当前 job；停机 `phase` 必须由宿主明确提供。未知数值不补 0，选定与保存需宿主确认。完整类型、旧来源迁移和中性两域深链见[排程异步合同](../../../../../../docs/scheduling-async-candidates.md)。文档站完整运行仍由 #10 验证。
