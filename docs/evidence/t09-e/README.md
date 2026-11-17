# T09/E 实施证据

仅 #151 / Parent #10，scope:M，独立 integration draft PR。初始 base `845b4766e6785319c470b25ad92aa4355c3f0c9f` / tree `63ece490d81b6b2556a2c33ebc0a1a175519fc32`。仅 docs consumer、页面/导航、局部消费测试和本证据。提交前 fetch 并正常 merge `origin/integration/nerv-ui-extraction`，具体 SHA 和 clean 回读见外部 handoff；不 reset/rebase，不操作 main/PR18。

## AC 与精确测试名

新增测试在 `frontend/apps/design-system/workbench-saved-day-host.test.ts`，真实 public 组合，只有 GanttChart/ResourceSchedulerBoard 渲染边界 stub；不据此宣称真实 vendor 或浏览器通过。

| AC                                                                       | 证据测试名 / 来源处置                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 七职责 live、三页侧栏与互链，保留原 History                              | `seven responsibilities share three live pages with sidebar and local cross links without playground imports`；WorkbenchExample 宿主组合 Workbench 与 History；SavedPlan 内部组合 SavedPlanOrders 与 SavedPlanWorkOrderLink；DaySchedule 内部组合 DaySheet。SchedulingPlanGantt/Orders/WorkOrderLink 为当前主桶别名，不造第二实现。原三页与全部 177 页保留 |
| Workbench 三视图、选择/当前详情、接纳/拒绝/来源替换、只读、预览身份      | `workbench preserves three views and current details, preview accept reject and replacement ownership`；用公开 graph 事件提案及真实 toolbar/页签。回调只修改传入快照，不连接求解服务；不提供 release，避免发布成功误解                                                                                                                                     |
| 保留 #141 assignment/null 维度接纳与当前 model 详情                      | `workbench accepts dimension null independently from resource and derives selected details from edited model`；team ID 与 resourceId 相等仍独立，空维度 marker 保留，详情由 producer 当前 model 派生                                                                                                                                                       |
| History 筛选/选择、下载当前 revision 及 Blob 清理                        | `history filters selection and download belong to current revision and release Blob URLs`；旧 revision 不创建下载，新 revision 创建并 revoke。既有单行 History live 保留；追加可操作集合与 detail slot                                                                                                                                                     |
| SavedPlan 只读图、订单/工单选择、当前事实、pending/失败/重试/来源替换    | `saved plan uses current facts and selection, pending navigation rejects duplicates and retries locally`；onNavigate 不改 location/router，手动接收仅本页内存回执；同任务 facts 更新保留选择并显示当前事实，换计划清选择和回执                                                                                                                             |
| 真实 0 / 未知、两个打印 owner 隔离                                       | `saved facts preserve zero and unknown and a second day owner cannot steal a pending print`；summary 明确 0 与 null；第二实例不能抢占或清理第一实例 owner，卸载清目标                                                                                                                                                                                      |
| 日期、显式 timezone、分组、半开跨日、非法/未解析与 empty、目标内容与清理 | `day separates unresolved and empty, clips half-open days and prints only the current target with cleanup`；午夜结束不进入次日，跨日保留，0 人可见；分组筛选、非法日期和 timezone 与真空态分开；输入更替与合成 afterprint 清理目标                                                                                                                         |

## 来源与边界

- WorkbenchExample 来源：同基点 `frontend/apps/playground/src/WorkbenchDemo.vue`，改为 docs 本地宿主，移除全局主题切换；复用当前 A–B 本地 `panelModel.ts`，保留当前事实/null marker 路径。预览/下载通过局部手动回执展示 producer 的真实取消控制，不引入公共 async 机制。
- SavedPlanExample 来源：同基点 `frontend/apps/playground/src/SavedPlanDemo.vue`；保留中性模型、精确 taskRefs、显式 timezone、两维度和关联分组状态，移除应用导航/主题与 hash 路由，替为本页 pending/failure/retry 回执；事实刷新不清当前选择。
- DayPrintExample 来源：同基点 `frontend/apps/playground/src/DayPrintDemo.vue`；保留中性跨日/分段/午夜 fixture，移除应用导航/主题；增加显式时区和非法日期入口。Sheet 与打印生命周期直接复用公共 producer，不复制打印逻辑。
- 未 import playground 运行模块。三宿主局部响应式 padding/min-width、可聚焦横向滚动，不编辑全局 Demo。宿主新增原生选项均 keyed v-for；实际浏览器标签/值待独立席验证。
- 生产 packages/playground、公共合同、依赖/锁、vendor/patch、冻结页清单与 golden 均未修改。A–D 原 52 条测试原样保留；本票新增 7 条。只运行 docs 局部 Vitest，不运行宿主/vendor 整桶。

## fresh 本地与原始记录

外部目录：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-e-implementation-r1/`。

- RED：`red.log` 保留重复 config 路径准备错误；`red-import.log/json` 是未实现模块导入失败，不冒充行为 RED。`green-attempt1.json` 为 2 PASS / 2 FAIL：预览按钮接入与当前事实更新后选择；`green-attempt2.json` 为 3 PASS / 1 FAIL：原生页签需 mousedown。`green-final.json` 为 52 PASS / 6 FAIL：新增 graph stub 缺 command；未改 producer，补齐测试边界；`green-final2.json` 为 58 PASS。最终加入导航断言和分组/非法日期后，`final-postdelta.log/json/exit` 为 59 PASS / 0 FAIL，exit 0，7 files（原 52 + 新增 7）。
- types、完整 build、scoped lint/fmt、Markdown 非空 stdin 二次格式 cmp、链接/includes、原 177 页保留、维护 diffcheck 见 `gates.json` 与完整原始日志。build 保留 VueUse/Rollup 注释警告；jsdom CSS 解析警告保留。JSON 未提供独立 runtime/unhandled 字段，均记 UNKNOWN，不推断为 0。
- 准备时误用不存在的 `origin/integration`，保留于 preparation-errors.txt；核实后按真实分支正常 fetch/merge。历史 globalfmt/RAW2/TZ timeout 等不修复、不洗绿。

## 独立验收待办

作者未启动浏览器、preview、服务、review/runtime/merger，也未 ready/merge/close/watch。1440/390 亮暗、真实 vendor/native、最终 HTTP、可达完整按钮/反馈、实际选项标签值均 UNRUN。打印媒体/PDF 输出 UNRUN；原生打印 UI、OS afterprint、实纸分别 UNRUN；本地 window.print stub / 合成事件仅消费证据。4 vendor policy skip、0 执行不算 PASS；Evaluation 水印授权 UNKNOWN。CI/packed/device/APS/production 各自 UNRUN。旧四应用接入与旧库退出 NOT_PLANNED。F–H、#11、父 #10 集成另验，#151/#10 保持 OPEN。
