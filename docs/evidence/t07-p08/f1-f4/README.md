# P08 / PR107：R1 四项 P2 返修

仅 implement-spec 返修，展示 owner scope:M。原 R1 Standards 1 P2 / Spec 3 P2 拒绝永久保留：[原回执](/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-26/t07-p08-review-r1/review-receipt.md)。本轮实施、断言和浏览器取证不代表独立 R2 批准；R2 由父代理安排。现有 draft [PR107](https://github.com/Mang-X/nerv-ui/pull/107) 继续承载本票。

实际工作树 `/Users/mang/Project/nerv-ui-worktrees/t07-p08-panels`，branch `feat/t07-p08-panels`；开工 HEAD `1602470f960d747988965a27a5666bb6cdd2e468` / tree `e1e55287a97f48fee514b1d06718a13c38e1d9b2`，clean。交付前 fetch + merge 最新 integration，仍为 `b56ef5f6ba4aada18190887335696864d13ad1d7` / tree `9bbad61c1e1cdb02d0364421d92c55af21ad10c3`，Already up to date，没有 reset。最终 head/tree/clean、命令、原始响应与逐项 SHA 回读见 [本轮 handoff](/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-26/t07-p08-contract-fix/handoff.md)。

本轮只改示例能力反馈、scale 展示归一、legend 展示优先级与 ChangeSummary 身份。八件面板、原 public/default/event 保留；没有改 engine/commands/lifecycle、P05 projection、P06/P07 算法、业务输入时间转换、冻结 migration/reference 或旧消费者。P09/P11/P12、P01 提示/P02 年份/P03 字号与 ETA、#43/#51 没有搭车。

## Requirement | Evidence

正式公开断言仍位于 `Panels.public.test.ts`，只从主桶消费；宿主断言位于 `SchedulePanelsDemo.test.ts`。下文 `raw/` 均相对于本轮 durable 目录 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-26/t07-p08-contract-fix`。

| Requirement | Evidence |
| --- | --- |
| STD1：图收起时不能假称定位，详情选择与重显后的定位路径明确 | `panel host collapsed selection keeps details and requires explicit relocation after showing the chart`，`red-std1.json` → `green-std1.json`；browser-09 的 `collapsed-selection-honest` 为 engines=[]、定位禁用、详情为晨间共读；`remount-awaits-explicit-relocation` 为 selectedBars=0 且提示重新定位；`actual-relocated-geometry` 为 activity-a、bar 310×22、viewport 内，文案“已请求定位”。`screenshots/receipt-collapsed-green.png` / `receipt-restored-located.png` 已查看。原反例复制到 `original-probes/raw/collapsed-reveal.json`，未覆盖。 |
| SPEC1：小时毫秒格点与真实 scale 归一，保留业务编辑毫秒 | `legend follows millisecond display cells in Asia/Shanghai offset +08:00 scale hour without changing edit instants`、`legend follows millisecond display cells in Asia/Kolkata offset +05:30 scale hour without changing edit instants`；`red-spec1-normalization.json` 6 PASS / 2 FAIL → `green-spec1.json` 8 PASS。day/week/month 的六条精确名称见 `raw/requirement-tests.json`。browser-04 毫秒 09–11：真实 07/09/11/13 头、shift=1、图例班次=true；browser-05 两时区×四刻度×工单/资源共16组合逐项对照。当前保留粗刻度转换保留毫秒相位，未擅改引擎；编辑 no-op 保留原 offset 与 .123。 |
| SPEC2：按当前首命中优先级列块，不改变业务/engine 顺序 | `legend block priority matches order cells for 'first complete overlap'`、`legend block priority matches order cells for 'reversed complete overlap'`、`legend block priority matches order cells for 'partial both'`、`legend block priority matches order cells for 'partial reverse'`，以及 `legend block priority respects separate lanes and resource before work center across replacements`；`red-spec2.json` 4 FAIL / 1 PASS → `green-spec2.json` 5 PASS，后续只缩短两条 case label 使 reporter 不截断。最终完整 suite 执行上述最终名称。browser-04 六组真实 DOM：全重叠维护优先 1/0、交换 0/1、部分 1/1、部分反序 0/2、不同泳道 1/1、资源优先于工作中心 0/1，逐项等于 public semantics；原合法 type:operation 反例原样保留。 |
| SPEC2：空、过滤、替换与资源连续叠层不退回 | 上述 `legend block priority respects separate lanes and resource before work center across replacements` 直接断言 tasks=[]、过滤到其它泳道、替换与输入不变；`legend keeps overlapping resource overlays at coarse scales while order cells retain first hit` 保留资源月刻度两类叠层。browser-05 资源16矩阵中的8组连续块有实际非零宽度，工单与资源规则分开。 |
| SPEC3：明确 id 失配、移除、重排、替换不得借另一个 pair 任务 | `change explicit identity never borrows replacement legacy pair facts or actions`，`red-spec3.json` → `green-spec3.json`；A/B 同 pair 重排仍 A，替换为唯一 B 或空集合后无 B 资源/时间且动作禁用；原输入不变。browser-04 identity：id=activity-a、disabled=true，仅保留 A 的两个 before time，events=[]，不出现 B专用空间。 |
| SPEC3：只有未提供 id 的历史记录可以唯一 legacy 展示，空 id 不回退 | `change legacy association requires an omitted identity and one matching pair`；唯一/重复/重复重排/无匹配/显式空字符串/不提供 tasks 的兼容动作均有直接断言，旧二参事件及其它公共默认不变。空字符串为显式空身份，不能定位；undefined 才表示历史无身份。 |
| 不回退 summary 排除、无 cell 短块、零徽标与资源连续窗口 | 最终 suite 保留 `legend ignores stale summary dates when deriving the real operation hour phase`、`legend follows the real vendor odd hour phase and omits blocks that contain no order grid cell`、`legend does not label a zero changeover badge that the current resource card does not draw`。browser-05 summary/短块：07/09/11…、shift=0、block=0、图例均不列；资源实际卡片 text 不含换型0m，图例 changeover=false。raw 中未使用的 zeroBadge selector 计数不作为证明。 |
| 受影响组合与真实 native 能力 | browser-09：搜索无命中/下一/上一/清空、单次请求新增1条记录、选中真实几何、锁定采用/保留、外部更新/替换、Conflict/Unscheduled/Change 与 readonly Sheet、category 实际2→0→2并清选择。browser-10：双实例、四刻度、分组/排序、重挂载、主题、窄宽、旧路由往返与清理。browser-11：工作坊真实 Kolkata 四刻度，vendor HTTP503/body39bytes、唯一 native、定位禁用理由、只读详情及 reload 恢复。native、fake、real vendor、APS 分列。 |

## Fresh 与产物

- 最终串行 scheduling：196 discovery / **192 PASS / 0 FAIL / 4 原 skip**；host **303 PASS**；docs-source **6 PASS**。4 条 `DhtmlxEngine conformance (requires @dhx/trial-gantt)` 为 skipped，执行0，不是 real vendor conformance。`raw/validation.json` 保存 reporter 原值，缺字段为 null；不加 skip/exclude/timeout。
- workspace types/root build、最终产物 build、6文件 fmt/lint 与维护检查通过；原始 CSS/PURE/chunk/crypto externalized 告警保留。初次 types 与 scheduling 约12秒重叠原样留存，后续 build（含 types）→串行 scheduling→浏览器提供最终串行证据，不改写历史。
- 成功浏览器 runner 为 browser-04/05/09/10/11。观察阶段不加算 Vitest PASS。主页面7项和最终 public probe6项实际 HTTP200：HTML、主JS/CSS、vendorJS/CSS、Inter，以及主页面独有 runtime；URL/MIME/bytes/SHA/body 与各自 fresh dist 全等，见 `http-app-final.json` / `http-probe-final.json`。最终主JS 1007070bytes，probe主JS336253bytes；最后格式化后重build主页面7项仍逐字相等，`final-artifact-equality.json`。没有拿旧14 body或旧矩阵冒本轮四反例。
- probe 是外部 public consumer，使用当前主桶与真实 vendor，额外构建只将 Vue 指到宿主同一真实3.5.39实体；没有厂商 stub。probe 没有单独 runtime chunk，不捏造第7项。外部夹具350px阶段截图/响应保留，之后调整为400px并重build重跑相同核心断言，最终截图完整。
- 完整 lock 原 bytes/YAML 对象均同 base：973 packages / 973 snapshots，全部 importer/metadata/optional/peer/edges；四活动包同一实际 Vue3.5.39。三 vendor 891743/142723/211538bytes/SHA、版权/Evaluation/水印、授权 UNKNOWN 与字体 transform/local license 策略保持。未升级或安装依赖。

## 历史、限制与交接

原作者246项与 R1 reviewer75项 SHA 全部回读相同；历史只留路径/bytes/SHA，四反例 scripts/raw/截图另复制到 original-probes，原断言/观测不改。原全部 RED/FAIL/UNKNOWN、R1拒绝、main RAW2 / ticket RAW2 原日志空白保留；本轮维护检查0。首轮176/4、host302、docs6及其旧矩阵仍属于各自时点，本轮新证据另列。

准备/夹具失败原件全部保留：T3首次访问未启动端口被拒绝，正确端口上 snapshot 两次原始超时后转Ego；外部probe的 /tmp realpath 与裸Vue解析两次构建失败；初始粗刻度毫秒预期被真实厂商观察纠正；host runner相对import、已选中导致下一搜索命中不同、跨runner的instrumentation缺失、fs写出API错误均单列 `raw/diagnostics.json`。最终 runner 没有增 timeout、删断言、skip 或改产品来修绿。Ego有更新提示，未升级。

UNRUN：独立R2、CI、完整docs10、packed11、device、旧consumer13/15、父8组合、SDK/真实APS、生产发布、商业授权、原生80%/125%zoom、本轮nested fresh build/browser。CSS viewport和visualScale不冒原生zoom。首轮独立Consumer.vue类型证据按未改类型入口有限继承，本轮未重跑该独立消费者。没有逐字审核全部vendor/d.ts、22旧consumer、冻结材料、所有历史raw；当前 producer、公开消费位点和本轮反例为边界。

只清本轮PID/cwd服务、Ego Space80与自有T3 tab；TZ/尺寸恢复，visualScale1，路由清理后engines/tooltips/ghosts均0。不删worktree，不写root/main/旧源。#91/#8/#1保持OPEN、PR18与PR107保持DRAFT、watching=false。未执行独立审查、ready、merge、close、watch、发布或后继。
