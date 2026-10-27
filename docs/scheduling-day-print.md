# 日安排筛选与打印（P14）

[#97](https://github.com/Mang-X/nerv-ui/issues/97) 的公共入口为 `@nerv-iip/scheduling` 主桶的 `SchedulingDaySchedule`、`SchedulingDaySheet` 和 `SchedulingDayEntry`。中性演示为 `/#schedule-day/library`、`/#schedule-day/studio`，两页使用内存安排，可返回首页及既有排程入口。打印调用浏览器 `window.print()`；实际操作系统打印和纸张结果单独验收。

## 公共合同

```vue
<SchedulingDaySchedule
  :entries="entries"
  :date="date"
  :group-id="groupId"
  timezone="Asia/Shanghai"
  title="读书会日安排"
  :plan-label="planLabel"
  :status-label="statusLabel"
  :read-only="readOnly"
  read-only-reason="当前安排仅供查看，打印由场地方确认。"
  @update:date="date = $event"
  @update:group-id="groupId = $event"
/>
```

`date` 是 `YYYY-MM-DD` 日历日；`timezone` 必须是有效的 IANA 名称。组件用 P02 的 `factoryTimeInstant` 将该日与次日的午夜转换成真实时刻，以 `[start,end)` 判断交集。23/25 小时的 DST 日不会被当成固定 24 小时；不存在、二义性的午夜或非法日期不可打印。非法日期、空时区或未知 IANA 时区显示“日期或时区未解析”，不呈现确定的空安排或纸面 Sheet，也不回退浏览器时区；有效日期且筛选后无行才显示“没有安排”。直接使用 `SchedulingDaySheet(entries=[])` 仍表示宿主已确认的空安排。开始等于结束或无效实际时刻不进入日安排；结束恰为次日午夜只属于前一日。`date` 和 `groupId` 完全受控：事件仅请求替换，宿主不回写则视图和控件保留原值。分组只按宿主给出的 `groupId` 精确筛选；分组名称和资源名称也由宿主提供。

`entries` 是只读展示行。`semanticKey` 是活动跨版本身份，`assignmentId` 是本次安排实例身份，组件不从一个推断另一个，也不修改输入。宿主可给出工单/工序标签与工序序号，纸面表头可给出 `planLabel/statusLabel`；这些只是显示文案，不推断状态或已保存来源。`startUtc/endUtc` 及可选 `segments` 均为带偏移的真实时刻；跨日行展示宿主给出的完整时间段。可选 `quantity` 中 `0` 显示为真实零，`null`、缺失或非有限值显示 `—`，最多三位小数。时间显示为显式时区的绝对日期与分钟。业务对象、状态、权限、已保存方案与来源由宿主负责投影；本组件没有 SDK、认证、CSV 或持久化。

`SchedulingDaySheet` 可直接用于只读纸面展示，接收已由宿主筛选的 `entries/date/groupLabel/timezone/title` 及可选 `planLabel/statusLabel`。它使用静态表格及 `<thead>`，无分页、无操作按钮。`SchedulingDaySchedule` 内部用同一 Sheet 生成屏幕视图和打印目标。打印仅在有效日期、有行且未只读时可发起；只读理由由 `readOnlyReason` 输入。

## 打印生命周期

打印目标只在本次请求期间 Teleport 到 `body`；组件为该实例取得 `data-nv-day-print-owner` 后，`nv-components` 层的 print media 隐藏目标外的 body 子节点并重复表头。纸面颜色使用主题的 `--nv-print-paper`、`--nv-print-ink` 和 `--nv-print-rule`，深浅屏幕主题下均保持浅色纸面，宿主可覆盖这些语义 token。`afterprint`、取消后窗口重新聚焦、超时、`window.print` 异常、外部日期/group/timezone/entries、标题/计划/状态文案、只读输入替换（含响应式条目深层变化）和卸载都会撤销本实例的 owner、目标、监听器与 timer。同页另一个实例已有 owner 时不会抢占或清理它。print media CSS 仅在 body 持有该 owner 时生效；没有常驻全局纸面或第二套通用 print helper。

冻结旧版 `SchedulingDaySchedule.vue` 由 `pages/scheduling.vue` 的方案详情页直接消费 `plan`，默认选第一条开始日或浏览器今日、默认全部工作中心；本地 `date/workCenter`，无公开事件和 slot。`SchedulingDaySheet.vue` 接收 `plan/day/workCenter/assignments`，展示方案状态、工单、工序、工作中心、资源与分段，旧 `window.print()` 和常驻 Teleport 缺完整生命周期。新库把这些展示事实投影为行；旧应用的方案来源、状态文案、工单与工序 ID/标签、工作中心及资源映射留 host。页面的“下载方案 CSV”调用后端 Blob 下载，不属于本票。冻结文件 blob 与逐项处置见[实施证据](evidence/t07-p14/README.md)。
