# 快照风险与资源负荷（P11）

四件从 `@nerv-iip/scheduling` 主桶消费：`MaterialShortageSummary`、`PlanRisks`、`PlanConflicts`、`ResourceLoads`。库只显示宿主提供的事实，按显示 identity 分组、折叠和筛选；不计算物料净额、库存分配、资格、可用性、求解结果或风险。不会从空记录推导准备就绪，也不会从窗口零负荷推导资源可用。

独立中性组合：`/#schedule-snapshot/library`（读书会）、`/#schedule-snapshot/studio`（工作坊）。从桌面“安排核对”进入，可返回工作空间、既有草案与时间入口。页面提供冻结/当前两组明确记录、预警过滤、数组替换、空记录、读取状态、负荷筛选及活动详情；查看记录中的活动、位置、时间和结果来自当前输入。它是源码消费者，不是版本化产物安装、真实 APS 或后端保存验收。

## 来源与读取状态

每件都接受 optional `source?: SnapshotSource`：

```ts
interface SnapshotSource {
  kind: 'snapshot' | 'current' | 'unknown'
  label: string
  capturedAt?: string | null // 宿主已格式化的时点，须包含时区说明
  status?: string | null // 来源明确给出的状态，不由记录数/严重度推导
  state?: 'available' | 'unknown' | 'missing' | 'forbidden' | 'unavailable'
}
```

`kind` 区分快照与当前；`state` 表示读取结果；`status` 是该来源自己的状态说明。这三者独立。快照预警与当前核对可以同时存在；当前空记录也不能代表当前就绪。无 source 显示“来源未说明”，无时点显示“—”，无状态显示“未提供”。组件不回退浏览器时区、不猜时间或自动刷新。

未传 `state` 时，有明确数组输入才显示记录。数组 `[]` 是已知空集合；未传 payload 是“未提供数据”，即使 source 标 available 也不把缺失变为空。其它四种读取状态分别显示“状态未知 / 未提供数据 / 无权查看 / 暂不可读取”，不展示记录正文。它们是展示能力，不替代宿主鉴权。

## 可选 display 与原 props

原四件来自旧 app 私有 default 组件，并无既有库公共导出或事件。本票将四个展示职责公开；原七个库公共组件、默认值、事件及引擎合同不改。各 `.vue` 仍有 default export。原业务结构 props 保留为无 SDK 的结构类型；推荐新宿主传完整 display。

| 组件                    | 保留输入                                                                                                                                | 新可选通用输入与可见行为                                                                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MaterialShortageSummary | `shortages?: readonly LegacySnapshotShortage[]`                                                                                         | `display?: readonly SnapshotShortage[]`；物料/批次、给定缺口与单位，影响活动二层展开；影响项 null/缺失显示未提供，[] 显示为空                                                  |
| PlanRisks               | `materialRisks?: readonly LegacySnapshotRisk[]`、`equipmentRisks?: readonly LegacySnapshotRisk[]`                                       | `display?: readonly SnapshotRisk[]`；类别、组、风险明细与各缺口；group 按 id 而非 label；`readOnly?: boolean = true`                                                           |
| PlanConflicts           | `conflicts?: readonly LegacySnapshotConflict[]`、`unscheduledOperations?: readonly LegacySnapshotConflict[]`、`generatedAtUtc?: string` | `display?: SnapshotConflictsDisplay`，含 `conflicts` 和 `unscheduled`；error 直显、warning/info/unknown 按严重度及 reason.id 折叠；未安排单独直显；`readOnly?: boolean = true` |
| ResourceLoads           | `loads?: readonly LegacySnapshotLoad[]`                                                                                                 | `display?: readonly SnapshotLoad[]`；按资源 id 与窗口 id 展示，默认全部；本地可筛全部/有安排/零负荷/未知；零负荷窗口默认折叠，不删除零负荷独占资源                             |

明确传 display 时完全替代对应旧输入，包含 `[]`，不拼接旧数组。PlanRisks、PlanConflicts 走 legacy 时须完整提供原两份数组，避免把缺的一份误当空。generatedAtUtc 仅在无 source 时作冻结来源时点展示；新宿主直接提供 source 的显式时区文本。

旧 `windowStartUtc`、`windowEndUtc` 和 `generatedAtUtc` 仅在旧 props 适配时接受带 `Z` 或明确时区偏移的 ISO 时点，显示为运行环境本地时区的绝对时间（到分钟，附时区名）。缺失、无效日期或无偏移的业务墙上时间显示 `—`；原 UTC 值仍用于旧窗口 identity，不改写输入。新 `display.start/end` 与 `source.capturedAt` 是宿主已格式化文本，按原文展示，不由库推断时区。

类型 `SnapshotActivity/Shortage/Risk/Severity/Conflict/Pending/ConflictsDisplay/Load`、`SnapshotSource/DataState` 和四个 Legacy 结构都从主桶导出。运行图不导入 api-client、auth、router 或业务 APS。原始材料及旧断言仍在冻结 migration，未修改；业务旧日期格式器不入库。新 display 的技术 identity 只用于 key/事件，不自动成为可见名称。旧数组仍显示来源原有的工单、工序及资源标识；全缺时提示“活动名称未提供”。需要中性活动名称、位置、时间和结果时由 host 适配 display。

## 数量、严重度和动作

- 缺口、需求、可用量、已排/可用分钟只格式化宿主给定的有限数值，最多显示 3 位小数；原输入与事件事实不变，0 保留。null、undefined、非有限数显示“—”，不补 0。库不重新分配用料。
- utilization 为宿主给定比例，只做百分比格式化。例如已排 30 / 可用 60、utilization 0.8 显示 80%，不会重算成 50%。已排严格为 0 归 idle；缺失/null/非有限值归 unknown；其余有限非零值归 active，不代表资格或健康。
- 严重度只有显式 `error` 是阻断；`warning`、`info`、未提供或未知分别显示预警、提示、级别未知。文案含“错误”不改变 severity。legacy 风险无 severity 时显示未知，不从物料/设备语义猜等级。原因的旧已知枚举只做文案映射，新 display 的 reason.label 直接由 host 给。
- PlanConflicts 的 legacy 已知原因使用冻结展示的保守措辞（例如 `material` 为“物料约束”）；缺失原因显示“原因未提供”。同一输入中的不同未识别原因按稳定排序标为“未识别原因（第 N 类）”，保留分组与可见区分而不显示技术码或猜测实际约束；完整语义由宿主通过 `display.reason.label` 给出。
- PlanRisks/PlanConflicts 新增 optional 展示动作：当前记录含 `activity` 和 `actionLabel`，且显式 `readOnly=false` 时才显示按钮。`disabledReason` 禁用并显示原因；其它读取状态无动作。事件 `select(activityId: string)` 只请求查看当前活动，不修改输入。handler 重新按当前 row.id 取 activity，不保留旧数组对象。readonly 仍可折叠和筛选。

显示 id 在各数组内须唯一且稳定，类别/组/资源/原因各有独立 namespace；相同 label 的不同 id 不会合组。旧输入仅保留原组合 identity；存在重复组合或名称需求时应提供明确 display id，不把数组 index 当领域 identity。外部可替换整个数组或同 id 更新文本/活动；组件无输入 mutation。展开使用原生 details/summary，支持键盘，旧组删除时其节点和内容随当前输入退出。

```vue
<script setup lang="ts">
import { ResourceLoads, type SnapshotSource, type SnapshotLoad } from '@nerv-iip/scheduling'
const source: SnapshotSource = {
  kind: 'snapshot',
  label: '上午安排记录',
  capturedAt: '2026-10-26 08:30（Asia/Shanghai）',
  status: '等待复核',
  state: 'available',
}
const display: SnapshotLoad[] = [
  {
    id: 'morning',
    resource: { id: 'room', label: '晨光书房' },
    start: '09:00',
    end: '10:00（Asia/Shanghai）',
    assignedMinutes: 0,
    availableMinutes: null,
    utilization: null,
  },
]
</script>
<template><ResourceLoads :display="display" :source="source" /></template>
```

P04 的 Evaluation 文件、水印、授权 UNKNOWN、字体许可与本地 transform 保持。四件不需要 vendor 来显示，也不调用 engine command。P05 projection、P08 legend、P09 草案和 P03 callbacks 继续由各原 producer 拥有。P12 静态比较、P15 已保存计划和 P16 组合可消费这些显示输入，不由本票实现。

逐项来源、RED/GREEN、测试名称、截图和未运行车道见 [P11 证据](evidence/t07-p11/README.md)。
