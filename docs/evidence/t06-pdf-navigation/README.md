# T06：PDF 首次导航修复

唯一授权为父 [#7 R2 拒绝](https://github.com/Mang-X/nerv-ui/issues/7#issuecomment-6395291202) 的 P2，继承 [F04/#75](https://github.com/Mang-X/nerv-ui/issues/75) 多页导航 AC。本次不关闭父票，不回退已闭合的 R1 图片 basepath 修复。

起点为 integration `7502481b4be0df3fc0c02968d3f74be7d01fbca5` / tree `0ac8a2c74f134b31d6db00fc23ba5a46d3085705`；真实任务树 `/Users/mang/Project/nerv-ui-worktrees/t06-pdf-first-navigation`。最终 head/tree、命令退出码与证据索引由持久回执记录。

## 根因与改动

首次渲染出现滚动条，引发 viewport resize。固定 EmbedPDF 2.14.4 的自动 fit 在 debounce 后重新计算 zoom，并以旧滚动位置发出 instant 请求。Document 原桥接把导航 smooth 和 fit instant 都原样排入 RAF；后一请求取消前一导航，工具栏已切页但位图仍停在第一页。缩放比例相同的重算也可能回拉。

只修改 `PdfPreviewDocument.vue` 的 scroll-request 桥接：从 document-scoped capability 同步读取正在翻页的目标页，在 RAF 执行时使用当前 DOM 布局定位目标；非翻页请求仍采用插件位置。沿用既有 observer disconnect、scroll unsubscribe、RAF cancel 和 viewport unregister。Toolbar、PDF 来源读取/native open/engine 释放、RenderLayer 及公共 API 均未改动；无引擎重做、新依赖或新状态框架。

## Requirement coverage

| Requirement                                                      | Evidence                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 首次 next 遇到待执行 fit 与布局变化仍到目标                      | `FilePreview keeps the first PDF next page visible when pending fit requests change its layout`；公开 FilePreview 挂载、按钮操作及目标页几何。真实 renderer 另由干净 reload 的 `first-next-target-content` 验证，不能以 mocked bitmap 代替内容验收。                                                                  |
| 普通 zoom 请求不被过期目标页固定                                 | `FilePreview honors ordinary PDF zoom scroll requests outside a page transition`。                                                                                                                                                                                                                                    |
| 换源取消尚未执行的导航帧                                         | `FilePreview cancels pending PDF navigation frames when its source is replaced`；既有 observer 与来源/native/bitmap 生命周期测试完整重跑。                                                                                                                                                                            |
| 真实首次下拉、previous、首尾边界及 zoom/fit/resize/scroll 后导航 | 浏览器 `first-dropdown-target-content`、`first-previous-after-dropdown`、`fresh-first-page-boundary`、`last-page-boundary`、`return-first-boundary`、`next-after-zoom`、`previous-after-zoom-out`、`previous-during-fit`、`next-during-resize`、`next-after-manual-scroll`，逐项结果见持久 `RequirementEvidence.md`。 |

正式 RED 只失败目标页断言，普通已有用例通过；修复后 GREEN。初轮浏览器也在无注入 reload 上复现第 2 页偏离 viewport 约 800px。原始 RED、首版修复仍 FAIL、宿主并发运行两次 FAIL 和后续串行 PASS 分列保留，不清洗 RAW。

## 证据身份与边界

- 本次 fresh 本地：固定 corepack pnpm 11.22.0（包含 nested shim）、空 node_modules frozen 安装，UI805 / host259（`--maxWorkers=1`，默认时限未改）/ mobile144 / docs-source6+2；逐断言检查 failed/pending0，JSON 无 numUnhandledErrors 字段，另检日志无 unhandled/uncaught。类型、构建、维护 fmt/lint 与浏览器结果以持久回执的实际退出码为准。
- 完整16份依赖输入字节、4 importers / 973 packages / 973 snapshots 完整 lock 对象保持不变；三个活动包 Vue 3.5.39 单例；四份 WASM 等精确安装资源。fixture、notice 与 migration 冻结，无用户文件或第三方文件外发。
- 原 R2 证据只引用持久目录 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t06-parent-acceptance-r2/`；原拒绝评论保留。R1 图片闭环、F04 原来源/native/bitmap 深矩阵按未变 producer 继承，Document 改动部分须以本次 fresh 导航与释放窗口为准。继承不写作 fresh。
- CI、完整 docs #10、packed #11、device/camera #41、旧 consumer #12–15、生产 FileStorage/发布、父 R3 与独立 merger 均 UNRUN；F03 等待1%与F05英文404的继承 P3 不扩修。

临时证据 `/tmp/nerv-ui-t06-pdf-navigation/`；持久 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t06-pdf-navigation-fix/`，含脚本、原日志、JSON、截图、真实 response bodies、`RequirementEvidence.md` 与 `SHA256SUMS`。归档排除 node_modules、cache、cleancheckout、.vite、dist 等生成目录；历史只存 durable 指针，不复制数千文件。校验哈希不等同全文审阅全部历史。
