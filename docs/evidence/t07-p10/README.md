# T07/P10 实施证据

PR #112 独立 R1 指出的四组 Spec material 返修及原字节探针、正式回归见 [F1 证据](f1/README.md)；独立 R2 两项 P2 返修见 [F2 证据](f2/README.md)。下文保留首轮实施时点的证据和未运行边界，不以返修后的 PASS 改写历史记录。

本票为 [#93](https://github.com/Mang-X/nerv-ui/issues/93) 的 scope M 独立实现。开工 branch `feat/t07-p10-request-forms` 为 clean，base `978a04dd5e8b35e641f4f2b87c6b66866b42c857`、tree `adc49eb2affc29066bbaedc1ec3aee1217025a57`。冻结来源 Nerv-IIP `79b1578f2b75f55709765b5e7882aaf33146c603`、tree `58e30c637acb7efdd393af291e570288b03b5aa9` 只读。完整原日志、浏览器脚本与截图保存在外部 `nerv-delivery-evidence/nerv-ui/2026-10-27/t07-p10-implementation-r1/`；这里仅列可复核结论，不以中性页面声称真实 APS。

## 公开 RED → GREEN

| 验收                                                | 精确测试名与观察                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 未就绪、加载、失败、空、无命中、ready；可见两行批量 | `public pool distinguishes unavailable states and sends only two visible keys`：过滤“间”仅发 `a,c`；`public picker keeps missing scope, loading, failure, empty and no hit distinct`                                                                                                                  |
| 选择跨过滤、重排、失效来源                          | `public pool selection follows stable keys across reorder and explicit filter policy`；`public pool ignores stale save completion and keeps a retryable draft after throw`                                                                                                                            |
| priority/rush、缺回调/false/throw、只读             | `public pool keeps a failed priority draft and retries the same values`；`public pool keeps a rush draft without callback and sends it only after retry is available`；`public pool explains disabled editing while readonly`；`public forms keep missing priority unknown instead of inventing zero` |
| preset/custom 与宿主校验                            | `public horizon preserves wall time and presents host validation for custom range`；`public dialog keeps a failed request editable and validates every window state from host` 覆盖空、倒置和超出来源跨度                                                                                             |
| 固定/选择项、new/insert、取消/pending、旧结果隔离   | `public single request requires a real callback receipt and rejects stale close/source results`；`public dialog supports picker and insert with captured plan; readonly keeps completed result`；`public dialog without submit callback cannot show a confirmation`                                   |
| 公开类型与两个中性宿主                              | `public request types preserve source states and readonly request identity`；`two neutral request routes expose four entry paths and memory-only notice`；`neutral host offers failure retry, pending cancellation, and insert with explicit plan`                                                    |

最初只加池公开测试时，缺主桶出口导致两个挂载抛 `Invalid value used as weak map key`；同轮未设 TZ 还触发既有快照断言，两个失败分别保留。设 `TZ=Asia/Shanghai` 后池 2/2 GREEN；加入另外三件测试时再次因缺公开出口 RED 3 项，导出及实现后 5/5 GREEN。最终聚焦 `request-forms` 14/14 通过，CSS parse 提示单列。最终完整 workspace 四桶分别为 805、339（另 4 policy skip）、144、351 个通过，进程退出 0；控制台 reporter 未提供 unhandled 计数字段，未编造为零。build/typecheck 与 lint 退出 0。首次 build 和一次并发改动期 build 因本票类型消费者注释位置、nullable 签名而失败，原日志保留；最终 build 成功不抹去早期失败。

## 可见浏览器与资源

Ego 浏览器在 production `vp preview` 上实际操作：读书会深链筛出晨间/夜间两行并只加入其 key；范围未就绪、加载、失败、ready 四态可见，空与无命中由公开组件测试覆盖；筛选时保留或清除选择；优先级失败保草稿并重试成功。固定项弹窗的空、倒置、超宿主跨度提示，新/插入切换、选择现有安排、显式本地回执，以及待处理取消后重开另一项无旧结果均可见。工作坊深链在 390px 浅色下表格自身 900px、局部滚动容器 306px，document 无水平溢出；深链与十条既有 T07 路由均可往返。深色宽屏、浅色窄屏和双弹窗截图在外部目录，已目视核对。Ego 空间结束后补了一处只读文案，最终 dist 改用 CLI 浏览器复验 390px、只读理由、900px 局部滚动和无页面溢出；该 CLI 会话的唯一控制台错误是 `/favicon.ico` 404，按原样保留。

T3 预览 `preview_snapshot` 连续两次原文 `Preview automation snapshot timed out after 15000ms.`，随后依浏览器车道改用 Ego；此失败没有被浏览器成功覆盖。HTTP 实际加载的 HTML、入口 JS、运行时 JS、CSS、字体五个响应分别验证状态、MIME、body SHA 与 dist 文件逐字节相同；该结论只覆盖这五个响应，不证明整包安装、vendor 或 APS。

## 证据边界

主桶与 playground 本地测试、类型、构建、lint 和本票格式化分别报告；全局 fmt 的四个旧 base 同 blob 文件仍 FAIL，未修洗。`@nerv-iip/scheduling` real-vendor 测试 4 项 policy skip，真实 vendor 运行不由本票测试代证。DHTMLX 9.1.4 Professional Evaluation JS/CSS/d.ts、版权水印未改，许可范围 UNKNOWN。CI、文档站 #10、packed #11、设备、旧业务消费者 #13/#15、父 #8 组合、真实 APS、生产和原生 zoom 均 UNRUN。
