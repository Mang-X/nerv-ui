# T07/P16 实施候选证据（#99，scope M）

指定 checkout `/Users/mang/Project/nerv-ui-worktrees/t07-p15-saved-plan`，分支 `feat/t07-p16-workbench`；fixed base `4339785c619838ace9663e1fec92cc56d9635ea1` / tree `c92dfc3d8a99e95401349dcb742e631a8d317b64`，开工 clean。最终 head/tree/clean、PR 回读及逐 SHA 最小归档见外部交接 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t07-p16-implementation-r1/handoff.md`。本页与源码随同一候选提交，不伪造自身提交 SHA。

## Requirement | Evidence

| Requirement | Evidence（确切测试名） |
| --- | --- |
| 保留公开名、组合已有子件 | `exports original workbench and neutral history through public barrel`；`composes the existing table recipe and retains before/after slots without editing authority` |
| 所有排程子入口往返、其它表面保留 | `navigates every scheduling entry and returns through the persistent public navigation`，逐一操作13个既有入口并回工作台；App 原有分支保留；两域 WorkbenchDemo |
| 中性过滤、分页、详情跨页稳定、0/unknown/TZ | `filters and pages history while open detail remains the selected snapshot`；`uses explicit local date, distinguishes loading and empty, and disables absent callbacks` |
| 确认/下载busy/error/host receipt | `awaits host confirmation and retains safe retry after error`；`reports download false and success and removes unreadable detail` |
| 旧回执在 readonly/replace/cancel/unmount/callback 边沿丢弃 | `discards delayed download receipts at readonly edge` 等五个具体参数用例；`discards delayed confirmation receipts at readonly edge` 等五个用例；`isolates stale catch and finally from a newer busy request and resets replacement pagination` |
| 草案/快照/当前事实分离、两域可操作 | `composes independently owned current facts and saved history in library` 与 `... in studio`；当前模型替换不改历史快照；P09草案入口继续由原recipe拥有 |
| 只读、卸载及替换后不提交工作台旧预览 | `keeps host readonly authoritative even when a toolbar requests editing`；`cancels workbench preview at readonly boundary`、`... callback boundary`、`... unmount boundary` |
| 六件材料、来源、依赖/许可边界 | 源码+主桶+命名/primitive/导入合同+coverage矩阵+DESIGN决策+文档站live页齐全；完整签名见 [公共合同](../../scheduling-workbench.md)；外部 immutable-inputs.json/source-provenance.json |

## 全部来源与能力处置

沿用 [P04 原64归属](../t07-p04/original64-ownership.json)，不建永久 runtime 清单。T01 固定 `79b1578f2b75f55709765b5e7882aaf33146c603`；source 六项 blob/SHA/bytes 存外部 source-provenance.json。已核研究 §§3–7、附录能力归属、当前原64清单、workbench完整模板/类样式、业务 scheduling 页完整模板和筛选/选择/确认/下载交互、dev预览完整组件及数据生产结构。未逐字重新审查全部旧业务脚本/SDK/算法及 vendor 压缩全文；研究中的其它域仅依既有 owner 处置，不把文本命中当新运行能力。

| 来源 UI / 原公开名与直接 consumer | 本票中性处置 / 所有入口 |
| --- | --- |
| SchedulingWorkbench：model/loading/readOnly/engineKind/defaultView/context/preview/release；fix；无原slot；order/图例/侧栏默认 | 名字保留进入主桶；原order/resource与P08面板仍在；新增只读表格复用P09、before/after slots；唯一新增活动consumer WorkbenchDemo（旧候选仅测试消费，未在旧业务页直接使用） |
| scheduling.vue workbench/table/gantt、刷新、historystatus/date/失效、空态、selected detail sheet、确认发布/撤销、CSV | 工作台/历史/已保存图面三入口；历史读取三态及retry、搜索/状态/记录日、清空/分页、冻结详情、host确认/下载；失效和发布/撤销不保留领域枚举，host提供中性status与confirmation说明/资格。无SDK/router/auth/real query/poll/persistence/release规则 |
| scheduling.vue 草案保存/恢复/清空/锁定/重预览/未排/对比/生成 | P09 `#schedule-draft/library|studio`（内存草案save/clear回执），P10 `#schedule-request/library|studio`（pool/候选/horizon/单项入口），P12 compare及P13 async保留；恢复真实持久草案与发布资格归host，source旧workflow不迁入 |
| scheduling.vue 详情内facts/分段/链接/风险/缺口/负荷，plan readonly图/侧表/商业关联 | P15 `#schedule-saved/library|studio`；P11 `#schedule-snapshot/library|studio`；P14 `#schedule-day/library|studio`；history detail slot直接组合P15，不按同ID关联当前model |
| dev/SchedulingPreview.vue，schedulingPreviewData.ts，scheduling-preview.ts/html：order/resource、theme/readonly、维度/KPI/8色、里程碑/基线/四类保留块 | 新WorkbenchDemo两域中性preview；P04 `#schedule-gantt` 展示层级/基线/里程碑/分段，P05 `#schedule-resources/library|studio` 展示维度/零未知/KPI/块；P08 panels保留语义图例，不重写renderer。旧构建入口不恢复 |
| P01/P02/P03契约 | `#schedule` 时间线；P02纯model与P03host无独立屏，完整类型/签名按其合同继承 |
| P06/P07/P08 | `#schedule-edit/library|studio`、`#schedule-resource-edit/library|studio`、`#schedule-panels/library|studio`；本票全局导航直接可达并可回工作台 |
| P12/P13 | `#schedule-compare/library|studio`、`#schedule-async/library|studio`；不补前票算法或运行证据 |

导航回归测试使用 library 13个原入口；两域工作台分别运行组合测试。既有studio子页保留各自跨域入口；浏览器逐页点击/视觉/键盘尚 UNRUN，交独立runtime席。

## fresh / 继承 / FAIL / UNRUN / UNKNOWN

fresh 命令均显式 `node /Users/mang/.cache/node/corepack/v1/pnpm/11.22.0/bin/pnpm.cjs`，测试 `TZ=Asia/Shanghai ... exec vp test run` 精确路径。日志与JSON均保存在外部同目录。没有安装、没有改依赖。

- `tests-library-06.json`：24/24，failed=0、pending=0，success=True；对应进程 exit0。runtime/unhandled 字段缺失，均 UNKNOWN。
- `tests-host-04.json`：108/108，failed=0、pending=0，success=True；对应进程 exit0。runtime/unhandled 字段缺失，均 UNKNOWN。
- `tests-naming.json`：255/255，failed=0、pending=0，success=True；对应进程 exit0。runtime/unhandled 字段缺失，均 UNKNOWN。

RED 原件：`red-public.log`（缺主桶入口9失败，exit1）；`red-navigation.log`（只删除已盘点async导航目标，往返测试失败，exit1）；`red-navigation-mutation.txt`记录变异，finally恢复自有文件完全相同字节。GREEN为上述逐能力行为证据，不替代前15票的历史证据。

保留本席 FAIL：red.log首命令cwd路径错误；typecheck-host-01 exit2；green-02/green-03/green-host-02模板格式化移除多语句分隔后解析失败；tests-library.json、tests-*-failed-03.json保留失败报告。修复为具名函数后重跑。静态计数探针两次漏计inline {} snapshots=540，仅为探针错误；修正后973，完整lock字节比较始终相等。CSS parser/Rolldown/chunk警告原样留日志，不冒称浏览器样式通过。

依赖冻结：1358个lock/patch/vendor/migration/原64证据文件整体逐字节等base；lock5 importers/973 packages/973 snapshots完整对象及所有metadata/dep/peer/optional边由整文件相等证明，非只比key。Reka approved patchedDependencies与producer patch保留，四个活动包 Vue 3.5.39 解析到同一realpath（vue-identity.json）；未重新安装。vendor9.1.4 Professional Evaluation三文件/声明/水印未改，license UNKNOWN。

继承 P15 merger R3 收据与既有 P01–P15来源归属，仅在本票无diff的子件范围继承，不冒称fresh运行；历史FAIL/RAW2/globalfmt3旧同blob/docs schedule-model alias问题、timeout/TZ失败全部保留，未顺修。4既有vendor policy-skipped零执行非PASS，本票未运行vendor桶。fake/source：上述本地组件与导航使用jsdom、部分子件stub；prepared：类型检查及源码构建；packed #11、docs整站 #10、浏览器视觉/真实vendor/native、HTTP actual body、device、APS、CI/生产/发布均 UNRUN。旧四类应用接入/旧库退出取消 NOT_PLANNED。

本席无委派、无独立review、无ready/merge/验收评论/close/watch/发布。最终draft PR及checks/reviews精确回读交接外部 handoff，验收由父席安排。

最终增量检查：scheduling与playground类型检查、playground构建、scoped lint/fmt、git diff --check 均exit0；115个增量文档相对链接存在。源代码构建不代表实际HTTPbody或浏览器运行。
