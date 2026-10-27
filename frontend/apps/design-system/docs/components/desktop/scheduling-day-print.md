---
title: 日安排筛选与打印
---

# 日安排筛选与打印

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SchedulingDaySchedule, type SchedulingDayEntry } from '@nerv-iip/scheduling'
const date = ref('2026-11-02')
const groupId = ref('all')
const entries: readonly SchedulingDayEntry[] = [] // 宿主提供展示行
</script>

<template>
  <SchedulingDaySchedule
    :entries="entries"
    :date="date"
    :group-id="groupId"
    timezone="Asia/Shanghai"
    title="日安排"
    @update:date="date = $event"
    @update:group-id="groupId = $event"
  />
</template>
```

| 输入                      | 类型                            | 含义                                                       |
| ------------------------- | ------------------------------- | ---------------------------------------------------------- |
| `entries`                 | `readonly SchedulingDayEntry[]` | 宿主给出的中性只读展示行；显式 semanticKey 与 assignmentId |
| `date`                    | `string`                        | 受控 `YYYY-MM-DD` 日历日                                   |
| `groupId`                 | `string`                        | 受控分组 ID；`all` 表示全部                                |
| `timezone`                | `string`                        | 必需 IANA 时区；空或无效时不猜浏览器时区                   |
| `title`                   | `string`                        | 纸面标题                                                   |
| `planLabel/statusLabel`   | `string/string`                 | 宿主给出的方案和状态显示文案                               |
| `readOnly/readOnlyReason` | `boolean/string`                | 禁止打印及可读理由                                         |

`update:date` 和 `update:groupId` 只发请求；宿主回写后才改变筛选。`SchedulingDaySheet` 是无操作按钮的静态表格，接受 `entries/date/groupLabel/timezone/title` 与可选 `planLabel/statusLabel`。打印只显示该目标、重复表头，并在取消、异常及卸载时清理。完整时间边界、迁移和验收范围见[公共合同](../../../../../../docs/scheduling-day-print.md)。活动示例：`/#schedule-day/library` 与 `/#schedule-day/studio`。
