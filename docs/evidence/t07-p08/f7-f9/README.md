# P08 / PR107：R3 三项 P2 图面准入与显示范围返修

同一 display owner，scope:M / 高难度，继续现有 draft [PR107](https://github.com/Mang-X/nerv-ui/pull/107)。本轮仅实施 R3 Standards 1 P2 / Spec 2 P2；独立 R4 由父代理安排。原 [R3 拒绝、两轴与三反例](/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-26/t07-p08-review-r3/review-receipt.md)、[F1–F4](../f1-f4/README.md)、[F5–F6](../f5-f6/README.md)和全部 RED/FAIL/UNKNOWN 原字节保留。

实际 cwd `/Users/mang/Project/nerv-ui-worktrees/t07-p08-panels`，branch `feat/t07-p08-panels`；开工 clean，head `1203b8a1ae805ebcfb043b6014cd0ec3a25005fa` / tree `3b842ca407e43b79696094a1f6eeb1e7a8aff4d0`。base `b56ef5f6ba4aada18190887335696864d13ad1d7` / tree `9bbad61c1e1cdb02d0364421d92c55af21ad10c3`；交付前 fetch + merge integration 为 Already up to date，无 reset。最终 exact 对象、PR 与清理见 [本轮 handoff](/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-26/t07-p08-render-range-fix/handoff.md)。下列 raw/scripts/screenshots 相对此 durable 目录，不复制历史大目录。

## Requirement | Evidence

| Requirement                                                 | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F7 / STD-R3-1：严格时间准入与无图语义一致                   | 六条 `legend strict diagram admission suppresses all semantics for invalid task nonfinite`、`… task no offset`、`… calendar`、`… baseline`、`… horizon`、`… segment`：公开 RED→GREEN；order/resource 全语义清空，显式 categories 独立保留且输入不改。原 baseline+locked 模型逐字重放：RED 无 engine/bar 却列锁定/现在；GREEN engines=[]、bars=[]、legend=''。原四种 invalid 模型两视图及色板共16次真实观察，见 `browser-strict-admission.json`。                                                                                                                                                                                                        |
| F8 / SPEC-R3-1：全 project 专用范围，保留混合模型排旧父日期 | `legend uses the first project one-hour extent for an all-summary order diagram`：RED→GREEN；范围以首个 project 开始加一小时后按刻度扩展，非全部父日期极值。原 only-summary 输入逐字重放，真实 project 非零，头07/09/11/13、shift1、maintenance1，GREEN 图例同时列班次/维护/非工作。`legend uses non-project dates for summary with operation instead of stale project dates`、`… order milestone …` 及 `legend does not derive order semantics for empty or block-only input` 均 GREEN。16次真实 no-child/project-child/operation-child/order-milestone × 四 scale（含 .123）逐项对照 DOM，再验 empty/blocks-only；`browser-summary-boundaries.json`。 |
| F9 / SPEC-R3-2：“现在”同时属于 horizon 和实际显示轴         | 五条 `legend now follows order display range at before axis while resource follows horizon`、`… axis start …`、`… inside axis …`、`… axis end …`、`… after axis …`，以及 `legend now requires horizon membership even when the order axis includes the instant` 均 GREEN。原轴外模型逐字重放，RED 图例now=true但markers=[]；GREEN图例空且markers=[]，真实operation非零。同一页面共同时钟驱动 engine 与 Legend，order07:00/15:00端点及轴内marker1，轴外marker0；resource同五时刻均marker1；全summary14:00端点marker1、+1ms为0。`browser-marker-axis.json` 的12项逐项语义/实际marker几何相等。                                                            |

16条新增精确名称和逐条 RED/GREEN 状态见 `raw/requirement-tests.json`；最终正式公开55 PASS。修复前最终版本44 PASS /11 FAIL，修复后55 PASS；无新增 skip/exclude/timeout。旧29条 finding 断言重新按精确名字从当前 suite 抽取，全部 PASS，见 `original-six-formal-regressions.json`。旧 RED 属旧时点，不冒本轮新 RED。

## 展示等价与有限字段准入核对

- 共同前提：model 存在、显式时区可解析、现有 `hasInvalidModelTime` 接受、当前视图有 rendered rows。strict validator 原字节不改，消费其 horizon/tasks/segments/calendars/已提供baseline 的 UTC/offset 有效 instant 准入，不新定日期顺序/DST/业务政策。
- 甘特 `baseline/link/milestone`：现有 operation baseline、link端点和 milestone 输入继续沿当前路径；外层 strict gate 在任何一类实际时刻被拒绝前清空整组。资源面板仍隐藏甘特专属组。milestone 的实际轴结束使用开始，order+isMilestone 优先作为非project。
- 卡片 `priority/rush/kitting/changeover/bottleneck`：资源视图沿现有 resourceProjection 的 operation 集合；0换型仍不声称badge。资源/loads字段及投影不改；严格拒绝或无泳道时不推导这组。卡片在order面板仍隐藏。
- 状态 `conflict/locked/materialRisk/equipmentRisk`：保留现有当前任务/operation事实消费；strict拒绝不再允许任一状态绕过无图前提。未重定义业务风险或权限。
- 块 `blockKind/resourceId/workCenterId/startUtc/endUtc`、日历 `resourceIds/workCenterIds/shiftWindows`：继续复用当前显式namespace、工作中心日历优先、工单首命中与资源连续区间；工单格点和marker轴界来自同一个 `orderDisplayScale`。不改任务、engine、时钟服务或P05投影。
- `now` 是图例采样参数，不是 engine 同步输入；本轮确定性浏览器夹具在页面同时替换 Date/Date.now 后再更新model。`browser-marker-axis.json` 的 observed/clock 为测试时钟；真实原反例观测时刻分别在 RED/GREEN 原输入记录内。时钟准备失败读回保留，不据不同步clock推产品缺陷。默认图例重新计算时采样，不承诺live worker或viewport滚动后可见。
- `categories/hiddenGroups/toggle-category` 是独立受控色板与请求；无图时categories可保留，绝不据它宣称图已绘制/过滤已应用。loading/收起/vendor-native能力由现有host组合条件负责。本轮未审计全部引擎模板、业务字段或全仓消费者。

只改P08 model/scale/legend、同一公开断言、注释与合同/证据入口。八panels/default/events兼容；engine/factoryUnit、业务factoryTimeInstant、command/lifecycle、P05projection、P06/P07、冻结migration/reference/旧源均不改。P09/P11/P12、P01提示/P02年/P03字号、ETA、#43/#51不搭车。UI无技术验收JSON，Badge/Dot字号无变化。

## Fresh / inherited / FAIL / UNRUN

Fresh串行：scheduling224 discovery /220 PASS /0 FAIL /4旧stub skip（0执行，非真实vendor）；host303；docs-source6；workspace types/root build；独立公开Consumer.vue类型；受影响fmt/lint。最后仅增强测试夹具与纠正link类型枚举；runtime生产源码与已构建/浏览器验证输入不变，最终suite/types另重跑。逐report suites/assertions与退出码核对，缺失unhandled/errors/runtime保留null。CSS/PURE/chunk告警原件保留。

Fresh真实vendor：本轮三反例、严格拒绝两视图、12个共同时钟marker边界、16个summary边界；R1毫秒/首命中/identity、两时区四scale×两视图16组合；R2两个fold及春跳有限16小时/三粗刻度、同字节unresolved两时区×两视图与独立色板；library收起/重显/显式定位与公开宿主路径。核心三反例与marker截图已查看，实际bar/marker/cell几何记录，不以fakecount代替。其余完整历史矩阵、native503/恢复、全双实例/主题/尺寸仅沿未改producer有限继承。

app7项/probe6项实际HTTP200逐body/MIME/bytes/SHA等于本轮各自fresh dist；probe无独立runtimechunk，不造第7项。nested未重建或浏览器，UNRUN。完整lock bytes/YAML对象同base，973 packages/snapshots的metadata/optional/peer/importer/edges不变；四包actual Vue为同一实体；vendor891743/142723/211538bytes、Evaluation版权/水印与授权UNKNOWN、字体既有transform/locallicense保持。

历史原实施246、R1审查75、F1–F4返修204、R2审查101、F5–F6返修136、R3审查95项SHA逐项回读不变，见 `history-verification.json`。原拒绝/RED/FAIL/UNKNOWN、上轮types/test重叠与准备失误均保留。本轮初次multi-file patch原子失败、缺helper的提前GREEN尝试、全summary端点夹具13→14、增强夹具link枚举FS→finish_to_start类型错误、public consumer临时依赖路径、资源隐藏父行等待、跨进程时钟注入失败均留原件及说明。T3 snapshot同一步两次原始超时后才转Ego，未升级。main RAW2 / ticket RAW2 /维护0是退出码，非错误条数；不清raw修绿。

独立R4、CI、完整docs10、packed11、device、旧consumer13/15、父8组合、SDK/真实APS、生产发布/商业授权、原生80%/125%zoom、本轮nested fresh build/browser均UNRUN；viewport/DPR/visualScale不冒原生zoom。未逐字审核全部vendor/d.ts、22旧consumer、冻结材料或所有历史raw。三个指定异议已有实施/公开断言/真实DOM证据，仍待父安排独立R4，不宣称审查material0。

清理与最终SHA逐项回读见handoff；只清自己PID/cwd、tab/Space和临时链接，恢复TZ/尺寸/zoom状态，不删worktree。root/main与旧源只读；#91/#8/#1仍OPEN，107/18仍DRAFT，watching=false。无独立审查、ready、merge、close、watch、后继或发布。
