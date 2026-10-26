# T07/P12 / #95 实施证据

级别 **M**，单一 draft PR；难度高，地雷是 semantic 活动与 assignment 实例身份、分段变化及已保存基线污染。起点为 integration `4e41611aa926ea6c185dd484f2d08278699f4959` / tree `92b9d014d3f123cd00d9771411e1711d93030901`，目标 worktree 为 `/Users/mang/Project/nerv-ui-worktrees/t07-p12-snapshot-compare`。本票独立 AC 是公开中性快照与两域读面；独立 merger、ready、merge、close、watch 和父 #8 组合均不由实施席执行。

## 来源与边界

冻结 Nerv-IIP `79b1578f2b75f55709765b5e7882aaf33146c603` 中，`ScheduleRevisionReview.vue` 是 app 私有的 revision/basePlan DTO 页面，`SchedulingPreviewResult.vue` 是私有 plan DTO 页面；其三个直接私有消费者和排程页见 [比较合同](../../scheduling-comparison.md)。P12 只在活动 scheduling 包公开中性组件及比较函数，并在 playground 组合两个中性领域。P08 `ChangeSummaryPanel` 只加可选双侧实例 ID，旧省略签名仍保留；P11 风险/冲突/缺口件直接复用。业务 KPI、风险、APS、SDK、认证、持久化及冻结 migration 未搬入。DHTMLX 9.1.4 Evaluation vendor 与授权 UNKNOWN 不变。

## AC → 公开测试 → 浏览器

| AC                                                                                           | 精确测试名                                                                                                                                                                                                                                | 最终读面                                                                                                                      |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 同 semantic 换 assignmentId 非新增；旧 pair 与同 ID 跨快照不得错配；当前选择按 semantic 发回 | `public snapshot comparison keeps one semantic activity when assignment ids change and ignores matching legacy pairs`                                                                                                                     | library 逐行“已调整/候选待安排/新增”，选择当前活动后显示“晨间共读 · 林间书屋”                                                 |
| 仅时间/资源/segments 变化显示双侧；added/blocked 缺侧不编完工时间                            | `public snapshot comparison shows time resource and segment changes on both sides without inventing blocked or added completion`                                                                                                          | table 与 P08 摘要均显示两侧资源/实际时间；分段折叠可读；候选待安排显示“完工时间未提供”                                        |
| 已保存基线不受未保存草案、预览与外部候选深改影响；替换/空/只读/失败状态                      | `neutral library unsaved draft and preview cannot mutate saved baseline while replacement and readonly stay current`；`neutral studio unsaved draft and preview cannot mutate saved baseline while replacement and readonly stay current` | 最终 dist 的 library：基线始终 `2026-11-02T01:00:00Z`，候选先后 `02:00/05:00/06:00Z`，分段起点与候选同步；空/不可读取无旧差异 |
| 缺 KPI ≠ 0、真实 0 保留；候选来源/风险不假 ready                                             | `public snapshot comparison keeps missing KPI distinct from a true zero and refuses ambiguous semantic keys`；`public snapshot comparison reads candidate facts and source state without deriving a ready result`                         | `— → 0`、`0% → —`；P11 风险/冲突可见，来源写“尚未保存或发布”                                                                  |
| semantic 与实例重复拒绝，时间不猜本地时区                                                    | 同上 KPI/identity 测试；`public snapshot comparison keeps readonly items, literal outcome and missing metric value in the public type`                                                                                                    | 重复/缺失身份及无 offset 时间显示错误，不按 legacy pair 或浏览器时区猜                                                        |
| 两领域 deep link、旧路由往返、窄宽和主题                                                     | `neutral library comparison deep link shows semantic changes and returns to old surfaces`；`neutral studio comparison deep link shows semantic changes and returns to old surfaces`                                                       | library/studio、桌面与草案往返；390px 文档无横溢；亮暗/蓝色主题切换并恢复                                                     |
| 基线已有 semantic 活动但尚无 assignment，候选首次排入仍不算新增                              | `public snapshot comparison keeps an existing semantic activity when its baseline had no assignment`                                                                                                                                      | 公共比较返回 `changed`；无额外浏览器 fixture                                                                                  |

## RED、GREEN、FAIL 的原始顺序

- 初始公开入口 `comparison-red-r1.json`：1 discovery / 1 FAIL，入口尚未导出。第一轮 `comparison-green-r1.json` 为 SFC 语法错误、**0 执行**；修正后 `comparison-green-r2.json` 为 1/1 GREEN。随后 `comparison-expanded-r1.json` 3 PASS / 1 FAIL 是测试选择器把分段也计入首行时间；修正选择器后 `comparison-expanded-r2.json` 4/4。上述失败未覆盖。
- 受控 mutation 让 P08 双侧关联退回单一 `taskId`，`identity-red-mutation.json` 的身份样本 FAIL；让草案预览写入 baseline，`baseline-red-mutation.json` 的 library/studio 两样本 FAIL。脚本 `mutation-probes.py` 在 `finally` 中恢复两个文件并逐字节 SHA-256 回读，随后 `identity-green-after-mutation.json` 与 `baseline-green-after-mutation.json` GREEN。此为针对反例的故障注入，不冒充冻结旧 app 的运行。
- 同快照重复 assignment ID 与无 offset 本地时间各自先 RED：`duplicate-assignment-red-r1.json`、`local-time-red-r1.json`；实现拒绝后 `duplicate-assignment-green-r1.json`、`local-time-green-r1.json` GREEN。
- 基线同 semantic 但未获 assignment 的公开反例先 `blocked-baseline-red-r1.json` FAIL（旧实现误为 `added`），再 `blocked-baseline-green-r1.json` GREEN。
- 首次不设 TZ 的 scheduling 整包 `scheduling-full-r1.json` 是 **307 PASS / 1 FAIL / 4 pending**，失败是既有快照测试要求 Shanghai/New_York，环境给 `undefined`。显式 `TZ=Asia/Shanghai` 后同树完整报告另列；不抹掉首轮。
- playground 默认并行完整报告 `playground-full-r4-final.json`、`r5-final.json` 各 **328 PASS / 1 FAIL**，同一既有 `DraftEditingDemo` 样本在 5 秒超时；`draft-timeout-focused-r1.json` 单独通过。随后 `--no-file-parallelism` 完整 `playground-full-r8-final-serial.json` **329 PASS / 0 FAIL**。保留默认并行不稳定作为未决门禁风险，不改该 owner 的测试超时或行为。

最终完整 scheduling `scheduling-full-r6-final.json` 为 **313 discovery / 309 PASS / 0 FAIL / 4 pending vendor stub skip**；playground `playground-full-r8-final-serial.json` 为 **329/329 PASS**。两份 JSON 的 `success: true`、exit 0、`unhandledErrors` 字段缺失按原样报告。4 个 skip 不是 real vendor PASS。scheduling/playground `vue-tsc --noEmit`、目标源码 lint、playground `vp build` exit 0；build 仍有继承的 Rolldown PURE 注释和大 chunk 提示。

## 真实浏览器与资源

最终 `vp build` dist 用 `127.0.0.1:5195` preview，由 ego-browser 在同一 TaskSpace 检查。T3 `preview_snapshot` 同一步两次原文为 `Preview automation snapshot timed out after 15000ms.`，按规则切换。前轮浏览器复用旧 hash JS，曾看到更新外层时间但旧分段；用独立 URL 查询串强制取新 `index-*.js` 后复核。390px 初轮实测页面宽 1256px，原因是候选甘特容器溢出；加局部横向滚动后最终 `browser-checks-r9.json` 为 390px / 无文档横溢。两次黑色截图是未等两帧绘制的采集失败，最终 `studio-390-top-r11.png` 可见。

最终资源 `http-final-r3.json` 对 dist 的 HTML、主 JS/CSS、Rolldown runtime、Evaluation JS/CSS 及一份字体逐项 GET：7/7 status 200，MIME 符合，响应 body 与最终 dist 本地文件逐字节相同，SHA-256 逐项记录。`browser-checks-final-r13.json` 明确使用最终 dist 的 `index-BbPBC5C2.js`，验证 library/studio、草案基线隔离、替换/空/失败/只读/主题状态、单侧缺值与 390px 无横溢；最终 dist 未取得可用视觉截图，视觉样张只取前一 dist 的 `studio-390-top-r11.png`，不把它称为最终 dist 视觉 PASS。该证明只覆盖本地 preview 的已列资源，不是生产发布或商业授权。

## 不变项与未运行

`invariants-r1.json` 逐项回读 16 工程输入与 vendor JS/CSS/d.ts 对基线字节相等；锁 SHA-256 `0cfcb1cc92892690db8aa848165280a49941f0cf8d7b868c721e641e4634ab07`、完整 YAML 对象相等，含 5 importer / 973 package / 973 snapshot 及完整边/peer/optional；scheduling/playground Vue 指向同一 `vue@3.5.39_typescript@6.0.3` 实体。冻结 migration 相对基线无 diff。历史 `main...HEAD --check` RAW exit 2 与本票维护 diff-check 分列，不格式化 raw/vendor/migration。

CI、docs #10、packed #11、device、旧 consumer #13/#15、父 #8 全组合、真实 APS、生产、授权、原生 zoom 均 **UNRUN**。来源旧库静态可读不等于实际旧 consumer 通过；UI 比较不等于 APS 判定。完整原始日志、截图、HTTP manifest、最小源码 archive 与最终 SHA 回读在外部 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-27/t07-p12-implementation-r1/`。

PR110 后续两轮 material 返修分别见 [R1 返修](f1/README.md) 与 [R2 返修](f2/README.md)；上述实施 R1 数值保留其原始时点，不被后续门禁覆盖。
