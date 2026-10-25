# P03 R1 / SPEC-1：Workbench 权威模型同步

本轮只修 #86 / PR102 的 R1 SPEC-1（P2）。内部 `SchedulingWorkbench` 从父级模型复制本地草案，原浅 watch 漏掉同一 reactive 对象的嵌套修改，导致 release 使用 plan A、context B。现在两个父级 model watch 均使用 `deep: true, flush: 'sync'`：同步克隆权威输入，并清除旧选择；已有 edits 的取消与 baseline 逻辑失效旧请求。本地锁定、撤销、重做仍操作独立副本，不写父 props、不触发输入重置。合同说明见 [宿主合同](../../../scheduling-host.md)。

## 接续事实与固定对象

- 真实工作树 `/Users/mang/Project/nerv-ui-worktrees/t07-p03-host-adapters`，分支 `feat/t07-p03-host-adapters`。
- 开工 HEAD `9be74ce3a56e3e651ed42263da7cb8c229139868` / tree `04b264269ff36979de1e4d991ab49f4ade1997af`；base / integration `23be2615a4556c63d8fd7cbefd4e165557e3959c` / tree `237ef42380d2821d1a7c75229ac4c97b13ff5262`。接续席 fetch 并 merge 最新 integration，结果 Already up to date。
- 前席 `nerv-ui-t07-p03-fix-model-sync-r1-20261025` 因 `Selected model is at capacity` 终止，父席交接状态 `failed/noPendingChildren`。留下 docs、Workbench test、Workbench 三个未提交文件；接续席保存副本及 SHA，逐字节保留，没有 reset/覆盖。前三文件身份在 `raw/continuation-start.json` 与最终验证中对应。
- 接续开工无该任务残留测试或服务进程；无重型运行重叠。既有其他工作树服务未接管/清理。全部 shell 使用真实 workdir；task-local corepack pnpm 11.22.0 shim 同时约束 nested 命令，未安装/升级依赖。

## Requirement | Evidence

正式断言位于 `frontend/contract-consumers/scheduling-host/workbench.test.ts`。只隔离 P04 尚未恢复的 Gantt/资源 renderer；其替身显示收到的模型、发送选择事件。实际 Workbench、Toolbar、详情、edits 与宿主回调运行，不重写 APS 或 vendor。

| Requirement | Evidence |
| --- | --- |
| 同对象 plan/task 更新与最新 context 精确传给 release | `Workbench releases the same-reference authoritative plan with its current context`；原外部 `SPEC-1 same-reference authoritative plan update must reach release with matching context` 保持字节不变，观察 B + B |
| 同对象嵌套输入在同 tick 动作前同步 | `Workbench same-tick nested authority and context updates reach preview before the render queue`；replacement props 等待 Vue 传入组件，不承诺父级 ref 尚未 patch 时已可读 |
| 同对象更新/replacement 失效 preview/release，旧成功/失败/finally 不混入新 pending | 8 条 `Workbench {in-place,replacement} authority invalidates old {preview,release} {success,failure} without clearing current pending`，具体展开名见 JSON；断言 signal abort、新 B snapshot/plan/context、旧结果不提示成功/失败、B busy 保持、B 当前结果才完成 |
| 本地独立副本、history、失败 retry 与外部重置 | `Workbench keeps local undo redo and failed-preview retry until external authority resets history`；上述 8 条同时检查父 model 未被锁定、外部权威更新清旧选择与历史 |
| 仅 context 嵌套变化维持既有合同、捕获值隔离 | `Workbench context-only nested change cancels preview and keeps captured context isolated` 与 `Workbench context-only nested change cancels release and keeps captured context isolated`；保留当前草案并重设 baseline，不代宿主选择模型 |
| 最新 callback、readOnly、无 callback 不假成功 | 保留原 `Workbench reads replaced callbacks and ignores a cancelled completion without success toast`、`Workbench reports only successful injected preview and readOnly blocks action emission`，以及原公开 edits 合同 |

## RED / GREEN 与证据强度

原审核外部 probe 是实际 **1 test / 1 FAIL / exit1**，观察 plan A + context B，原断言/失败不改。前席本轮 `red-authority` 实际 **3 tests / 1 FAIL / exit1**；`expanded-old-source` 将旧 Workbench 临时用于同一正式测试后实际 **15 tests / 7 FAIL / exit1**，随后 finally 恢复源码 SHA `cc3bec6ef0e9a94e20e0bd24346872d242947b0e9e0579ba505ef8b87069ec65`。接续席核对 RED/当前 GREEN 的 15 个测试名完全一致，没有用 collection failure 冒称行为 RED。

接续席 fresh：

- `pnpm -C frontend exec vp test run --root contract-consumers/scheduling-host --config vite.config.ts --reporter=json --outputFile=…/continuation-public.json`：**50/50 PASS / exit0**，含 Workbench **15/15**、原 P03 其余 **35/35**。
- 原外部 probe 按原配置修正 realpath 后，原文件 SHA `04704fbbb30a34823533a79003b615277047d6f93c6a15385df321ff883b000d`：**1/1 PASS / exit0**，捕获 plan B / context B，原历史 observed 文件恢复。
- JSON 已 parse、非零 discovery、每条 assertion passed、failed/pending=0；unhandled 计数字段实际缺失，保留 null，日志无相应 markers。
- Workbench/test 的辅助 vue-tsc 通过：使用真实 Vite package exports 的 client 类型和仓内原 vendor d.ts 映射，无伪造 SDK/vendor 声明；只证明类型消费，不表示引擎运行。正常 consumer production build、根/host/test-support 静态图、scoped lint/fmt 与 diff-check 分项留 raw。
- 14 条真实 production 浏览器状态观察：本地锁定隔离、A→B 原地更新、旧 preview 成功与旧 release 失败隔离 B pending、当前失败保留 history/重试、replacement C、context-only abort/捕获隔离、当前成功。4 个 HTML/JS/CSS/font actual bodies 和服务全部 32 条响应，status/MIME/bytes/SHA 与最终 dist 一致。hooks errors/unhandledrejection=[]；不与 Vitest 缺失字段混算。

前席已执行且接续核验的本轮证据：P02 pure **20/20**、host **294/294（--no-file-parallelism）**、public tsc/browser vue-tsc、活动三包 typecheck/根 build、fmt/lint，均 exit0；不重复重型运行、不改写为接续 fresh。原实施/审核的 UI805、mobile144、docs-source6+2 与旧 16 browser observations 仅历史继承，不冒本修复 fresh。

完整 lock YAML 对象、所有 dependency/optional/peer 边与 base 相同：973 packages / 973 snapshots；本轮从接续起点枚举的 28 份工程输入全部相同，5 个 consumer 的 Vue 同 realpath。原实施的26份是另一枚举起点，不混用计数。12 份 reference provenance 原字节不变。P01 renderer/parser、P02 pure/readonly union、migration/vendor 均无 delta；静态图根31、host9、test-support4，只有 test-support 加载 Vitest。正常生产 consumer 与隔离 Workbench build 均检查 loaded/emitted 无 SDK/Vitest/reference。

## FAIL / UNKNOWN / UNRUN

保留所有前席准备错误：测试生成语法错误（未写文件）、`/tmp` 与 `/private/tmp` collection、构建 renderer query 匹配、未恢复 vendor，以及过早的 Workbench 类型诊断。接续补充类型配置时，scratch 中 `vite/client` 相对解析失败、误猜 client 文件、types-only export 不能由普通 require.resolve 解析的错误均保存；最终读取实际 package exports/types 后通过，没有改生产配置。

T3 status/open/navigate 成功，snapshot 同一步两次原始错误均为 `Preview automation snapshot timed out after 15000ms.`，随后 ego-browser 0.6.1.9 fallback（提示更新，未升级）。一次直接点击 clean draft 的 disabled preview 被拒绝；改为先选择/锁定。replacement 首次观察父页 shallowRef receipt 内非响应式 AbortSignal 时仍显示 false；等待 props 传入后仍有同样 stale receipt，下一次现有 host context 操作使 receipt 刷新为 true。保留两次观察失败及诊断；最终通过 visible draft/history/idle 和随后 signal 读回验证，不改 timeout/skip，也不伪称初次 receipt 为 true。最终 T3 tab/ego space/自有4194服务清理，zoom/scale=1。

full RAW main→candidate diff-check **exit2** 与本轮/source/docs maintenance **exit0** 分列。旧 host 默认并发 FAIL 根因 UNKNOWN、默认并发本轮 UNRUN。R1 Standards optional 字号26/18px（P3）、P02 old-year/no-op 原7PASS/1FAIL、#43/#51 均延期，不扩大修复。

UNRUN：scheduling 完整 workspace/根桶完整 runtime、真实 DHTMLX/P04 与其它后继、父 #8 组合、CI、完整 docs#10、packed#11、device、旧 consumer#13/#15、发布。9.1.4 Professional Evaluation 声明/水印/原字节保留，授权 UNKNOWN。候选修复不替代父席另派的独立审核；PR102 保持 draft，#86/#8/#1 OPEN、总PR18 draft，不 ready/merge/close/watch/poll，不启动后继。

## 归档与历史指针

本轮 scratch：`/tmp/nerv-ui-t07-p03-model-sync/`（前席材料保留，接续日志以 continuation 前缀追加）。durable：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-p03-model-sync-fix/`，仅本轮日志/脚本/截图/候选 patch/交接和历史指针，过滤 node_modules/cache/cleancheckout/.vite/dist/baseline，附 SHA256SUMS 逐文件回读。最终 head/tree、PR 状态与精确命令见 durable `handoff.md` 和 raw。

- 原实施：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-p03-implementation-r1/`。
- R1 审核 receipt、SPEC.md、原 probe 与原 observed FAIL：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-p03-review-r1/`。
- 研究：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-research.md` §3–7/H；控制 `/tmp/nerv-ui-implementation-context.md` 只读。
