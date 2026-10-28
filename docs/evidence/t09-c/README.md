# T09/C：排程快照事实与比较站内示例

范围：#147，Parent #10，scope:M，一个仅向 integration 的 draft PR。基点 `074e83297bbc30837883acbf4def39c337254bcf` / tree `666b4c6df5cef0d91db38e65a727d48f37adeddd`。提交前 fetch 并正常 merge 最新 integration：Already up to date。仅文档消费者、局部测试和证据；生产 packages、公共合同、锁、依赖、vendor、patch、migration 无改动。

## AC 与精确测试

测试文件：`frontend/apps/design-system/snapshot-comparison-host.test.ts`。真实挂载公开组件，仅 GanttChart 图面 stub；不把 jsdom 当作真实 vendor 运行。

| AC                                                          | 实现与测试证据                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 六件实际 live、导航可达、保留原站                           | 新增 [站内页](../../../frontend/apps/design-system/docs/components/desktop/scheduling-facts.md) 与侧栏、B 页互链。`site connects both live examples without importing playground runtime or removing existing pages`；原 A6、B14 全保留。ScheduleRevisionPreview 是任务职责名称，当前 public 实际名为 SchedulingPreviewResult，直接复用，不创建别名或组件。原 175 页保留，新增 1 页，共 176 页 |
| 缺口零／未知、来源、批次与影响项、外部替换和只读            | `snapshot live preserves zero unknown expands batch impacts and replaces current activity selection`：四件真实渲染；0 支／— 盒；两层原生 details；选择后替换清空、重新查询当前活动；只读关闭动作；当前记录 0 张；清空不宣称就绪                                                                                                                                                                |
| 警告／阻断、读取状态、零负荷／未知                          | `snapshot source options hide stale facts and keep severity and zero load distinct`：severity 来自事实而非 message；ResourceLoads 真实筛选零与未知，读取状态切换隐藏四件旧事实。所有新 native options 显式 keyed v-for                                                                                                                                                                         |
| semantic key／assignment、缺侧／blocked、基线隔离、候选说明 | `comparison pairs semantic keys across assignment IDs and isolates baseline during replacement`：同 key 不同 assignment 为调整、不同 key 同 assignment 不合并；blocked 与缺侧不同；替换后基线不动且图面同步；缺候选不借基线历史说明；时间保留 datetime 与显式时区到分钟                                                                                                                        |
| 独立预览选择／替换／只读、metrics[]／missing、安全校验      | `standalone preview maps current selection and readonly while empty missing metrics and public errors remain visible`：预览图选择映射 semantic key；替换清旧选择，只读拒选择；空指标与未提供不同；重复 semantic key 走 public 错误路径并停止图面，恢复后重现                                                                                                                                   |
| 交互与响应式边界                                            | 两段局部可聚焦横向滚动区，宿主响应式 padding，不改全局 Demo。数量经公共 formatter 最多 3 位小数，数字列用现有右对齐；自然语言不强制 mono。legacy 编号和本地分钟继续沿公共适配器，不修改生产排版。真正展开、最终 dist 选择/换源、亮暗宽窄由父安排独立 runtime，UNRUN                                                                                                                            |

## 来源盘点

已读当前 `SnapshotRiskDemo.vue/.test.ts`、`ScheduleComparisonDemo.vue/.test.ts`，snapshot/comparison producer、主桶导出、`docs/scheduling-snapshot.md` 与 `docs/scheduling-comparison.md`。站内先例为 Demo/theme、SchedulingPanelsExample、SchedulingDraftExample、panelModel、docs.contract、scheduling-live.contract、scheduling-host 与文档局部 vitest 配置。

`snapshotFacts.ts` 限定复制基点 playground 的 `snapshot-risk-fixtures.ts`；`comparisonFacts.ts` 来自 `schedule-comparison-fixtures.ts`，改用已存在的文档本地 panelModel 和 snapshotFacts。两个 Example 从对应中性宿主缩减，去掉应用导航、主题和额外草案编辑，补指标空/缺失、身份校验和预览选择。候选替换时图面与对照同步；冻结基线只是示例记录，不能证明真实保存凭据。无 playground 运行时 import、SDK、查询、认证、服务或求解。

原三共享模型与全部任务的显式 UTC 仍由未修改的 A 合同测试覆盖，新比较模型复用显式 timezones+timezone。DHTMLX Evaluation 文件、水印、许可声明未修改。只按公开输入展示，不计算 APS、准备状态、风险、用料或负荷。

## 原始执行与边界

外部证据：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-c-implementation-r1/`，handoff 含完整对象、命令、结果、源码／patch 与 SHA256 回读清单；不打包 dist/node_modules/cache。

- RED：`red.log/json`，5 个新测试均 FAIL（有效挂载占位组合但公共行为／入口缺失），exit 1。
- 首轮 GREEN 尝试：`green-1.log/json`，24 PASS / 1 FAIL，exit 1；原因断言误读时间行，依据 producer 改读真实 ChangeSummaryPanel，未改生产。保留原 FAIL。
- GREEN：`green-2.log/json`，25/25，4 files，exit 0。最终同范围门禁及完整 docs:typecheck/docs:build、scoped lint/fmt、文档非空格式 cmp、links 与 maintenance diffcheck 结果见 handoff；原 A6+B14 不删改。
- 原 A/B 历史 alias RED、时区 FAIL、global fmt 3 FAIL、TZ timeout 仍保留，不以此轮 PASS 擦除。新局部测试的图面是 stub；runtime/unhandled 缺字段 UNKNOWN，不能推断为 0。4 vendor policy skip 是 0 执行，非 PASS。
- 独立 review/runtime/merger、最终 HTTP 与宽窄亮暗、CI、packed、device、真实 APS、production UNRUN；商业授权 UNKNOWN。旧四应用接入/退出 NOT_PLANNED；D–H、#11、父 #10 验收另行进行。作者不自审、ready、merge、close、watch。
