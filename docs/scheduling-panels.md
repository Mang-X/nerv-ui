# 排程面板与展示合同（P08）

P08 / [#91](https://github.com/Mang-X/nerv-ui/issues/91) 只处理既有八个面板及其展示推导。库负责显示和请求事件；宿主持有当前模型、选中 identity、动作能力、锁定状态、搜索命中与展示事实。默认公开名、事件名和旧字段保留。包名继续为 `@nerv-iip/scheduling`，Nv 基元来自 `@nerv-iip/ui`。

## 八件归属

| 现有件             | 当前入口与处置                                                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| SchedulingToolbar  | 保留主桶；刻度、缩放、当前定位、适配窗口、编辑簇、搜索、分组、排序和请求动作                                                                          |
| SchedulingLegend   | 保留主桶；由当前 model/view/scale/grouping 推导图面语义，折叠与可见性请求                                                                             |
| TaskFacts          | 保留主桶；未选、事实、关联展开；不计算业务事实                                                                                                        |
| TaskDetailPanel    | 保留主桶；选中详情、可选只读及受控锁定请求                                                                                                            |
| ChangeSummaryPanel | 保留主桶；筛选、显式 before/after 展示、select；不计算比较或变化                                                                                      |
| ConflictPanel      | 本票新增主桶导出；显示宿主提供的提示与 select                                                                                                         |
| UnscheduledPanel   | 本票新增主桶导出；显示待安排输入与 fix 请求；不处理资格或排程                                                                                         |
| InspectorSheet     | 保留内部兼容包装，内部复用 TaskDetailPanel，删除第二套日期/事实展示。公开 recipe 使用 `Sheet` + `TaskDetailPanel read-only`，不增加第二个公共详情入口 |

独立页面为 `/#schedule-panels/library`（读书会）、`/#schedule-panels/studio`（工作坊）；从桌面“活动安排”或既有 `/#schedule-gantt` 进入，也可返回旧资源/工单入口。页面始终以只读图查看，详情锁定只修改本页内存状态。核对/确认仅记录请求，不宣称保存或求解。完整草案、表格、持久化、风险计算与快照比较仍分别归 P09、P11、P12。

## Toolbar

既有必填 props：`scale/readOnly/canUndo/canRedo/dirty/busy`。既有可选 `canEdit/canRepreview/canRelease` 默认 true；`searchable` 默认 false；`search=''`、`matchCount=0`、`matchIndex=0`（1 基，0 表示未定位）；`searchPlaceholder`、`groupDimensions=[]`、`groupBy='workCenter'`、`laneOrder='busiest'` 均保留。

新增可选 `labels: { repreview?, release?, dirty? }` 只替换可见文案；默认仍为重新排程、发布计划、有未应用的调整。`disabledReasons` 按下表动作键提供文字，非空原因同时禁用控件并显示 title/可访问说明。不把禁用视为权限验证。

| 动作键           | 公开事件                   | 内置禁用依据                                                |
| ---------------- | -------------------------- | ----------------------------------------------------------- |
| scale            | scaleChange(scale)         | 宿主原因                                                    |
| group            | groupChange(groupBy)       | 无维度时不显示；宿主原因                                    |
| laneOrder        | laneOrderChange(laneOrder) | 无维度时不显示；宿主原因                                    |
| zoomIn / zoomOut | zoomIn() / zoomOut()       | 宿主原因；宿主负责同步当前 scale                            |
| today / fit      | today() / fit()            | 宿主原因；fit 是既有 setSizes/render，不承诺自动缩放全任务  |
| undo / redo      | undo() / redo()            | readonly、busy、对应 can 为 false；canEdit=false 隐藏编辑簇 |
| toggleReadOnly   | toggleReadOnly()           | busy 或宿主原因；宿主回传 readOnly 才改变图标               |
| repreview        | repreview()                | readonly、busy、无 dirty；canRepreview=false 隐藏           |
| release          | release()                  | readonly、busy；canRelease=false 隐藏                       |

搜索只发 `update:search(value)`、`searchPrev()`、`searchNext()`。Enter / Shift+Enter 分别下一/上一；Escape / 清空按钮发空字符串。空查询或无命中不导航；有查询、无命中显示“无匹配”。组件不查接口、不持有选中任务。宿主从**当前模型**按可见内容找命中，使用 `command(selectTask)` + `command(revealTask)` 完成定位；需要图面命中高亮时使用既有 `setSearchHighlight`。

## Facts / Detail / Sheet recipe

`TaskFacts.task` 改为可选；未选默认“未选择工序”，可用 `emptyLabel` 覆盖。`relatedLabel/relatedLabels` 可定制关联分组标题和标签集合；省略时保留旧商业关联分组。空 facts 是空集合，缺 facts 才显示未知。数值 0、空字符串、未知、无权、暂不可读取由已格式化事实保留，不能互相补值。

`TaskDetailPanel` 保留 `task?/readOnly?` 和 `toggle-lock(taskId, locked)`。新增可选 `lockDisabledReason`；readonly 不显示锁定按钮，禁用原因显示在按钮与正文，未回传 task.locked 不改变状态。`labels?: { empty?, lock?, unlock?, resource?, changeover? }` 只提供领域显示词。宿主可通过 `ScheduleTask.display` 提供 `groupLabel/resourceLabel/priorityLabel/blockLabel/blockDescription`，不改写 identity。显式时区继续走 `scheduleTime`，空时区不回退浏览器。状态使用 NvStatusBadge，0 分钟/0 数量/0% 保留。

```vue
<Sheet :open="open" @update:open="open = $event">
  <SheetContent>
    <SheetHeader>
      <SheetTitle>活动详情</SheetTitle>
      <SheetDescription>查看当前活动与事实。</SheetDescription>
    </SheetHeader>
    <TaskDetailPanel :task="selected" read-only />
  </SheetContent>
</Sheet>
```

选中保存为 id，详情每次从当前 model 取对象。同 id 的外部更新应立即显示新事实；任务移除、替换或被显隐移出图面时清理选中。不能缓存旧 task 对象作为第二个事实源。

## 三个列表

| 面板               | 可选展示/能力输入                                                                                                                             | 事件与 identity                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| ConflictPanel      | 行 `label/reasonLabel/selectDisabledReason`；组件 `labels: { title?, emptyTitle?, emptyDescription? }`                                        | `select(taskId)`；无 taskId/有禁用理由不能伪造定位                                                                              |
| UnscheduledPanel   | 行 `label/groupLabel/reasonLabel/actionLabel/actionDisabledReason`；组件 `readOnly?` 与同上 labels                                            | 既有 `fix(orderId, operationId)` 原样保留；宿主决定处理；readonly/原因禁用                                                      |
| ChangeSummaryPanel | 行 `label/groupLabel/typeLabel/selectDisabledReason`；组件 `labels: { title?, filter?, emptyTitle?, emptyDescription? }`；`baseTasks?/tasks?` | `select(taskId)`；显式 taskId 只按 id 查找；仅未提供 taskId 的历史记录可接受唯一旧 order+operation 关联；不展示原始 operationId |

重排或替换数组后动作使用当前行身份。ChangeSummary 不派生 changeType、不算差异/KPI；空记录与筛选无命中分开。before/after 时间分别使用对应任务的显式时区，资源优先使用宿主展示名。P12 后续可复用这些显示输入，不在本票补比较算法。

`taskId?: string` 的 `undefined` 表示未提供身份；空字符串是显式空身份，不回退旧 pair，也不能定位。提供 `tasks` 后，明确 id 在当前集合不存在时，行保留 change 与可用的 before 信息，缺失侧不借另一个任务的资源或时间，动作禁用并说明“该活动当前不可查看”。不提供 `tasks` 时保持旧的按行 id 发出请求能力；历史无 id 的唯一 pair 仅用于展示，不编造事件身份。输入不修改。

## 图例与真实刻度

`model?/view?='order'/scale?` 与 categories 保留。缺 model 不再列“全部可能”图例；`FULL_LEGEND_SEMANTICS` 常量仍导出供明确的静态色板参考，运行图例不默认使用。新增 `now?`（宿主时钟）、`groupBy?/laneOrder?`（与资源图相同）、`categoryLabel?/blockLabels?`（展示词）。

`deriveLegendSemantics(model?, now?, scale?, view?='order', grouping?)` 保留前三参数。没有适用日历不造周末/夜间；资源与工作中心按显式 namespace，工作中心日历优先，未知资源不能借同串工作中心日历。完整覆盖的日历不列不存在的非工作底纹。

固定 DHTMLX 9.1.4 `Ri()` / `scale_offset_minimal` 的工单范围排除 project 汇总节点后从实际活动日期取最小刻度起点，再向前一格、向后两格；`model/scale.ts` 的展示推导按这一规则和最终工厂时区取格点。旧“偶数整点”假设已被真实 07/09/11…相位反例推翻；`shiftBoundaryRendersAt(startUtc, scale)` 保留旧两参近似签名，但**当前图例不再调用它**。工单班次/时间块只有命中真实格点才列；粗刻度下零点班次恰好命中格点时仍可出现，不能一概声称全无。未解析对齐时不造格点。

小时展示格点与保留的 `factory_hour_start` 一样清除毫秒；这只归一展示参考时刻，`factoryTimeInstant` 的编辑/无操作保存继续保留原始偏移与毫秒。当前保留厂商的粗刻度 offset 转换仍会保留输入的毫秒相位；不能把小时规则推广到日/周/月。上海和 Kolkata 四刻度与真实 cell/连续窗口的本轮对照见返修证据。

格点从已知实际时刻投影，不经过 wall time 编辑准入。小时对齐保留 DST 回拨中输入所属的那一次小时，逐格按实际时长推进；日/周/月沿用当前厂商的日历 offset 数学。合法 offset 与 UTC 字串表达同一 instant 时得到同一展示相位；这不放宽 `factoryTimeInstant` 对编辑后不存在或二义性墙上时间的拒绝策略。

`timezones` 缺省、空或含非法时区，或任一任务时区未解析时，公开 renderer 不建立图面，图例的甘特/卡片/状态/块/日历推导也全部为空，包括非工作底纹与“现在”。不回退浏览器时区。显式 `categories` 仍是宿主独立提供的分类色板，可在无 model 或未解析时展示并保留原显隐请求；它不证明图已渲染，也不代表宿主已应用过滤。宿主若只需随图显示色板，应与图面使用相同的显示条件。

工单 cell 只绘制第一个命中块：先资源泳道，再工作中心泳道；同一泳道按当前模型的块顺序首命中。图例只列至少赢得一个 cell 的种类，完整覆盖时后块可不出现，部分覆盖时仍可能出现两类。不同泳道分别判定。资源视图仍绘制全部相交的连续块窗口；本规则不改变引擎、模型顺序或业务窗口优先级。

资源图 P05 使用连续日历/块窗口，不受两小时相位限制；日/周/月也可有窗口边界。图例使用同一 resourceProjection，遵守 P05/P07 维度 identity；不改引擎配置、拖动、生命周期或模型时间。

`hiddenGroups?: readonly string[]` 提供受控显隐；`toggle-category({key, visible})` 是请求，回传前不改变受控态。省略 hiddenGroups 保留旧本地淡化兼容；它不代表过滤图面。`toggleableGroups?: readonly string[]` 限制能真实处理的开关，未传保留旧开关，空数组只允许折叠。示例只开放 category，事件后宿主确实替换图面任务集合，恢复后再显示，因此本例可以称“显隐”；不声称其它组已过滤。保留水印、Evaluation 与授权 UNKNOWN。

实际 RED/GREEN、真实浏览器、命令与未运行边界见 [P08 证据](evidence/t07-p08/README.md)。源码独立消费不代表 packed、CI、旧应用、APS、父 #8 或生产发布通过。

缺 vendor 时独立示例只显示现有唯一 native 只读 renderer；DHTMLX 专属图例隐藏，刻度/缩放/当前定位/适配窗口禁用并给出“当前仅提供只读时间查看”。仍可选择活动查看详情，记录写“已选择”而不声称未执行的 reveal；同页失败缓存和 reload 恢复继续遵守 P04 loader 合同。

示例收起活动图后仍可从搜索/列表选择并查看详情，但定位/当前定位/适配窗口不可用，图例随图隐藏。重显保留详情选择，明确提示点击“定位选中活动”重新在图中定位；不冒充已恢复高亮。定位按钮只在有当前活动、图已展开且可接受 vendor 命令时可用。命令返回值没有执行确认，记录使用“已请求定位”，真实选择几何由浏览器证据另行核对。
