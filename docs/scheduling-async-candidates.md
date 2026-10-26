# 异步候选、插单与停机影响（P13）

[P13 / #96](https://github.com/Mang-X/nerv-ui/issues/96) 从 `@nerv-iip/scheduling` 主桶导出 `SchedulingCandidatePanel`、`SchedulingRushInsertionResult`、`SchedulingInsertionPreview`、`SchedulingDowntimeBanner` 及其只读展示类型。两个中性深链是 `/#schedule-async/library` 和 `/#schedule-async/studio`；桌面、草案、快照和比较页均可进入，原路由保持可达。演示使用内存中的可延迟来源，不连接实际 APS。组件只显示宿主传入的状态、指标、文案、时间和明细，不计算候选、CTP、资格、延迟或停机覆盖。

## 公共合同与身份

`SchedulingAsyncJob` 必须有 `id`、`contextKey`、`requestKey`、`status` 和带 `baselineId/targetKey/targetLabel` 的 `input`。`status` 是 `created | running | failed | completed | stopped`。结果必须同时带 `jobId`、`contextKey` 与 `requestKey`；仅在 `completed` 且三者与当前 job 相同时显示。若宿主报告 completed 却没有匹配结果，界面显示核对提示，不借用旧结果。组件没有内部请求、轮询、定时器或隐式保存状态。

宿主在每次请求开始时捕获上下文、请求和 job 身份；切换上下文或 job、停止、关闭和卸载时取消当前 transport，并在 success、failure 与 finally 各入口核对身份。不能合作取消的旧请求即使晚回也不得更新新 job。停止显示 `stopped`，不伪装为失败或无限等待。真实失败显示宿主提供的安全文案，允许手动重试，并保留所选方案和草案。组件的 `retry(jobId, requestKey)`、`stop(jobId, requestKey)` 和 `select(jobId, candidateId)` 只是动作请求；宿主回写 `saving`、`selected` 等 props 后才改变可见确认。callback 缺失或失败不会令界面自称已保存、选定或发布。`selected` 必须由宿主按当前 job 与候选保存凭据确定，不能沿用上一 job 的布尔值。

`SchedulingCandidateSet` 还带 `contextKey`、`baselineId`、`jobId` 和 `requestKey`。范围或基线改变时 `SchedulingCandidatePanel` 隐藏整组旧候选并提示重生成；传入可选 `jobId/requestKey` 时也校验当前请求。`preview(contextKey, baselineId)`、`select(jobId, candidateId)` 只发身份，不传旧对象。候选可给指标前后值和变化、锁定保持逐项、移动前后资源/时间/分段、传播路径、换型来源及未排说明。缺失数值显示“—”，真实 `0` 保留，比例只格式化宿主给定值至最多三位小数。未给原因显示“未提供”，不把基线侧消息填到候选侧。`snapshot` 可复用 P12 的只读 `ScheduleRevisionReview`；跨修订关联仍以宿主的 semantic key 为准，assignment ID 只属于所在快照。

`SchedulingRushInsertionResult` 展示承诺时间的 `known | unknown | unavailable` 三态，未知不写 0 或“不可承诺”；工单影响的原/新完工、推迟天数、破交期三值以及逐工序原因和传播路径均来自宿主。结果中可选 `baseline/candidate` 复用 P12 比较与预览；没有候选安排时保存动作禁用。真实保存只以宿主回写的 `selected` 为确认，组件不作持久化或发布。

`SchedulingInsertionPreview` 使用宿主给定的 `plans`、`pageIndex`、`pageSize`、`total`、`selectedPlanId` 和 history 状态。当前 job 还须匹配上下文、目标 semantic key 与所选基线；切换方案时宿主应取消旧请求并清空旧候选。只有真实 total 能启用下一页，total 未提供显示“方案总数未提供”；`page(index)`、`choose(planId)`、`start({contextKey,targetKey,planId})` 交给宿主。`selectedPlanId` 可跨页保留，选择和插入失败不会被组件改写。读取失败、无记录与未提供是不同状态。当前 job 的停止、重试和候选预览仍由同一身份规则约束。

`SchedulingDowntimeBanner` 接受宿主刷新并带明确时区的 `now`、每行 `startedAt`、`duration`、`phase`、ETR/实际恢复文本、备选数量与可展开影响项。`phase` 必须显式为 `no-etr | expected | expired | recovered`；组件不根据文案、缺少 ETR 或浏览器时钟猜状态。`no-etr` 与到期、恢复分别展示；未知备选数量显示“未知”，实际 `0` 显示 `0`。宿主拥有当前时刻刷新、ETR 判定、累计时长、轮询和取消；界面没有 5 秒请求或领域时钟。演示宿主每 30 秒刷新一次真实当前时刻，卸载时清除该 timer，并在卸载与停止时中止自己的请求。

四件的 `readOnly` 禁用选择、预览、重试、停止、开始等会请求操作的按钮并提供理由；展开、查看和翻页仍可使用。宿主提供的时间文本须到分钟并带本地或任务时区，原始 UTC 不直接作为用户文案。技术身份仅在诊断或必要的基线提示出现，使用弱化等宽样式；原始 HTTP/JSON 错误只留在宿主诊断，组件显示安全文案。

## 冻结来源与直接消费者

| 冻结私有件                          | 本票公开接缝                                                                           | 旧直接消费者及迁移责任                                                                      |
| ----------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `SchedulingCandidatePanel.vue`      | 并排候选、六类来源指标、锁定、移动/传播/换型、约束、预览和选择；资格和标签由宿主准备   | `pages/scheduling.vue` 改由 host 投影候选与保存状态；旧 `localCandidates` 计算不入库        |
| `SchedulingRushInsertionResult.vue` | created/running/failed/completed/stopped、承诺不确定性、工单与工序影响、重试及保存确认 | `pages/scheduling.vue` 的 insertion/revision 流程继续由 host 维护                           |
| `SchedulingInsertionPreview.vue`    | 真实 total 分页、选方案、启动与当前 job 读面                                           | `SingleOrderSchedulingDialog.vue` 及其 host composable 负责 API/query/polling、资格和上下文 |
| `SchedulingDowntimeBanner.vue`      | now、ETR 明确四态、备选数量和影响展开                                                  | `pages/scheduling.vue` 及 `schedulingDowntime.ts` 的领域判定/模型叠加留在 host              |

四件旧私有文件和全部直接消费者仍在冻结 `migration/materials/source`；本票不改来源或旧应用。`useSchedulingInsertionPreview.ts`、`useSchedulingRushInsertion.ts` 及 P03 现有 callback/token/abort 接缝是宿主参考，不搬 API client、Colada、权限、auth、router、查询持久化、APS 调度或 SDK。P11 风险和 P12 比较的已公开合同保持；新接口不改变它们的默认与省略行为。

## 验证边界

具体 RED/GREEN、浏览器截图、HTTP 字节核对和未运行车道见 [P13 记录](evidence/t07-p13/README.md)。内存来源与真实可见浏览器只能证明公开 UI 和 host recipe 的状态隔离，不能证明真实 APS、真实后端轮询、原库消费或生产发布。DHTMLX 9.1.4 Professional Evaluation 文件、水印与第三方声明未改；授权范围仍为 UNKNOWN。
