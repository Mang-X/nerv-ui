# P08 / PR107：R4 资源图例范围与可见集合返修

同一资源 legend display owner，scope:M / 高难度，只实施 F10/F11 与同层直接字段。开工 head `222d0ec301598552bb36d206dac14ecd6359fa00` / tree `8123c4f452b1eeaf933b98dc008d610c0bcc8a21`，实际 worktree `/Users/mang/Project/nerv-ui-worktrees/t07-p08-panels`，branch `feat/t07-p08-panels`。base `b56ef5f6ba4aada18190887335696864d13ad1d7` / tree `9bbad61c1e1cdb02d0364421d92c55af21ad10c3`。最终对象与清理见 [handoff](/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-26/t07-p08-resource-visibility-fix/handoff.md)。PR107 保持 draft，独立 R5 留父安排。

原 [R4 拒绝、两轴、原始 probe 与两截图](/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-26/t07-p08-review-r4/review-receipt.md) 不改写。[F1–F4](../f1-f4/README.md)、[F5–F6](../f5-f6/README.md)、[F7–F9](../f7-f9/README.md) 是各自历史时点，所有 RED/FAIL/UNKNOWN 保留；这里不复制历史大目录。以下 raw/scripts/screenshots 相对本轮 durable 目录。

## Requirement | Evidence

| Requirement                          | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F10 资源归一范围                     | `resource legend includes the positive maintenance fragment before a non-hour horizon`：正式 `red-f10.json` 1 FAIL → `green-f10.json` 1 PASS，最终 suite 仍 PASS。原 UTC/hour horizon09:30–11:30、A09:45–10:45、maintenance09:00–09:15 输入 JSON 逐字相同：真实维护块 **166.75×279**，RED blocks=[]，GREEN blocks=[maintenance] 并显示“设备维护”；`browser-red.json` / `browser-green-originals.json` 及前后截图。                          |
| F11 资源实际 operations 集合         | `resource legend derives task statuses from projected operations while order retains its milestone`：`red-f11.json` 1 PASS/1 FAIL → `green-f11.json` 2 PASS，最终仍 PASS。原 A09–11 无冲突、M10–10 独立 milestone 有冲突：资源仅 A 非零卡片、无 conflict class，GREEN status.conflict=false；原 JSON 字节不变。增强同一测试让 M 带全部卡片/锁/风险字段，资源全部不列；切 order 保留 milestone/冲突；切回普通 operation 后全部可见标记保留。 |
| 四刻度背景与端点、零块、日历完整覆盖 | 四条精确名称 `resource legend clips positive blocks and calendar gaps to rendered hour cells`、`… day cells`、`… week cells`、`… month cells`，最终均 PASS。真实 `browser-resource-cells-final.json` **24**项：每刻度首/末正区间、背景外前后、零块、完整日历。图例 blocks/nonWorking 逐项与正几何 fragments 对照。                                                                                                                          |
| 真实资源 shift CSS 能力              | `resource legend suppresses the current unpainted shift stroke without changing order grid semantics` PASS。原例与当前实际节点 width0/computed border-left0，`shift-css.json` 保存匹配规则；资源 shift=false，不宣称可见线。原过强几何 FAIL 保留在 R4 目录，本轮不修 CSS/engine。两条旧资源 shift 期望据此更正；工单实际 cell stroke 保护保留。                                                                                             |
| 资源过滤、summary、KPI 的不同依据    | `resource legend uses retained lane KPIs and filters empty block-only and summary lanes` PASS：onlyScheduled 排除仅块/空泳道的过载与块；name 保留它们；summary/block flags 不贡献任务状态。finite0、Infinity/unknown、单资源与多资源 aggregate、缺 load 均有断言，不重新实现 KPI 汇总。真实 `browser-resource-fields-final.json` 对照过滤、正过载、0%、unknown 的实际资源头。                                                               |
| 轴外状态与真正可见 task0             | `resource legend omits off-axis flags and retains a visible zero-duration ordinary operation` PASS；真实普通零时长仍有 **3px** 非零细条和齐套0，轴外无该条且无冲突图例，不把 task0 当 block0。                                                                                                                                                                                                                                              |
| now 与背景/冻结分开                  | `resource legend now keeps horizon membership inside the larger normalized axis` PASS：原 horizon 两端包含、±1ms及归一轴外侧；真实四时钟与 marker 几何记录。`freeze-before-horizon-independent` 在归一首格有正几何冻结背景，未列成 block；无新增 freeze 图例字段。                                                                                                                                                                          |

十一条新增正式精确名称和 RED/GREEN 对应见 `raw/requirement-tests.json`。公共接缝仅主桶 `SchedulingLegend` 与 `deriveLegendSemantics`，测试不 mock projection 或 vendor 计数。

另有 `resource legend shares the board first-dimension default and explicit grouping replacement`：正式 `red-group-default.json` 10 PASS/1 FAIL → 最终 suite PASS，真实首次挂载默认 team / 显式 workCenter / team 三次切换逐项与资源头的过载标签一致。默认 groupBy 对应 Board 首次挂载的首个 groupDimensions key；不传维度时仍为 workCenter。Board 若已挂载并保留内部有效选择，宿主需给图和图例传入实际 groupBy；现有受控消费者已经这样接线，不改 P05 内部选择政策。

## 有限语义依据

- 共同前提仍为现有严格准入与显式时区、实际 rendered rows。categories 是独立宿主色板，缺失/非法图面不靠它造语义。
- 卡片 priority/rush/kitting/changeover、状态 conflict/locked/materialRisk/equipmentRisk：同一现有 P05 projection 的 operations，再按厂商任务轴去掉完全轴外任务；合成泳道不带任务冲突，summary/milestone/block 不混入。普通零时长及触及端点的 thin bar 保留；齐套0已知，换型0无badge。资源 gantt 三字段 false；order milestone 保留。
- 瓶颈：实际投影 lane.kpi 的有限 utilization>1，与 operation flags 是不同依据；不读整个原 resources/loads 猜过载，不改 P05 计算。
- 任务与 marker 用厂商归一轴；背景用模板实际 cell 的名义区间。UTC/hour09:30–11:30 的任务轴09–12，但末格模板11–13；week 的 day 单位轴末端也可能早于最后一个7天 cell 末端。`cell-end-diagnostic.json` 中12:00维护仍有 **5.5703125×279** 正几何。本轮准确跟随该现有绘制差异，不修改 engine/窗口优先级。块需正面积，日历非工作底纹覆盖完整 cell；freeze独立无图例字段；now还要求原horizon成员关系。完整 basis 同步到[当前合同](../../../scheduling-panels.md)。

仅修改 legend/scale 展示、两个公开测试文件和当前合同/证据入口。engine/factoryUnit、factoryTimeInstant、严格validator、command/lifecycle、P05projection/P06/P07 算法、lock与vendor字节不变；没有新公共 API、全仓架构或长期决策。八 panels/public/default/events/recipe 保留，UI字号/BadgeDot无修改，P09/P11/P12与P01提示/P02年/P03字号/ETA/#43/#51不搭车。

## Fresh / inherited / FAIL / UNRUN

Fresh 最终 scheduling **235 discovery /231 PASS /0 FAIL /4原stub skip**，host **303 PASS**，docs-source **6 PASS**。原4skip执行0，非真实vendor conformance；无新增skip/exclude/timeout。reporter缺失unhandled/errors/runtime为null，不补0。workspace types/root build、独立public Consumer.vue、受影响fmt/lint与维护检查见 `gates.jsonl`，第三方CSS/PURE/chunk告警原样留存。

Fresh 真实vendor：两个原R4输入、24背景场景、14资源字段/过滤/冻结/now场景及3次默认/显式维度切换、毫秒与六组order首命中、DST两个fold/春跳有限边界与三粗刻度、未解析时区/严格拒绝与独立色板、R3三原输入及少量summary/mixed/milestone保护。各自raw记录真实执行范围，不把观察数计为Vitest PASS。核心前后、末格、可见标记截图已查看；不冒全部历史截图重审。

最终 app7项/probe6项 HTTP status/MIME/bytes/SHA/body 与各自fresh dist及实际浏览器资源URL核对；probe无独立runtime chunk，具体清单见 `http-identity-final.json`。root nested build/browser本轮UNRUN，不用旧copy-proof覆盖本轮输入。默认分组浏览器首尝试复用了保留 workCenter 内部选择的 Board，与“首次默认维度”前提不符而FAIL；保留原观测，另以公开切换视图重新挂载后逐项证明首次默认与显式切换；内部选择政策不改。末次默认分组补强后重新构建root/probe并重放原R4两例与默认维度新例；此前24背景/14字段矩阵沿明确无groupDimensions的同一workCenter参数有限继承到末次四行参数修复，不冒重跑。完整lock原bytes/整个YAML对象同base：973 packages /973 snapshots，全部metadata/optional/peer/importer/actualedges不变；四包actualVue同一实体。三vendor891743/142723/211538bytes、Evaluation版权/水印、授权UNKNOWN、字体既有transform/locallicense保持，`invariants.json`。

准备/失败留痕：首次runner默认cwd错误；load时间窗字段patch误落task导致root-build types FAIL，纠正夹具后通过；初始背景端点假设被真实末格反例推翻，保留旧FAIL脚本与正几何诊断；两个浏览器尝试误重叠约0.933秒，这两项不采作最终证据，随后严格串行重跑且输出另名；T3正确导航后snapshot同一步两次原始超时再转Ego。额外artifact探针误要求每次导航都出现Evaluation弹窗，app与probe等待FAIL保留；app声明Evaluation/UNKNOWN、此前真实vendor水印截图及不变原字节另证，未改vendor或CSS；首次HTTP在artifact文件未写出前调用而ENOENT也保留。更新notice保留，不升级。原main RAW2 /ticket RAW2与本轮维护0分列为退出码，不清raw或格式化历史F1–F4 README修绿。

Inherited：R4的26准入/12marker/18summary完整矩阵、宿主收起/显式定位/search/lock/三列表/Sheet、完整native503/恢复、双实例/主题/尺寸，仅沿未改producer有限继承；本轮定向fresh另列。R4 archive逐项SHA核验，旧轮以其历史指针与既有核验为依据，不反复复制/重验全部历史raw。

UNRUN：独立R5、CI执行、完整docs10、packed11、device、旧consumer13/15、父8组合、SDK/真实APS、生产发布/商业授权、原生80%/125%zoom、本轮nested/native503/完整多实例主题尺寸。viewport/DPR不冒原生zoom。未逐字审核全vendor/d.ts、22旧consumer、冻结materials/reference与全部历史raw；本轮不是全仓审计。

无独立审查、ready、merge、close、watch、后继或发布。#91/#8/#1保持OPEN、107/18保持DRAFT、watching=false；交父安排独立R5。仅清本席PID/cwd服务、tab/Space与scratch链接，不删worktree；最终exact对象、未读清理与逐项SHA回读以handoff为准。
