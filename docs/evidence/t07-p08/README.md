# P08 / #91：图例、工具栏与八个详情/列表面板

R1 独立审查拒绝后的四项 P2 返修见 [F1–F4 记录](f1-f4/README.md)。下文保留首轮实施时点的原始结论与证据；其中“summary fresh browser UNRUN”等历史状态不覆盖返修轮的新证据，原 RED/FAIL/UNKNOWN 和 R1 拒绝也不被后续通过消除。

仅 implement-spec 步骤4，scope:M / 中至高难度，一个独立 draft PR。实际工作树 `/Users/mang/Project/nerv-ui-worktrees/t07-p08-panels`，分支 `feat/t07-p08-panels`；开工 clean，base integration `b56ef5f6ba4aada18190887335696864d13ad1d7` / tree `9bbad61c1e1cdb02d0364421d92c55af21ad10c3`。已 fetch + merge 最新 integration，结果 Already up to date，没有 reset。最终 head/tree/clean/PR 与清理和逐项 SHA 回读见 [本轮 handoff](/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-26/t07-p08-implementation-r1/handoff.md)。这是作者实施证据，不是独立 review 或父 #8 组合验收。

唯一 owner 为现有八个 panels 和 legend/scale 展示；没有改引擎、engine 事件/命令、loader/useEngine/Canvas、resourceProjection、P06/P07 编辑算法或 frozen migration/reference-adapters。保持包名、Nv 基元、默认旧字段与 public 事件；新增输入均可选。24 个手写源码/直接断言/合同与示例文件超过约15文件信号，但均服务同一已批准展示切片，没有架构/跨 owner 扩张；scope checkpoint 记录于外部测试工作笔记。没有自行 review、ready、merge、close、watch、发布或后继。

## 八件覆盖与接缝

| 现有件             | 本轮处置                                                                                   | 后继边界                                            |
| ------------------ | ------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| SchedulingToolbar  | 原 public 保留；全部动作、可选 label/disabledReasons、只读/busy 与搜索键盘守卫             | 宿主决定请求处理；不实现 P09 undo/草案/保存         |
| SchedulingLegend   | 原 public 保留；当前 model/view/scale/grouping 的真实展示语义，受控显隐与可限定开关        | category 由示例确实替换图面任务；其它语义不冒已过滤 |
| TaskFacts          | 原 public 保留；未选、空、0、unknown/forbidden/unavailable 与关联展开                      | 事实计算/授权属于宿主                               |
| TaskDetailPanel    | 原 public 保留；显示名、状态 Badge、0 分钟、外部更新/锁定请求/只读                         | 不派生风险/资格/业务状态                            |
| ChangeSummaryPanel | 原 public 保留；显式 task identity 优先、无歧义 legacy 关联、名称/资源/时间、筛选与 select | P12 提供变化与 before/after，不在本票计算比较       |
| ConflictPanel      | 按交互需要新增主桶导出；标签、禁用理由与精确 select                                        | P11 汇总/计算另票                                   |
| UnscheduledPanel   | 按交互需要新增主桶导出；中性文案、readonly/动作能力、既有 fix 二参身份                     | P09/P10 安排/资格/工作流另票                        |
| InspectorSheet     | 保留内部兼容包装并复用 TaskDetailPanel；公开 Sheet + readOnly Detail recipe 已真实打开     | 不新增第二套公共详情/时间格式器                     |

当前入口 `/#schedule-panels/library` 与 `/#schedule-panels/studio`，两个中性领域与旧入口往返。显示合同、完整 props/emits、默认值、能力责任和 InspectorSheet recipe 见 [面板合同](../../scheduling-panels.md)。风险、草案/table、比较、旧消费者、SDK/auth/router/持久化均未搭车。

## Requirement | Evidence

公开正式断言为 `frontend/packages/scheduling/src/components/panels/Panels.public.test.ts`，全部从主桶消费；宿主正式断言为 `frontend/apps/playground/src/SchedulePanelsDemo.test.ts`。浏览器脚本使用真实鼠标/键盘、公开控件/页面 DOM 与保留 vendor，没有调用私有 callback 伪造手势。下面浏览器阶段不是额外 Vitest PASS 数量。

| Requirement                                                    | Evidence                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 不列缺失图线/日历/时间块                                       | `public panel display contracts legend does not promise absent lines calendars or blocks without model evidence`；`red-legend.json` 捕获固定全量图例/无日历底纹，`green-legend.json` 与封存176PASS执行同一公开用例                                                                                                                                                      |
| Toolbar 只读、busy、无命中键盘与理由                           | `toolbar keeps read only actions disabled with reasons and does not navigate an empty search`；`red-toolbar.json`→`green-toolbar.json`；browser-09 `search-next-prev-clear` / `read-only-controls`；browser-12 `busy-disabled-reasons` / `readonly-actions` / `readonly-empty`                                                                                          |
| 各动作/props/emits/可选能力簇                                  | `toolbar emits each enabled public action and honors host capability reasons and optional clusters`；browser-10 `real-scale-小时/日/周/月` / `group-and-order-controlled`；browser-12 `zoom-current-fit-and-undo-redo-reasons` / `search-buttons-and-request-actions`。核对/确认真实记录请求，不宣称保存/求解；不可用 undo/redo 有明确理由                              |
| Facts/Detail 未选、0/空/未知/无权/不可用、同 id 更新与锁定回传 | `detail uses host display facts preserves zero and follows same identity replacement before a controlled lock`；`red-detail.json`→`green-detail.json`；browser-09 `lock-rejected` / `list-actions-and-external-update` / `replacement-clears-selected-object` / `empty-panels`；Sheet recipe 真打开并核内容，readonly 无锁按钮                                          |
| Change 不能借同旧字段的错误任务                                | `change rows resolve the selected identity rather than a coincident legacy pair after reorder`；`red-lists.json`→`green-lists.json`；稳定 taskId 定位资源，原始 operationId 不上屏；browser-09 真实点击变更行后详情跟随午间活动                                                                                                                                         |
| Conflict/Unscheduled 的当前 identity、重排/替换与动作能力      | `list actions use current host labels and identity and honor readonly and unavailable actions`、`list replacement and per row capability keep actions on current identities without inferred association`；browser-09 `list-actions-and-external-update` 真实 contact 记录为傍晚分享；没有把当前另一个选中任务记作待安排活动                                            |
| category 回传前不假过滤；资源连续窗口不套工单格点              | `legend visibility follows host acknowledgement and resource boundaries use continuous overlays at coarse scales`；browser-09 `category-host-applied` 为实际2→0→2条活动，清理选中与真实 bars；最终两实例/四刻度资源窗口均非零                                                                                                                                           |
| 真实小时相位与短窗口/粗刻度                                    | `legend follows the real vendor odd hour phase and omits blocks that contain no order grid cell`；`phase-red.json`/截图真实07/09/11…格点，shift=0/block=0但旧图例列出；`red-phase.json`→最终GREEN；browser-10 上海和 browser-13 Kolkata 各四刻度，工单 legend 与真实 shift/block/offwork逐项相等，资源连续窗口独立存在。旧 helper 两参近似保留，当前图例不再调用        |
| 零值保留但不承诺不存在的资源徽标                               | `legend does not label a zero changeover badge that the current resource card does not draw`；`red-zero-legend.json`→封存176PASS；Detail仍显示0分钟、数量0和0%                                                                                                                                                                                                          |
| 两领域可见组合与外部替换/清空                                  | `panel host selection lock and external replacements remain visibly tied to activity identity`、`panel host search no hit next previous clear and accepted category visibility change visible content`；browser-09 全流程，browser-13 nested工作坊、06:30任务时区和旧入口返回；记录显示活动/动作/绝对时间/结果，没有可见 raw JSON/operationId/taskId/接线/缓存/验收字段 |
| 选中回传不能重复请求                                           | browser-04 `12 !== 1` 是真实单次搜索重复记录 RED；分开用户定位请求与图面 selection 回传，最终 browser-09 单次搜索严格1条记录且实际 selected bar 在 viewport内；public engine 未修改                                                                                                                                                                                     |
| 两实例、主题/尺寸、路由清理与参考图例完整                      | browser-10 `two-instances` / `remount-reference-survives` / `theme-changed` / `narrow-layout` / `old-entry-return` / `route-cleanup`；browser-14 reference height360、legend bottom1226.92 > section1153.95为真实裁切RED；browser-15 GREEN reference/scroll/client均374、legend bottom=reference bottom。截图已实际查看，Evaluation水印保留                             |
| 真实503只读 native，与 vendor lane 分开                        | browser-13 `native-http503` / `native-actual-select` / `native-503-body` / `vendor-reload-recovered`；实际 vendor JS HTTP503 body留存，唯一 NvScheduleTimeline fallback、禁用未支持的刻度/缩放/定位、DHTMLX专属图例隐藏、只读详情无编辑。记录只说已选择，不假称reveal；reload后恢复vendor                                                                               |
| 公开类型/兼容、完整依赖与受影响前置                            | 独立 Consumer.vue 类型门禁；`raw/invariants.json` 全解析lock/importers/metadata/optional/peers/edges/Vue实体核；共享引擎完整字节同base；scheduling最终fresh执行P04 timer/private子root/同root retirement/async singleton/liveinvalid/baseline、P05 namespace/目录、P06/P07控制生命周期等既有正式用例                                                                    |

## 汇总节点封存增量

固定vendor `getSubtaskDates` 排除project汇总节点。`legend ignores stale summary dates when deriving the real operation hour phase` 的 `red-summary-phase.json` 捕获旧父节点08:00错误地改变子活动09:00的奇数相位；最窄修复只在scale展示推导排除 `type==='order'`，不改引擎。该用例在封存176PASS执行。此新增反例的fresh真实browser仍UNRUN，未把公开单元测试叫vendor conformance。

`raw/copy-proof.json` 比较保存的前一轮root/nested主JS与新构建，只有排除summary这一处条件插入；只规范明确OfficePreview/PdfPreview引用hash，不能用泛化hash擦掉语义。前述P08两领域没有order任务，resource连续窗口不调用此helper，因此只有限继承这些旧序列；不冒所有chunk或所有模型等价。完整suite先执行，再取copyproof；新的HTTP body、source/types/build单独fresh。

## 最终实际命令与身份

`raw/gates.json` 保存每个真实命令、显式cwd、开始/结束与进程exit；重复名称以最后时间对应最终产物，不把前次失败改作成功。`raw/validation.json` 保存每条真实名称/结果和失败suite消息。

- scheduling `scheduling-seal.json`：**180 discovery /176 PASS/0 FAIL/4原skip**；host封存 `host-seal.json`：**302 PASS/0 FAIL/0 skip**；docs-source最终 **6 PASS**。去重482行为discovery /478行为PASS/4skip，另docs6PASS。旧4个 `DhtmlxEngine conformance (requires @dhx/trial-gantt)` 实际 status=skipped、执行0；不叫厂商 conformance。定向 `-t` 产生的未选用例不当新增正式skip；无配置skip/exclude/timeout调整。reporter缺失 unhandledCount/unhandledErrors/errors/reason/runtime字段均为null，不补0或宣称未观测错误为0。
- frozen安装、workspace types、独立主桶Consumer.vue、root/nested build、21 frontend文本fmt、19源码/test lint和根文档维护均exit0。构建中的第三方PURE/chunk与CSS parse提示原样保留。布局改动后完整host重新302PASS，之后root+`/p08/`构建与五个浏览器脚本串行执行。封存前再补汇总节点排除这一行语义，新的180/176/4、host302、docs6、类型/root/nested构建为fresh；`copy-proof.json`严格限定这一行增量与声明的Office/Pdf chunk引用后继承前述不含汇总节点的P08矩阵，不称这些截图为新产物fresh。
- 末次实测 browser-09/10/13/12/15五runner均exit0，分别11/11/11/5/1观察阶段（不是39个独立AC）。真实`mousedown` isTrusted为true；error/rejection数组只覆盖观察安装后的窗口，首导航未观察保持边界。原生80%/125% zoom UNRUN；CSS viewport尺寸变化不冒原生zoom或DPR认证。
- root4308/nested4309各7个实际HTTP200：HTML、主JS、主CSS、runtime、vendorJS、vendorCSS、Inter字体；URL/MIME/bytes/SHA/body逐项等本轮freshdist，除末次主JS外均从真实browser performance清单核对应URL；末次主JS HTTP为fresh、浏览器序列由copy-proof限定继承。旧browser主JS body另存summary-phase-before-root/nested.js，不覆盖。`raw/response-identity-final.json`与`raw/responses/`原始body保留，不据此声明其余资源全部逐body或packed通过。另native503原body单列。
- 完整lock原字节与整个解析对象严格同base：973packages/973snapshots，所有importer/metadata/optional/peer/edge；四活动包实际解析同一Vue3.5.39。21项工程/engine/projection等完整输入同base。三vendor原JS/CSS/d.ts **891743/142723/211538bytes**及SHA同base，版权/Evaluation/水印/授权UNKNOWN不变。已有font transform、原CSS6 remote font-face和4内嵌dataURL、localInter5.2.8许可输入保留；实际请求没有外网字体。没有升级、换库、采购或剥水印。
- 原始main RAW历史exit2、本票RAW检查与维护检查分列；不删除或格式化日志/响应body修绿。最终stage检查结果与exact对象见外部handoff。

## FAIL、继承、未读与 UNRUN

全部原始RED/FAIL/UNKNOWN保留。`raw/diagnostics.json` 区分产品RED、示例类型/日期/旧相位断言、模板formatter收集失败、选错DOM/locator/同URL未reload、native额外文案过严等夹具失败。初次host收集失败原文件在覆盖前逐字节复制为 `host-collection-fail.json/.log`：290断言PASS、3suite零执行失败，不能称通过。早期host/build有约10秒资源席重叠，命令时间原样留存；其后host/layout/build/browser最终证据均串行。早期一条无依赖Python编辑直接用了python3，后续均uv；没有pip或全局安装，不改写命令历史。

T3先status/open/navigation，同一步两次原始 `Preview automation snapshot timed out after 15000ms.`，按技能转Ego Space78/p1；更新notice保留且未升级。Ego原始失败仍保留对应log/脚本，不把工具失败当产品RED。

P07 R1/P06 R2/P05 R2/P04 R4及研究仅以 `raw/history-pointers.json` 保留路径/bytes/SHA。旧UI/mobile整套、P02 pure/P03 prepared public-host与更早完整浏览器矩阵仅沿未改producer有限继承，不重计本轮PASS；旧FAIL/拒绝/UNKNOWN不被后来的通过覆盖。没有复制历史大目录。

已读当前各级指令、README/DESIGN/治理、live91/8/1/native依赖87、指定研究§3–7/§9P08和64路径附录、前置回执必要链；以当前八面板/公开consumer、模型/scale、当前引擎range/cell templates与保留vendor Ri()真实代码核事实，旧行号只作定位。没有逐字语义审全部约89万vendor/21万d.ts、22旧consumer、所有冻结材料与历史raw，不冒全量独立审计。

UNRUN：独立review、CI、完整docs10、packed11、device、旧consumer13/15、父8组合、SDK/真实APS、生产发布、商业授权、原生80%/125%zoom。P01共享提示/P02旧年/P03字号与ETA、43/51及P09/P11/P12和其它后继不搭车。#91/#8/#1保持open，PR18保持draft，仅返父安排独立merger。

本轮归档位于上述durable目录，只封存本轮报告、脚本、JSON/log、截图、14个200响应body与1个503body及历史指针；排除node_modules/cache/dist/cleancheckout/symlink，SHA清单逐项重新读取核验。封存不等于CI、审查、父组合或发布通过。
