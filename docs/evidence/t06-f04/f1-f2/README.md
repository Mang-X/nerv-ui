# T06/F04 #75 / PR80 F1/F2 实施修复

唯一目标 [PR80](https://github.com/Mang-X/nerv-ui/pull/80)，保留 OPEN/DRAFT，交独立 R2；未 ready、merge、close、watch 或发布。仅 F1/F2，不重做设计。API 文档同步在 `frontend/apps/design-system/docs/components/desktop/file-preview.md`。

## 固定对象与范围

- R1 被拒 head `3f67b382b3a6165dc9d32a037bf514d4ca6d9f08` / tree `123fee8f733e9ed72c7b7b7848ad4ab512ce9708`。
- 修复实现 `cfa133f0cfa832bae74e70e5e0598813d2857f7e` / tree `aa3cbb36af36c556052148eca2cee635ec9467e6`。其后本目录是证据增量；最终提交身份见持久 handoff，不做自引用 SHA。
- 两次 fresh fetch+merge 最新 integration 均未前进：base `51ae30e34b5aa2f4bd6ae534d5ca1bf6b8af62e9` / tree `03604adf595a918259a163588c4fd25990dc09f6`。
- 真正任务树 `/Users/mang/Project/nerv-ui-worktrees/t06-f04-pdf-preview`，branch `feat/t06-f04-pdf-preview`。所有 shell 显式 workdir。root/旧源只读，migration 冻结、双 main 不变。
- 生产改动仅 PdfPreview 来源读取、PdfPreviewDocument 的本地位图层接线、新内部 PdfPreviewRenderLayer；公开入口/props/types 不扩展，viewport 桥接与工具栏保留。不写 node_modules/上游包，不增依赖/升级/Worker/pdf.js/CDN/新许可。

## 根因与实际释放边界

F1：固定 2.14.4 的 DocumentManager 对 loading 文档只删除 store；engine.openDocumentUrl 的 fetch 与 arrayBuffer 在 task abort/destroy 后仍能进入 native open。PdfPreview 现持有来源 AbortController，保留 Accept:application/pdf，通过既有 DocumentManager buffer API 打开。response/body 两个 await 后都检查生命周期；过期完整字节不再交给 PDFium。native open 若已经入队，持有其完成任务，晚成功结果显式 close，再销毁 engine；内部 documentId 含来源代次以隔离重复源。

取消是对已发读动作的 best effort：测试刻意让真正 1129B 成功响应/完整 body 在 abort 后仍返回，产品丢弃它们；不宣称同步停止已完成的网络读或抢占主线程 native 调用。真实入队闸门证明晚 open 在 destroy 前完成并 close，cache 0→1→0，再 destroy，最终0。没有以 GC 替代释放。

F2：固定 RenderLayer 只在 hasLoaded 后回收 URL，render task/URL 生命周期与 decode 混在一起。本地内部层沿用 document/page/scale/dpr/refreshVersion 和现有 render capability，逐轮持有 task 与 URL；失效时 abort 和 revoke，无须等 img load；晚 bitmap 在失效检查前不创建 URL。不全局 patch URL。浏览器探针 patch 仅用于观测/控制窗口，已恢复。

已开始的 Canvas.toBlob 编码不作可中断承诺；真实 WASM 生成的 PNG 晚完成后没有新增 URL。当前有效轮的 URL 在 decode/load 期间保留；已 load 对照正常显示后才随失效/卸载回收。保留 direct 主线程、固定2.14.4、本地4633788B WASM与原 notices；中文仍只承诺已知嵌入 glyph。

## Requirement | Evidence

以下 7 条正式回归均经 `FilePreview` 公共组件 DOM/事件测试；底层 engine/capability 在 unit 中受控，不代称真实 PDF 渲染。完整真实反例在独立 browser lane 补足。

| Requirement | Evidence |
| --- | --- |
| body pending 时卸载，无晚分配 | `FilePreview cancels a PDF body read on unmount without allocating a late document`：unit RED 28PASS/1FAIL→同名 GREEN；真实 `F1-body-unmount`，1129B、signal aborted、晚释放后旧 open0/cache0。 |
| fetch pending 时换源与当前源隔离 | `FilePreview cancels an obsolete PDF fetch and keeps the current source active`；真实 `F1-response-source` / `F1-body-source` / `F1-response-unmount`，旧源0分配、当前中文 ready 与真 bitmap 保留。 |
| 已入队 native 晚成功显式 close 后 destroy | `FilePreview closes a queued PDF open that completes after unmount before destroying the engine`；真实 `F1-actual-native-queued-open-unmount` / `F1-actual-native-queued-open-source`，实际 executor 1129B、native cache0→1→0、destroy后0。 |
| img load 前卸载回收 | `FilePreview releases the PDF bitmap URL when leaving before image load`；原/本轮 RED：真实99755B image/png create1/revoke0；同窗口 GREEN create1/revoke1、naturalWidth0、outstanding0。 |
| 已 load 对照，不提前 revoke | `FilePreview keeps a loaded PDF bitmap alive until its owner unmounts`；真实 `F2-loaded-bitmap-retained-until-unmount`，解码图像 URL 仍有效，离页后全部撤销。 |
| 快速 zoom/src 替换未解码位图 | `FilePreview releases undecoded PDF bitmaps on rapid zoom and source replacement`；真实 `F2-undecoded-rapid-zoom-source-replacement`，旧轮均回收、当前轮保留，最终全部回收。 |
| 进行中 render 与晚 bitmap | `FilePreview aborts a pending PDF render and ignores its late bitmap after unmount`；真实 `F2-real-PDFium-toBlob-completes-after-unmount`，WASM真实PNG>90000B，编码完成回调延后到离页，无新增URL/errors。 |

[原 R1 拒绝回执](inherited-r1/review-receipt.md)及其未改写 browser-10/11 与原 finding JSON 随本目录保留。原 R1 Standards material0/optional0、Spec material2/P2/optional0 的拒绝未改写。R1 原 receipt、browser-10/11 与两个 finding JSON 全保留在持久 inherited-review-r1；本轮复现 RED JSON 亦在本目录。原审查脚本断言未改。GREEN 使用新的修复验证脚本与相反的产品期望，完整日志保留。不把预期确认缺陷的脚本 exit0 当作产品 PASS。

## Fresh 门禁与真实 renderer

- 固定 corepack pnpm@11.22.0，nested pnpm shim 同版本。UI **783** / mobile **144** / host **249** / docs-source **6+2**，全部 exit0；JSON success=true、逐 assertion passed、failed/pending0。numUnhandledErrors 字段 **NOT PROVIDED**，日志 unhandled/uncaught 行0。完整命令/cwd/exit/时长见 raw/commands.jsonl。
- 完整 build exit0，含三活动包 vue-tsc；普通与 `/pdf-proof/` build、7文件维护 fmt/lint exit0且 lint无诊断。实际检查在实现提交前相同源码字节执行，其后仅本证据目录，未冒称最终 docs commit 上重跑全tests。CSS/motion/PURE/chunk warnings 原样保留。
- dev/prod 各 **10** 画面/几何 + **9** 错误恢复/生命周期读回：`multipage-page-one`、`next-page-two`、`dropdown-page-three`、`previous-page-two`、`zoom-in-geometry`、`zoom-out-geometry`、`fit-width-geometry`、`native-scroll-geometry`、`single-page-1129`、`embedded-chinese`。3页像素219434/158230/261150且hash不同；中文88363，已实际查看第二页/第三页/中文截图。404、坏PDF、WASM阻断均恢复；旧错误/初始化晚回不污染当前源，离页 observer/timer/worker/URL/errors均0。
- 新生产 bundle 实际捕获 **31个 HTTP200 body** 全部逐字节等本轮 fresh dist，逐资源 URL/type/status/MIME/bytes/SHA/initiator/body 在持久 RAW。真实404 **1个**；旧 missing 请求已取消，不再凑成2个404。http/https外联探针均 CDP inspector blocked、写请求0。native/Blob 非HTTP资源单列。对抗 native 私有队列探针运行在dev；生产实际bundle与正常矩阵独立证明，不混称prod native探针。
- 16完整依赖输入 byte-equal，4 importers/973 packages/973 snapshots **全对象相等**，含 resolution/integrity/依赖/optional/peer；Vue3.5.39三活动包同realpath。WASM与许可证、OFL原包字节相等。不是 keys-only 或 hash=全文审阅。
- 维护范围 diff-check0；base→候选全量 diff-check **exit2/17条** 仍是原1129B PDF xref7 + 原RAW build10；不清洗历史证据。

## 保留的失败、继承与未运行

本轮所有失败也保留：最初 F2 unit harness 未提供真实 registry，7条失败，不是有效产品RED；接着注释误吞括号导致0测试语法失败，不计PASS；修正后一次晚bitmap测试把其它存活fixture的既有URL分配数当成0，改为断言晚回前后无新增，最终35/35。其失败JSON/日志全保留，正式F2 RED来自真实browser。

browser首次F1验证遭开发中HMR/时序影响超时，第二版完成四窗口；F2首次运行处在语法失败期超时，第二版假定desktop入口而实际files导致selector超时，第三版显式回desktop后通过。未把上述工具FAIL改作产品 finding 或抹除。T3 status/open/navigation成功，同步snapshot连续两次原始 `Preview automation snapshot timed out after 15000ms.` 后按授权fallback现有ego；无升级。Ego有更新提示，仅记录。

原实施/R1 的字体blank、observer泄漏、HTML200缺失文件、初始化测试准备失败等全部 inherited 保留。F01–03完整browser回执仅inherited，F02 route/窄屏缺字UNKNOWN、F03 PUT初始1%P3原样留存。独立R2/CI/Office76/父7组合/packed11/完整docs10/device41/旧consumer12–15/生产发布均UNRUN，#43/#51未扩修。无新的已知未处理范围内material异议；F1/F2仍待独立R2裁决。

## 证据与清理

临时 `/tmp/nerv-ui-t06-f04-fix/`，持久 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t06-f04-fix/`。仓内仅精选JSON/截图；完整脚本、所有轮次FAIL/RAW/HTTP body、R1完整归档与原实施继承在持久目录，过滤 node_modules/cache/cleancheckout/.vite/dist/.git/__pycache__。每层 SHA256SUMS 均逐文件回读；原 R1/实施归档 hash核验不冒称逐字审阅第三方或全部历史材料。

自有 ego space37 已 finish({keep:[]}) resolved，T3自有tab已关闭；nativezoom未改且scale1/width=scrollWidth2300/dpr2。仅核对cwd/command后的自有5230/5231服务SIGTERM，listeners absent，wrapper exit143为主动清理。任务工作树最终clean保留交父/R2；root/旧源未写。
