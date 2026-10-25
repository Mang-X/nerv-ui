# P03 / #86 实施证据

范围：scope:M，仅 host callbacks/public contract；候选 PR 面向 integration，独立 merger 尚未验收。基线 `23be2615a4556c63d8fd7cbefd4e165557e3959c`，tree `237ef42380d2821d1a7c75229ac4c97b13ff5262`。本页为本轮冻结证据，不是永久注册表。

准确签名/兼容变化/可类型消费示例见 [宿主合同](../../scheduling-host.md)，实现消费者见 [public.test.ts](../../../frontend/contract-consumers/scheduling-host/public.test.ts)、[consumption.ts](../../../frontend/contract-consumers/scheduling-host/consumption.ts)。

## Requirement | Evidence

| Requirement                                             | Evidence                                                                                                                                                                                                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| source/草案/validator/formatter 精确输入与输出          | `passes exact source and draft values to host projections and validator`；输出泛型消费见 consumption.ts                                                                                                                                          |
| 无校验依据、无formatter明确未知                         | `missing validator reports unknown for each operation and formatter never invents a material date`                                                                                                                                               |
| adapter/validator异常传播，原输入保留                   | `host projection failures propagate without replacing input records`                                                                                                                                                                             |
| loader context捕获、A后成功不覆B                        | `loader receives exact captured context and late A success cannot replace B`                                                                                                                                                                     |
| loader迟到异常不改变B的pending/error                    | `late A failure cannot change B loading error or result`（成功分支同组另测）                                                                                                                                                                     |
| loader scope停止不提交                                  | `loader disposal ignores late success` / `loader disposal ignores late failure`                                                                                                                                                                  |
| loader缺回调/缺source/失败重试/cancel/清空              | `loader failure retries, cancel isolates result, absent callbacks and absent source remain unknown`                                                                                                                                              |
| preview失败保留dirty可retry，pending不重复发release     | `preview preserves draft after failure, retries with snapshot, and suppresses duplicate release`                                                                                                                                                 |
| preview/release取消/context/model/dispose隔离成功和失败 | 16条明确命名的 `preview cancel isolates late success from current draft` 至 `release dispose isolates late failure from current draft`，原名全部在 durable raw/suite-validation.json                                                             |
| context B开始后A不清B的pending                          | `new context preview stays pending after old preview success` / `new context preview stays pending after old preview failure`                                                                                                                    |
| release失败保留草案与dirty、精确plan/context、可retry   | `release failure keeps dirty model and retry sends exact plan and captured context`                                                                                                                                                              |
| 缺edit回调无成功、undo/redo与受控输入不突变             | `missing edit callbacks never succeed and local history does not mutate controlled input`                                                                                                                                                        |
| snapshot独立、busy时不重复提交/编辑                     | `host preview can mutate its snapshot without touching the draft and release pending prevents repeats`                                                                                                                                           |
| Workbench新props回调/上下文及success提示                | `Workbench reads replaced callbacks and ignores a cancelled completion without success toast` / `Workbench reports only successful injected preview and readOnly blocks action emission`；只隔离P04 renderer，不代真实vendor                     |
| conformance可访问test入口                               | `mounts, renders one node per task, and exposes state` / `applies scaleTo command and reports via scaleChanged` / `selectTask command emits taskSelected with normalized id` / `destroy cleans the container`；test double自校验，不证明真实引擎 |

## RED / GREEN 的准确边界

- adapter/loader/edits 三次初始 RED 是旧公开入口/导出不存在导致 collection 失败（0断言），不写成旧行为断言已运行。随后对应接缝 GREEN 为非零真实断言，最终公开套件37条全部执行。
- 额外 current-guard sensitivity：临时仅移除loader提交归属检查，同一个 `loader receives exact captured context and late A success cannot replace B` 实际失败（A覆盖B）；finally按SHA逐字还原，公开37条重新GREEN。它是本轮敏感性探针，不伪称历史baseline运行，未stub SDK。
- 原测试/fixtures按原字节归档，不刷新领域期望。主桶仅静态图证明无SDK/business-core/Vitest；真实生产consumer从/host解析，并检查实际loaded/emitted图及bundle。根桶完整构建/整包测试仍UNRUN，不能据此说全包绿。

## 本轮 fresh 与留存结果

准确命令/cwd/exit和JSON字段见外部raw/commands.jsonl、suite-validation.json、validation.json。public37；P02public20；活动UI805/mobile144/host294（串行lane）；docs-source6+2；pure tsc、浏览器vue-tsc、活动3包typecheck及根build。最终计数以外部最终receipt为准；不把旧统计当fresh。

浏览器production16条观察覆盖读取倒序/迟到失败、dirty/history、失败retry、pending、换context晚回；宽屏/640截图均查看。4条浏览器资源body及全部服务actualresponses逐条核status/MIME/bytes/SHA与最终dist一致；loaded/emitted图及正常JS无SDK/Vitest/reference。window error/unhandledrejection钩子在module执行前启用，观察为空；Vitest JSON实际没有unhandled计数字段，保存null不虚构0。

T3 status/open成功、同一步snapshot两次原始 `Preview automation snapshot timed out after 15000ms.` 后使用ego0.6.1.9，无升级。浏览器update提示不等于升级授权。

本轮所有FAIL均留外部raw：入口RED、初次Vue链接/TS类型检查、CSS/Vue消费者环境与visual字段错误、ownership脚本把P02已移走test算错、竞态探针预期FAIL；修正后不覆原日志。conformance/Workbench测试的jsdom CSS stylesheet告警与build两条VueUse PURE annotation告警保留。一次探针与初始mobile/host门禁短暂重叠已记录，最终mobile/host/public在整段初始门禁结束后串行重跑，不改写原记录。

完整RAW main→head diff-check与本票maintenance diff-check分列；前者继承历史空白问题为exit2，后者应为exit0，以最终命令回执为准。

## 原64文件与非活动来源

[original64-ownership.json](./original64-ownership.json) 覆盖研究固定93f9689的64文件（P02新增model/index.ts不是原64）。逐项列活动准备合同、P02不变producer、非活动host-reference、后继P04/P08未适配测试/资源，不以exclude/skip消去失败。

[provenance.json](./provenance.json) 给出来源路径、精确base与SHA256。P03原APS mapper/draft算法/material formatter、旧loader/edits/conformance、fixtures/perf-fixtures及三份旧测试共11份原字节，另指向P02既有旧facts测试。原APS算法/断言与两个fixtures从候选src迁入非活动新reference；旧UI/engine测试尚有旧mapper/fixture调用，P04/P08须更新这些输入，当前不声称可运行。reference保留旧import坐标，是追溯材料而不是另一个活动SDK或运行框架。

SDK/business-core两项永久运行依赖从候选manifest移除；新增/host与/test-support exports。scheduling仍inactive，lock/importer未改；973packages与973snapshots完整对象/边/peer逐值相等。26份原工程输入仅此manifest变动；5处Vue同realpath。冻结migration/vendor、P01renderer/parser、P02strictcalendar/readonlyunionproducer零改。

## 历史、未决与UNRUN

历史指针：研究 /tmp/nerv-ui-t07-research.md §3–7/H；控制 /tmp/nerv-ui-implementation-context.md 与 /tmp/nerv-ui-t07-ticket-map.json；P02 /Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-p02-review-r2/review-receipt.md；P02 implementation-r1/union-fix handoff。仅引用，未复制历史千文件。

旧默认并发host FAIL根因UNKNOWN；本轮默认并发UNRUN，串行PASS不清除该历史。P3年份0099/no-op原7PASS/1FAIL延期，本轮不扩修，#43/#51不动。

UNRUN：scheduling整包/根入口完整运行/旧consumer迁移、真实DHTMLX及P04、后继T07recipe/drag/readOnly/vendor、CI、完整docs#10、packed#11、device、旧接入#13/#15、父#8组合、发布。DHTMLX9.1.4ProfessionalEvaluation材料声明水印保持，授权UNKNOWN。没有merge/ready/close/watch/poll/publish或改总PR18；等待独立merger。

本轮scratch：/tmp/nerv-ui-t07-p03/。durable：/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-p03-implementation-r1/；仅本轮脚本/日志/JSON/截图/交接与历史指针，过滤node_modules/cache/cleancheckout/.vite/dist/baseline/testagent，附SHA256SUMS逐项回读。准确最终base/head/tree及清理结果见durable/handoff.md。
