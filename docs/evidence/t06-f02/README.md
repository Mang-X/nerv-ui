# T06/F02：上传 attempt 生命周期与成功回执隔离

实施唯一票 [#73](https://github.com/Mang-X/nerv-ui/issues/73)，scope:M，单 PR；父 [#7](https://github.com/Mang-X/nerv-ui/issues/7) 和批准 spec [#1](https://github.com/Mang-X/nerv-ui/issues/1) 保持独立组合验收。所有 shell 显式 cwd 为 `/Users/mang/Project/nerv-ui-worktrees/t06-f02-upload-lifecycle`，分支 `feat/t06-f02-upload-lifecycle`。

开工 clean；base `e763c0fdc3e2800975578ab402b479d56f23c6fd`，tree `36ca2be30e958b26d7535d9868652c430468fc81`。交付前两次 fetch 并 merge 最新 integration，结果 Already up to date；不 rebase 已审对象。运行源码提交 `9ef52e5400d6f7de06fbac92260ebe22e399a9b1`，tree `b6c99e9b785c5dc997b3db336d69da93578728ab`；测试时为该源码工作副本，scope-check.json 保留逐文件 SHA256。后续提交只归档本目录；最终对象见交接回执。

## 实现边界

`useFileUpload` 复用现有 AbortController 作为 attempt 身份，在每个 await 续执行、progress 和错误写回前检查身份、signal、队列成员和 scope 生命周期。Vue scope dispose 清理当前实例；scope 外仍由调用方 clear。create/complete/transport 签名、默认值、公开名字、无界 Promise.all 和 failed/rejected 槽位政策不变。单行和批量 retry 共用过期会话处理；真实错误保留 message，包括 DOMException。已经发出的 complete 只保证本地隔离，不代表网络 rollback。

F01 host 增加默认关闭的 create/complete 闸门和忽略取消的本地传输开关。`window.__nervUploadFixture` 是 playground 诊断边界，保留离页后 readback 和旧 promise 释放能力，不暴露文件内容、不做 HTTP。使用说明见[接入文档](../../files-standalone.md#f02可控等待与取消晚回)。

| Scope 检查项 | 本轮变更 | 核对方式 |
| --- | --- | --- |
| 唯一生产 owner | useFileUpload；组件卸载由 composable scope dispose 完成 | scope-check.json、源码 diff |
| 公开测试 / F01 host 控制 | 根入口 FileUpload DOM/ref、useFileUpload；本地 adapter 闸门 | uploadLifecycle.test.ts、memoryUpload.test.ts、browser 读回 |
| create/complete/transport 签名、defaults、现名字 | 保留 | types/FileUpload/nativeTransport 无差异 |
| 批内并行、failed retry 槽位 | 保留；maxFiles 不变成并发限制 | `maxFiles keeps the existing failed-slot policy without limiting retry transport concurrency` |
| 依赖/许可/Vue | 16 份输入逐字节相同；973 packages/snapshots 全对象相同；实际 Vue 单例 | dependency-audit.json、vue-identity.json |
| shadcn / migration / 来源素材 | 冻结；只改自研例外 | scope-check.json |
| #74 / #75 / #76、父 #7、#43 / #51 | 无扩修 | UNRUN，不以本票结论替代 |
| main / 旧源 / root | 不写入；旧源 HEAD 固定 79b1578f2b75f55709765b5e7882aaf33146c603 | identities-final.json |

## Requirement coverage

测试均通过稳定根包入口，不访问私有 controller/map。await 通过宿主签名上的 deferred promise 控制，未使用固定 sleep。完整展开名称在 raw/requirement-tests.json。

| Requirement | Evidence |
| --- | --- |
| create 取消不再启动 transport | `pause during create prevents a late session from starting transport`；`'remove' during 'create' isolates late 'success' and preserves a new selection` |
| 三阶段 × pause/remove/clear/unmount/replace × 晚成功/失败 | uploadLifecycle 的 30 个展开 case；例如 `'unmount' during 'transport' isolates late 'failure' and preserves a new selection`、`'replace' during 'complete' isolates late 'success' and preserves a new selection`；每个 case 检查无新增下游动作、无 failed/receipt 泄漏，替换后新文件可成功 |
| 当前 attempt 独占进度/错误；旧 finally 不清掉新 signal | `resume isolates old progress failure and finally from the current attempt` |
| resume/retry 与旧 create/complete/transport 乱序 | `new attempt completes before the old create settles without losing its receipt`；`new attempt completes before the old complete settles without losing its receipt`；`retry completes while an older paused attempt still awaits transport` |
| retry 新会话与真实错误 | `single retry replaces an expired failed session and retains the failure reason`；`bulk retry replaces an expired failed session and retains the failure reason`；`active AbortError remains a real failure while pause cancellation is silent` |
| 多文件乱序、移除成功快照、clear 无 synthetic empty | `out-of-order completions emit only current queued successes and removal updates the snapshot` |
| 并行、重复操作、pauseAll 清理与既有槽位政策 | `parallel batch operations keep one current attempt per row and pause every signal`；`clear during a batch create prevents not-yet-started rows from creating sessions`；`maxFiles keeps the existing failed-slot policy without limiting retry transport concurrency` |
| scope 释放后不再写回/新开任务 | `scope disposal during create blocks late failure and subsequent actions`；对应 transport/complete 同名 case |
| host 显式闸门、忽略取消、可审 readback | `holds create and complete and can release a deliberately uncooperative aborted transport`；dev/prod browser 各 73 条读回 |

## RED → GREEN 与原始 FAIL

raw/commands.jsonl 记录命令、cwd、exit 和耗时；JSON 与日志均保留。逐片为 red-create→green-create、red-attempt→green-attempt、red-complete→green-complete-final、red-expired→green-expired、red-batch-cancel→green-batch-cancel、red-host-gates→green-host-gates。lifecycle-matrix 的 active AbortError RED 暴露 DOMException message 被通用文案替换；diagnose-abort 显示实际差异，随后 green-matrix 通过。

scope disposal 另有受控遗漏 hook 的回归敏感性验证：red-disposal-controlled 为选中的 3 FAIL / 45 policy-filtered，恢复后 green-disposal-restored 为 3 PASS / 45 policy-filtered。disposal-red-green.json 证实源码字节恢复，SHA256 与最终源码相同；不是把这条受控 RED 伪称原始完整基线失败。

complete 首轮测试误用了 avatar 不展示的文件名和上传中移除控件；改用 queue 的公开移除与 avatar 新文件的实际 create 请求/成功回执验证，保留 green-complete/green-complete-corrected 原 FAIL，不冒称均是产品反例。

browser-dev 首次错误使用 CLI 文件参数；r2 在同 URL goto 未 reload 导致 fixture 复用，r3 将 snapshot 归一 URL 误作原始 href，均保留脚本、局部读回和原错；r4 完成。T3 初次导航早于服务 ready 导致 ERR_CONNECTION_REFUSED；HTTP200 核实后 snapshot 两次仍为 `Preview automation snapshot timed out after 15000ms.`，保存 preview-errors.json 后按授权 fallback ego-browser，未升级。

首轮 full-host 为 214 PASS / 1 FAIL（215 cases）；既有 `opens files directly and returns from every completed surface group` 约 5.19s，原始 JSON 仅报告 STACK_TRACE_ERROR。疑似时序/负载，根因未证明；不将后续通过擦除本次 FAIL。最终串行 gate 不改超时、不跳 case。测试中既有 CSS parser、motion/CSS 变量与构建 warnings 保留。

完整新增证据 diff-check 为 exit2，诊断仅位于 raw 日志的尾空白/EOF 空行；维护代码、文档及脚本的 scoped diff-check 为 exit0。原始日志不清洗，不宣称完整 diff-check clean。

## Fresh、inherited 和 UNRUN

本轮 fresh：UI **770**、mobile **144**、host **217**；docs-source **6+2**；所有对应 runner exit0、JSON success=true、failed/pending0，全部 assertions passed。runner 未提供 unhandled 数值字段，日志未见 unhandled/uncaught 标记，不能把未知字段写成0。host 最终含48条生命周期 case；新补 retry 乱序覆盖后重跑全 host，之前216 PASS报告另存不覆盖。build 包含三个包 typecheck 和 production build，exit0；最后补充的测试又单独通过 host vue-tsc。维护5文件 fmt/lint exit0。result-validation.json 为真实报告解析，不只依赖终端摘要。

dev/prod 各 **73** 条读回，各含15个取消后晚成功场景、3个离页后 readback，以及两个 complete gate 乱序、create/transport 真错误与 retry、7变体本地 PNG 解码。均为真实浏览器运行宿主 fixture，input 由工具设置已知本地文件，不冒称原生 OS 选择器。JS fetch/XHR instrumentation 未观察到写请求或 JS error/unhandled；生产资源另由 CDP 从导航开始核对，8个 HTTP200响应的 MIME/bytes/SHA256 与最终 dist 逐字节相等，未观察到外部 HTTP、写请求或 PDF/Office lazy runtime 加载。响应体保存在 raw/resources/，不归档整份 dist。

390px 的 innerWidth=scrollWidth=390；新增7个控制按钮的左右几何均在视口内。截图已实看；prod-390-controls.png 部分按钮文字未显示，原因未定，因此仅将该图作为位置记录，不声称它证明全部文字可见。native 截图显示完整控制区；恢复100%快捷键、清除 emulation 后 width/scrollWidth2300、scale1、dpr2。浏览器 finish({keep:[]}) 和 T3 tab close 已完成；5199/5200自有服务核对 cwd/PID 后 SIGTERM，listener 均 absent，关闭退出 -15 是主动 cleanup，不冒称服务自然 exit0。

固定 pnpm 11.22.0，nested 命令使用外部 PATH shim；Python 全部 uv。新任务树首次 frozen 安装成功，但未额外做第二个 clean-checkout 实验。

F01 的完整布局/主题/导航矩阵、48 行虚拟滚动、图片缩放/旋转和 Blob URL 所有权为 inherited：[F01 仓内证据](../t06-f01/README.md)及 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t06-f01-review-r1/review-receipt.md`，不是本轮 fresh 重放。本轮仅对七变体本地缩略图解码和相关 route 做限定 browser 验证。研究报告的静态结论仍不代替 renderer。

F03 #74 native HTTP/tus、本机 endpoint bytes/hash；PDF #75、Office #76；父 #7 组合；CI、packed #11、完整 docs #10、设备 #41、旧消费者 #12–#15、旧库退出、生产发布均 UNRUN。#43/#51 不扩修。当前浏览器 lane 是已知本地 fixture/injected callbacks，不能称生产 FileStorage 或 native HTTP 成功。

未委派新的审查席位，本轮实施者验证不能称独立验收；未决异议为无前轮 finding、独立 merger 尚待执行。未 merge、close 或改总 PR18 ready，未 poll/watch/publish。

持久目录：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t06-f02-implementation-r1/`。原始数据不清洗；归档过滤 node_modules/cache/cleancheckout/.vite/dist，逐文件 SHA256 校验。
