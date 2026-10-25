# P05 / PR104：R1 两项命名空间返修

本轮仅修 #88 的资源投影 owner，候选仍在同一 draft PR104。起点 `a64fb38713b7a5998f6331ff408ec797f2045516` / tree `cdab53d6698b9bb1cc62e0921a83b3702c109341`；integration base `655b37430c42a9262b85f05817d9ded1186bf67c` / tree `e41a517696727bb9e7cf4dc8358b7f70bbe144b0`。最终提交对象、命令、日志和逐项 SHA 回读在外部 handoff；本文不替代父席安排的独立 R2。

共享 `resourceProjection` 保留明确 `workCenterId` 关系。vendor 日历/冻结与 native 冻结只消费该关系，资源兼容行仍保留资源日历和块。完整任务集合的 `workCenterId` 参与 workCenter 显式判定；任务维度、资源维度、旧工作中心字段的优先级不变，其它维度不从该字段猜归属。

## Requirement | Evidence

以下正式用例位于 [ResourceSchedulerBoard.public.test.ts](../../../../frontend/packages/scheduling/src/components/ResourceSchedulerBoard.public.test.ts)，分别使用保留的真实 vendor/jsdom 和唯一 native renderer；DOM lane 不等于浏览器几何。

| Requirement                                                              | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1：资源兼容行不借同串工作中心的日历/冻结，真实资源日历/块保留，删除清理 | `public 'vendor' resource fallback never borrows same-id work-center windows and retains resource blocks`、`public 'native' resource fallback never borrows same-id work-center windows and retains resource blocks`。正式 RED：分别多9/1个窗口；GREEN：0。资源关联的维护块仍为25%/50%片段。                                                                                                                                             |
| F2：明确 workCenterId 阻止重复资源行，三排序和任务身份不变               | `public 'vendor' explicit work-center tasks suppress resource fallback across ordering replacement and dimensions`、`public 'native' explicit work-center tasks suppress resource fallback across ordering replacement and dimensions`。正式 RED 为 Resource r0 + wc-A；GREEN 仅wc-A，选择仍为op。另断言后置任务、未分配、块/onlyScheduled、任务/资源维度优先、显式空名录、其它维度、删任务及删资源。                                    |
| 两维度/三排序、空/仅块行、替换/选择与只读                                | `public controlled dimensions and three orders retain catalog empty and block-only lanes and stable task events after reorder`；本轮真实浏览器六组合、wheel收集完整目录、task选择、删除/恢复、受控scale、双实例卸一留一更新/重挂。                                                                                                                                                                                                       |
| KPI 0/unknown/overload，空输入仍保留明确资源                             | `public resource headers preserve known zero unknown and overload without borrowing a colliding resource id`、`public empty resources and all-zero metrics remain visible without a task or an empty-state overlay`。                                                                                                                                                                                                                    |
| task/lane冲突和纯文本名称                                                | `public generated lane ids never replace a colliding task identity or emit a lane as a task`、`public resource names remain literal text even when they contain markup`。                                                                                                                                                                                                                                                                |
| 日历/块/冻结精确片段、替换清理、不假造班次                               | `public calendar block and freeze backgrounds stay scoped to their input namespace and clear on replacement`、`public resource hour axis never invents night or early shift names from missing calendar data`。                                                                                                                                                                                                                          |
| 严格calendar拒绝与恢复                                                   | `public resource calendar contains 'bare wall time' and recovers without guessing shift instants`、`public resource calendar contains 'invalid calendar day' and recovers without guessing shift instants`。                                                                                                                                                                                                                             |
| native归属/空行/块/选择和禁编辑分区                                      | `public missing-module fallback shares dimension membership empty lanes block windows and exact selection ids`；本轮真实HTTP503→唯一native→reload恢复vendor，非fake conformance。                                                                                                                                                                                                                                                        |
| P04共享生命周期                                                          | `preserves a reused container through real vendor retirement same task and subsequent updates`、`preserves a reused container through real vendor retirement after vendor initialization and subsequent updates`、`preserves a reused singleton owner when an earlier asynchronous initialization resolves`，及现有live非法时刻/baseline offset回归。本轮scheduling全套重跑；mount/finishMount/destroy、loader/useEngine与base字节相同。 |

正式 focused 14PASS。最终 scheduling 133 discovery /129PASS/4原skip；UI 811=805行为+6docs，host296，合计1230行为PASS/4原skip，另docs6PASS；不重复累计focused。4个stub conformance为0执行，不冒vendor conformance。实际reporter unhandledCount=0/reason=passed；原JSON缺失字段仍为null。未增skip/exclude/timeout。

首次完整scheduling为128PASS/1FAIL/4skip：旧fake用例 `DhtmlxEngine (fake factory) keeps every resource lane when no task carries the grouping dimension` 只清除dimensions却保留workCenterId。按其原“完全缺维度”含义同时清除该字段后全套GREEN；原FAIL仍在 `scheduling.json`，未改断言放宽新合同。

原外部观测runner exit0但没有正式断言，不计测试PASS。保留原件，复制件只改输出路径，分别重放观测RED/GREEN：calendar8→0、freeze1→0、native1→0；标签[Resource r0,wc-A]→[wc-A]，task op不变。原R1文件SHA与原清单逐项一致，准备失败与历史拒绝保留。

workspace types、独立公开.vue consumer types、root/nested build、受影响fmt/lint通过。三条既有lint warning和第三方构建warning保留。本票/返修增量diff-check0；main全量RAW exit2另列，不清理旧raw。

本轮真实浏览器两领域deep links及旧order入口、六组合、0/—/125%、tooltip非零几何、控制更新与清理通过；两张截图实际查看。root/nested各6个HTTP200实际body与各自fresh dist逐字相等（HTML/主JS/主CSS/vendorJS/vendorCSS/font），记录URL/MIME/bytes/SHA。仅此有限fresh矩阵；旧P04四external probes、完整32browser和P05旧主题/四刻度/resize全矩阵不冒fresh。本轮未改样式/宿主/生命周期/纯契约；仅相同CSS/vendor/font body所支持的外观证据及未改consumer源码支持有限继承，变化的主JS不支持整套旧交互继承。

lock完整973packages/973snapshots/importers及metadata/optional/peer/edge全对象与base相等；16工程输入逐字不变；四包同一Vue3.5.39实体。vendor JS/CSS/d.ts为891743/142723/211538bytes且SHA不变，Evaluation/版权/水印与UNKNOWN授权保留。

UNRUN：独立R2、CI、完整docs10、packed11、device、旧consumer13/15、父8组合、真实后端SDK/APS、生产发布、商业授权。mobile144+docs2、pure20/public-host50仅原证据和未改路径校验，非本轮fresh。P07/P11/P01、P02年份/P03字号/ETA、43/51不搭车；没有ready/merge/close/watch或启动后继。

## 原始证据

- 本轮 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-26/t07-p05-namespace-fix/handoff.md`；同目录有validation、命令/reporters、body、浏览器、invariants、lifecycle、SHA256SUMS和archive-verification。
- R1拒绝 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-26/t07-p05-review-r1/review-receipt.md`，同目录spec/standards/public-counterexamples及原probe不覆盖。
- 原实施 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-26/t07-p05-implementation-r1/handoff.md`；更早FAIL/UNKNOWN通过history-pointers保留，不复制历史大目录。
