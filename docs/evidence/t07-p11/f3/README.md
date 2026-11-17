# P11 / PR109 R3 Standards P3 返修（F3）

本轮只处理 #94 四件中的 legacy 批次技术值直接展示。指定 base `c0f6e41421da5aaeb38e07474413a06b78c2ea0c` / tree `d914c0d1668d786ff587ded0f0af89428b862b42`；开工 HEAD `671c7146c170156b68edd0f814e80a513f025e30` / tree `2fd0f013f35c84a7484c2162f95a543c6d37b4fe`，clean。最终 HEAD、tree、远端回读与归档清单记录在外部 `t07-p11-risk-batch-fix/handoff.md`，避免提交内自引用。

## R3 finding 与四件同类路径审计

| 组件                      | legacy 批次直接展示路径                                                                        | 本轮结果                                                                                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MaterialShortageSummary` | `shortages[].materialLotId` → `legacyShortage().batch` → 表格批次行                            | F2 已按有值 legacy 技术编号使用 `font-mono text-xs text-muted-foreground`；显式 `display.batch` 保留自然语言样式。本轮正式回归和 Chromium 重新核对。                        |
| `PlanRisks`               | `materialRisks[].shortages[].materialLotId` → `legacyShortage().batch` → 类别/组展开后的缺口行 | **R3 新 Standards P3 已修**：只给有值的 legacy 批次片段加上述三类；宿主 `display.batch` 自然语言仍为 sans/14px；缺失批次仍是 `—`。物料、数量、单位、需求/可用量及活动保留。 |
| `PlanConflicts`           | 无 `materialLotId` / `batch` 输入或直接展示                                                    | 此规则无适用批次路径；不顺修 R1 继承的活动/动作重复代码建议。                                                                                                               |
| `ResourceLoads`           | 无 `materialLotId` / `batch` 输入或直接展示                                                    | 此规则无适用批次路径；资源负荷与零/未知口径未改。                                                                                                                           |

扫描以本票四件当前代码、`snapshot.ts` 映射及公开主桶为界；不推断全仓其它 owner。legacy/display 优先规则、外部替换、props/events 均未变，没有新增运行 registry、APS 算法、SDK/auth 或持久化。

## 公开 RED → GREEN 与浏览器

公开接缝为 `@nerv-iip/scheduling` 主桶。正式测试 `styles legacy batch codes in summary and risk details while keeping host batch labels natural` 同时断言汇总与风险的 `LOT-9` 技术值类、宿主“秋日一批”自然语言类，并核风险缺失批次 `—`、零数量及外部替换去旧值。修前筛选运行 0/1 FAIL（其它 13 项未运行）；修后筛选 1/1 PASS，最终整份 `snapshot.test.ts` 14/14 PASS。三份 JSON 均**缺少** `unhandledErrors` 字段；控制台 `Could not parse CSS stylesheet` 提示独立保留。原 R3 浏览器 sans/14px 和历史 FAIL 不改写。

T3 preview `status → open` 后，同一步 snapshot 两次原文均为 `Preview automation snapshot timed out after 15000ms.`，转 ego-browser。临时源码主桶消费者在真实 Chromium 390 CSS px 下展开类别/组：汇总、风险两处 legacy `批次 LOT-9` 均计算为 monospace/12px；两处显式 `display.batch='秋日一批'` 均为 sans/14px；可见 `ORDER-7 · OP-2`、`3 张`，两状态 `documentElement.scrollWidth = innerWidth = 390`。已验证窄屏图：[legacy](browser-legacy-390.png)、[宿主自然语言](browser-host-390.png)。第一次详情截图在新浏览器进程恢复宽视口后取得，外部原文件保留但不用作 390 证据；随后显式重设视口并重新截图。临时消费者已移除。

## 证据边界

本轮 scheduling/playground 类型检查、playground build 和定向源码 fmt/lint 另在外部 handoff 逐命令记 exit。最终 fresh dist 的四响应 HTTP body 与 dist 字节核对亦记在外部 `http/manifest.json`；旧 CSS/JS 与本轮不同，不用整套历史矩阵作同产物继承。锁、Vue 身份、冻结 migration 与 vendor 只做本票影响审计，不升级依赖或更改 DHTMLX 9.1.4 Professional Evaluation 声明/水印；商业授权 UNKNOWN。

R2 全桶 scheduling 300 PASS / 4 vendor stub skip、playground 323 PASS 是**继承**，4 skip 为 0 执行；本轮不重跑全桶。R1 原字节 `newCapacityRule` probe 的 FAIL 与 R2 对该断言不适用的裁决、独立语义 probe PASS 并存，均不改写。全历史 `main...HEAD --check` RAW exit 2 与本票维护范围 exit 0 分列。CI、docs #10、packed #11、device、旧 consumer #13/#15、父 #8 组合、真实 APS、生产/商业发布、原生 zoom 均 **UNRUN**。PR109 保持 draft，交父席安排独立 R4。
