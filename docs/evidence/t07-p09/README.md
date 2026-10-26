# T07/P09 · 草案可视编辑实施证据

范围：仅 [#92](https://github.com/Mang-X/nerv-ui/issues/92)，scope M / 高难度。候选分支 `feat/t07-p09-draft-editing`，目标 `integration/nerv-ui-extraction`。实施基线 `d8ca1f5ab26cdbf5572de52bce928a8be01b1f1f` / tree `6855d17bd5c87e331ce5999ccbc5ab589344c912`。本页不证明独立审核、合并、tracker 关闭或发布。

完整本轮命令、原始 JSON/log、浏览器脚本、截图、HTTP body 与 SHA 回读在 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-26/t07-p09-implementation-r1/`；最终对象见该目录 `handoff.md`。不拷贝 node_modules/cache/dist/clean checkout 或历史大目录。公共合同见 [草案合同](../../scheduling-draft.md)。

## Requirement | Evidence

以下精确测试名均在最终 `scheduling-final.json` / `host-final.json` 逐 assertion 匹配为 PASS；VTU 通过主桶消费真实组件/对话框，测试配置的缺引擎 fallback 不算真实 vendor。公共图面 props 同步与真实鼠标画面分列。

| Requirement                                                             | Evidence                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 表格采用/拒绝、时间/资源请求、稳定 identity、不 mutate                  | `draft table requests host patches without mutating input and redraws current authority after accept or reject`；`table end-time and unassigned resource requests retain stable task identity`。原生输入被拒后回显 10:00，采用后 11:00；结束和 undefined 未分配资源均使用 stable-a。                                                                                                                     |
| 三视图、详情、锁/解锁、待排移回/恢复、undo/redo                         | `neutral library draft shares resource lock pending restore and undo across table detail and both public boards`；`neutral studio draft shares resource lock pending restore and undo across table detail and both public boards`；`neutral draft host accepts and rejects table edits then visibly undoes and redoes without saving`。表格/详情实际 DOM 变化；两图公共 model 同源；浏览器另验真实图形。 |
| assignment 维度与 null 不冒资源 ID                                      | `neutral host applies public drag assignment and null membership without changing resource identity then rejects a later proposal`。team 改派及 null 删除都保留 room-0；随后拒绝时间调整，表格仍 11:00。                                                                                                                                                                                                 |
| 本地 undo 不等保存                                                      | `neutral save stores a separate copy while local undo and external plan replacement retain their own meaning`。保存副本 11:00、undo 后草案 10:00，而副本仍 11:00。                                                                                                                                                                                                                                       |
| feedback 输入替换、unknown、due、缺失不补 0                             | `feedback replaces issues and due input without deriving validation success or zero from missing data`。旧提示/延期 30 分钟消失、新提示显示；缺 due 和空 issues 都不宣称校验成功。                                                                                                                                                                                                                       |
| 保存缺 callback/false/异常/成功、失败可重试且保留草案                   | `draft save requires explicit callback success and retains editable content after rejection or throw`。只有 true 显示“已保存”；无 callback 不假成功。                                                                                                                                                                                                                                                    |
| pending 去重、回调快照隔离                                              | `save pending deduplicates clicks and passes a detached snapshot with an abort signal`；`clear pending deduplicates confirm and ignores a late success after switching scope`。callback 改私有副本不改变输入；确认/保存处理期间禁用。                                                                                                                                                                    |
| 保存晚回隔离、同 plan 深层更新/换 callback/readonly/卸载                | `save late response is isolated after plan replacement`；`save late response is isolated after deep replacement`；`save late response is isolated after callback replacement`；`save late response is isolated after readonly replacement`；`save late response is isolated after unmount replacement`。不遵守 signal 的旧 Promise 仍被丢弃。                                                            |
| 清空 false/异常不关 dialog，取消/缺 callback 不成功，重试只当前成功关闭 | `clear dialog stays open on false or throw and closes only after explicit success`；`clear cancel and missing callback keep the draft and never report success`；`board clear pending disables edits and failure retains dialog before retry applies a host reset`；`neutral clear failure keeps the same dialog open and a successful retry resets local draft only`。                                  |
| 清空关闭/换 callback/卸载后的晚回                                       | `clear late failure is isolated after close`；`clear late failure is isolated after callback`；`clear late failure is isolated after unmount`。旧返回不覆盖当前状态、不触发 cleared。                                                                                                                                                                                                                    |
| reorder 后详情读当前对象、readonly 贯穿详情与表格、外部换 plan          | `selection follows stable identity on reorder and readonly reaches table and detail without editable lock actions`；上述两个 neutral domain 测试均验证新 plan、undo 禁用和清选择。                                                                                                                                                                                                                       |
| 无效/倒置时间、分段保留                                                 | `table invalid wall time or inverted interval does not emit a patch and preserves multi-segment display`。倒置不发 patch；两段逐段显示且时间输入禁用；严格时区解析继续由未改 factory-time producer 提供。                                                                                                                                                                                                |

## RED → GREEN 与历史失败

- `red-table` exit1：公开主桶尚无 DraftBoard，操作序列不能挂载。首轮命令意外包含完整 src，231 PASS/1 FAIL/4 原 skip；后续改精确文件。新增功能缺失的 RED，不冒称旧业务 clear 已有错误。
- `green-table`、`green-table-corrected` exit1：本席夹具误把 facts 写成对象、随后断言未考虑 datetime-local 省略秒。纠正后 `green-save` exit0，2 PASS。
- `red-save` exit1：缺保存按钮；`green-save` exit0。`red-clear` exit1：缺公开 ClearDialog；`green-clear` exit1 是 portal 尚未挂载的测试前提，`green-clear-mounted` exit0，3 PASS。
- `red-host` exit1：缺中性宿主；`green-host` exit1：编辑簇隐藏使撤销不可达；增加 Board 自有受控撤销按钮后 `green-host-undo` exit0。补充组合测试最初误把 jsdom 图面当真实 vendor，`host-final-cases` exit1；更正为 public model 接缝，真实绘制由 browser 独立证明。
- `red-clear-retry-host` exit1 → `green-clear-retry-host` exit0。新增 fixture 的首次失败/同 dialog 重试成功，不修改真实服务。
- `typecheck-first`、`build-first/corrected/facts-corrected/runtime` 的失败均保留：测试包装器类型与示例 facts 字段错误，修正后最终类型与构建取实际门禁记录。
- 真实 browser 初版图面空白为本轮产品 RED：draft 目录新 utility 未被 Tailwind 收集，内部实际高度 22px。尝试独立 scheduling CSS `@source` 未生成主样式 utility，已撤回；最窄修复在新 Board scoped `nv-components` CSS 声明高度和响应式分栏。引擎/共享配置/vendor 不改。旧截图 `01/03` 与 layout JSON 保留。
- browser 部分准备失败：T3 snapshot 两次原始 `Preview automation snapshot timed out after 15000ms.` 后才切 Ego；启动前错误页、旧 hash 导航持有旧 CSS、脚本固定像素=一小时/太早读 mouseup 后记录、资源首匹配 hidden parent，以及 Ego dblclick 第二下遇 disabled 都保留，不冒作最终产品失败。最终以命名 GREEN JSON 和最终 HTTP 身份为准。
- 一次 `build-corrected` 与 `host-corrected` 重叠约 0.93 秒、一次 formatter 与非最终失败 build 重叠；均不采最终重型门禁。最终 tests/build/browser 按 `gates.jsonl` / `browser-gates.jsonl` 串行。
- probe scratch 的类型链接、工具包入口与 macOS `/tmp` canonical root 准备失败保留；invariants 首轮旧 useEngine 路径失败保留，修正回当前 components producer。没有改 package/lock/vendor 以规避。

## 执行分层

本轮最终 tests：scheduling **254 discovery /250 PASS /0 FAIL /4 原 stub skip**，playground **310 PASS**，docs-source **6 PASS**。新 P09 公共行为 19 条、host 6 条。reporter 的 suite/assertion/discovery/exit 已匹配；缺 unhandledCount/unhandledErrors/errors/runtime 字段保持 null，不补 0。4 个旧 stub conformance 执行 0，不是 real vendor conformance。未增加 skip/exclude/timeout。

构建/类型/格式/lint、最终 HTTP、浏览器和精确对象的最终记录见 durable `handoff.md` 与原始命令；本页不会把 source alias/源码消费者称为 packed #11。

浏览器已取得工单图真实鼠标采用/拒绝后表格同步、表格 keyboard/select/锁/待排恢复/undo/redo/feedback、资源卡片跨泳道采用后详情/表格/工单图同步。`browser-order-green.json`、`browser-table-actions.json`、`browser-resource-green.json` 和截图对应同轮较早 runtime；最终回调/清空、两领域导航、HTTP 与卸载清理另在 durable 最终记录分列，不把有限继承冒作最终重新跑全部矩阵。callback 是本地中性 fixture，不是真实 APS 或保存后端。

来源：冻结研究 `2026-10-25/t07-research.md` §3–7、§9/P09 和 64-path 附录；原三件 app Vue、WorkingScheduleDraft 仅核对呈现与业务边界。当前 public contract 优先；P08 R5/resource-visibility-fix、P07 R1/P06 R2、P03 host/model 深监听回执只作为必要前置指针。引擎/P08 legend/scale/factory/projection 未改，原十一 finding 的正式断言随 scheduling 最终套件执行；不回退 strict/unresolved/DST/hour/summary/range/now/blocks/projectedoperations/0/unknown 语义。

完整 lock 原 bytes 与整个 YAML packages/snapshots/importers/metadata/optional/peer/actual edges 对比和四包 actual Vue identity 见 `raw/invariants.json` / `raw/vue-identity.json`；973 packages /973 snapshots。vendor 891743/142723/211538 bytes、Evaluation/版权水印、字体 transform/local Inter license 和授权 UNKNOWN 保留。

UNRUN：CI 执行、完整 docs #10、packed #11、device、旧消费者 #13/#15、父 #8 组合验收、SDK/真实 APS/保存后端、生产发布/商业授权、原生 80%/125% zoom。本轮 viewport 或 DPR 不冒原生 zoom；未重跑完整旧 mobile/UI/pure-prepared 验收，有限承接未改 producer。未逐字审全 vendor/d.ts、其余 app 来源、全历史 raw 或未改全仓，不称完整认证。P01 提示/P02 年/P03 字号/ETA/#43/#51 和后继未搭车。

## 最终真实产物收尾

最终 callback/readonly/清空采用 `browser-save-clear-final.json`；同 dialog 清空失败保留 **14:00**、重试成功恢复 **13:00** 的独立可见对照为 `browser-clear-visible-reset-final.json`。最终 studio 真实 order move、resource workCenter 采用与 team 改派拒绝、table/detail 同步、旧入口往返和返回 library 为 `browser-studio-final.json`。独立 public consumer 的实际表格输入、保存 true、独立 ClearDialog false 为 `browser-probe-final.json`。以上来自最终 nested dist，callback 仍只是本地 fixture。

- [初版空白图 RED](screenshots/red-empty-order.png)
- [最终创作室表格/详情](screenshots/studio-table.png)
- [清空失败保留草案及对话框](screenshots/clear-failure.png)
- [独立 public consumer 真实引擎](screenshots/public-probe.png)

`raw/http-identity-final.json`：app **7** 项、probe **6** 项实际 URL / HTTP200 / MIME / bytes / SHA / body 与各自 fresh dist 相等，实际响应体保留。app 包括 HTML、主 JS/CSS、vendor JS/CSS、runtime、local Inter；probe 没有独立 runtime，不伪造第七项。root/nested 两个实际构建 exit0；最终 HTTP 对应 nested 产物。源码公共消费者不算 packed 安装。

`browser-route-cleanup-final.json` 和 `browser-restored-final.json`：卸载后 engine/bar/tooltip/ghost 均 0；TZ Asia/Shanghai、visualScale 1，原生 zoom 未改且 UNRUN。Ego Space88 `finish({keep:[]})` 恰一次，closedSpace true/unmanaged 0；T3 自有 tab 正常 window.close 后末 status 无 tab。只清本席服务与 scratch 链接，不删 tree。Ego 提示更新但未升级。本轮真实 native503 回落、完整旧 theme/size/multi-instance 矩阵未重跑，明确有限继承未改 producer；相关正式 lifecycle/namespace/edit regressions 已包含在 fresh scheduling 套件。

最终维护门禁：15 个手写文件 fmt exit0、受影响源码 lint exit0、ticket RAW diff-check exit0、staged diff-check exit0；main RAW diff-check 仍为历史 exit2，原日志不删不改。末次 fetch + merge integration 为 Already up to date，仍是本页指定 base/tree。fmt 的 `../` 参数拒绝、两个新文档初次格式失败及后续修正分别留 raw gate。服务清理首轮安全停止了两个已核 cwd/command 的 PID，遇到非链接 `.vite-temp` 后主动停止；公开回读进程/端口均已退出，再仅删除五个明确自建链接，见 `raw/cleanup-services.json`。
