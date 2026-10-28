# NvScheduleTimeline：只读时间安排

## 规则

需要按实际时刻对齐的任务、资源泳道、依赖与宿主提供的保留窗口时，使用 PC 品牌层 `NvScheduleTimeline`。垂直事件日志继续用 `NvTimeline`；大屏比例分段继续用 `NvTaktGantt`。

## 判定

- PC 素名新增 `NvScheduleTimeline`；不改原有 `GanttChart` / `ResourceSchedulerBoard`。品牌前缀、`nv-` 类、`data-slot`、`nv-components` 层遵循现有约定。
- `view="task"` 按 `groupId`，`view="resource"` 按 `resourceId`；两者使用显式 `groups` / `resources` 标签。`laneOrder` 支持 `busiest`、`name`、`onlyScheduled`、`catalog`；空泳道保留可选。
- `scale="auto"` 对不超过两天的 horizon 采用八小时 UTC 间隔，否则为 UTC 日；可明确指定 `eightHours` / `day`。这只是刻度，不是生产班次或夜班日历。超长区间最多绘制 1000 个刻度单元，按整倍数稀疏，时间范围仍完整。
- `start` / `end` 必须为 ISO 日历日期加时间与 `Z` / 数值 offset 的实际时刻且正时长。接受 `YYYY-MM-DDTHH:mm[:ss[.fraction]]Z`、`±HH:mm` / `±HHmm` offset 及 ISO 扩展年份；保留合法 offset 与毫秒。先验证真实月末/闰年、时分秒及 offset，再解析实刻，拒绝 2 月 30 日等日期归一化。小时 00–23；ISO `24:00` 仅允许分秒和小数全零；不接受闰秒、无 offset wall time 或非法 offset。horizon、任务、窗口、分段及依赖端点共用这一个日期 producer。坐标合并 horizon 与有效任务后向 UTC 刻度取整。无有效范围不以当前时刻伪造数据。
- `timezones` 为轴展示时区，任务有自己的 `timezone`。缺失/无效显式显示“时区未解析”；备用轴明确标 UTC，任务保留原始实刻。不默认浏览器时区或第一工厂，不转换未带 offset 的 wall time。
- `facts`、`statusLabels`、`conflictLabel`、`attentionLabel` 和 `windows` 均由宿主提供；窗口仅做裁剪和投影，不推导冻结资格。合法且落在任务包络内的 `segments` 以分段带显示，保留间隙。任务 identity 与泳道 identity 分开。
- 状态统一使用 `NvStatusBadge`：显式 `conflictLabel` 为 danger、`attentionLabel` 为 warning；锁定和任意 `statusLabels` 为 neutral，不用文案查业务词表。
- 排版沿用 [基础规范](https://github.com/Mang-X/nerv-ui/blob/integration/nerv-ui-extraction/frontend/DESIGN/foundation.md#字体排版) 的 `text-sm` 正文尺度：轴、泳道、窗口、分段、任务事实/时间和短时详情统一继承；状态徽章由已有组件拥有。密度不靠自定义小字号，时间盒仍按实际区间投影。
- 时间条使用无 padding/border 的投影盒与内描边，内容层单独留白，分段对齐完整时间包络。投影小于 96px 的任务保留原始宽度、可聚焦 identity/title；可展开原生“短时任务详情”，阅读标签/时间/事实/状态并选择同一 taskId。详情按钮不表达时间宽度，不扩大时间条命中范围。浏览器亚像素量化仍适用。
- 点击只发 `taskSelect(taskId)`；`attentionLabel` 单独强调风险，不推导冲突；有 `conflictLabel` 时才也发 `conflictClick(taskId)`。锁定仍可选择，没有修改/拖拽/权限或查询行为。模型更替是唯一事实来源。

## 正例

阅读与漫步两个计划，用实际 UTC/offset 时间、空间标签、书目/路线事实与一条依赖显示。宿主拿到 taskId 后展示已选项；换模型、清空和恢复均由宿主决定。

## 反例

不要输入 APS DTO、SDK 或权限存储；不要让 renderer 计算可排时间、工厂日历、停机或物料风险。不要把只读 native 演示当成真实 DHTMLX、周/月、编辑命令或排程求解验收。

## 来源与唯一 owner

来源 `frontend/packages/scheduling/src/components/ReadonlyScheduleTimeline.vue`（`93f9689c`，原始 blob `0c54d9a646374a6c987304e1ea57e32bce3c5df7`）。保留原生轴、重叠行、泳道、依赖 SVG、冻结窗口投影、事实/锁定/冲突和选择；领域事实推导转为宿主输入。本票按明确要求加入 visual segments 带：旧 native SFC 本身并未绘制 `segments`，该能力在原 DHTMLX producer 存在，不能称 native 逐字继承。

[#84](https://github.com/Mang-X/nerv-ui/issues/84) 的 ui 是通用 native renderer 唯一活动 owner；[#87](https://github.com/Mang-X/nerv-ui/issues/87) 将旧 fallback 接到同一实现。旧源保留为来源且 scheduling workspace 尚未恢复。旧 native 过滤资源时间块，没有周/月独立刻度、完整 zoom/drag/command；本组件 visual contract 只接普通任务，不声明资源 block 或这些引擎能力。P02 后续适配本 visual model，不要求本票迁全部 scheduling 类型。
