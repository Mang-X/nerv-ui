---
title: NvAlarmTable 告警列表
---

<script setup>
import { NvAlarmTable } from '@nerv-iip/ui'
const rows = [
  { id: 'event-1', time: '14:00', line: '书房', level: 'sev', name: '预约时间变更', wo: 'REF-7', status: '已恢复', tone: 'var(--nv-scr-muted)' },
  { id: 'event-2', time: '14:01', line: '展厅', level: 'gen', name: '活动安排更新', wo: 'REF-7', status: '特别好', tone: 'var(--nv-scr-amber)' },
]
const labels = { time: '时间', line: '空间', level: '优先级', name: '事件', wo: '参考号', status: '记录' }
</script>

# NvAlarmTable 告警列表

自带 `NvScreenPanel` 的六列清单。原名称、六个行字段和默认告警示例保持兼容；宿主通过可选标签与呈现 slot 表达其他领域，组件不查询服务或解释业务规则。

## 中性事件与独立身份

<ScreenDemo wide>
  <NvAlarmTable title="空间事件" more="本地记录" :rows="rows" row-key="id" :labels="labels" :level-labels="{ sev: '优先', gen: '常规' }">
    <template #cell-status="{ row, value }"><span :style="{ color: row.tone }">{{ value }} · {{ row.id }}</span></template>
  </NvAlarmTable>
</ScreenDemo>

```vue
<NvAlarmTable
  title="空间事件"
  more=""
  :rows="events"
  row-key="id"
  :labels="{
    time: '时间',
    line: '空间',
    level: '优先级',
    name: '事件',
    wo: '参考号',
    status: '记录',
  }"
  :level-labels="{ sev: '优先', gen: '常规' }"
>
  <template #cell-status="{ row, value }">
    <span :style="{ color: row.presentationColor }">{{ value }} · {{ row.id }}</span>
  </template>
</NvAlarmTable>
```

宿主须保证 `rowKey` 字段经 `String(key)` 转换后仍唯一且稳定；例如数字 `0` 与字符串 `'0'` 会成为同一 key，不能用于两行。两个事件可以拥有同一 `wo`；独立 `id` 决定行身份，不按参考号合并。`wo` 在新宿主中是兼容适配字段，仍保留原工单号含义供旧消费者使用，未重命名或删除。

## 旧默认兼容

<ScreenDemo wide>
  <NvAlarmTable />
</ScreenDemo>

不传扩展时：标题「告警列表」、5 行工业示例、红色「严重」/琥珀色「一般」，状态恰为「已恢复」时绿色。显式 `rows=[]` 是空表，不补默认数据。`more` 默认「查看全部 ›」始终是静态说明文字，**没有链接、点击事件或导航能力**；传 `''` 隐藏。

## 属性

| 属性          | 说明                                   | 类型                                                                                 | 默认           |
| ------------- | -------------------------------------- | ------------------------------------------------------------------------------------ | -------------- |
| `title`       | 面板标题                               | `string`                                                                             | `'告警列表'`   |
| `more`        | 右侧文字提示，无导航                   | `string`                                                                             | `'查看全部 ›'` |
| `rows`        | 六字段与可附加的宿主元数据             | `AlarmRow[]`                                                                         | 原 5 行示例    |
| `rowKey`      | 唯一稳定的字段                         | `string`                                                                             | `'wo'`         |
| `labels`      | 六列表头，按字段部分覆盖，空字符串保留 | `Partial<Record<'time' \| 'line' \| 'level' \| 'name' \| 'wo' \| 'status', string>>` | 旧六列名称     |
| `levelLabels` | 保留两级，覆盖文本，空字符串保留       | `Partial<Record<'sev' \| 'gen', string>>`                                            | 严重／一般     |

### `AlarmRow` 行

| 字段     | 说明                              | 类型             |
| -------- | --------------------------------- | ---------------- |
| `time`   | 时间文本                          | `string`         |
| `line`   | 旧产线字段，由宿主适配空间名称    | `string`         |
| `level`  | 原二级呈现通道                    | `'sev' \| 'gen'` |
| `name`   | 事件内容                          | `string`         |
| `wo`     | 原工单号字段，新宿主可适配参考号  | `string`         |
| `status` | 原文状态                          | `string`         |
| 其他字段 | 如独立 `id`、显式色调，由宿主提供 | `unknown`        |

## 插槽与语义

| 插槽          | 参数                                 | 默认                                                      |
| ------------- | ------------------------------------ | --------------------------------------------------------- |
| `cell-level`  | `{ row, value }`（value 是 sev/gen） | 原两级圆点与 `levelLabels`；替换可由宿主完全控制色调/文字 |
| `cell-status` | `{ row, value }`                     | 原状态文字及「已恢复」兼容色；替换时旧中文判断完全退出    |

只要提供对应 slot，就由宿主接管该单元格；`v-if="false"`、仅注释或空字符串仍保持空呈现，不恢复默认。省略或动态移除该 slot 才使用旧默认；slot 内条件切换不等于移除 slot。

中性宿主显式提供 state slot 和色调，不让「特别好」「已恢复」等任意中文词隐式决定好坏。级别需要不同色调时使用 level slot；没有引入通用表格 DSL、规则引擎或新状态框架。固定高度下内容原生双向内滚、表头吸顶，内容区域可通过 Tab 聚焦滚动。实际长值/事件替换见 `/#screen/tables`。
