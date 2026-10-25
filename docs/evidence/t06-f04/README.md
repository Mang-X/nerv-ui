# T06/F04：PDFium 真实渲染实施证据

唯一票 [#75](https://github.com/Mang-X/nerv-ui/issues/75)，scope:M，单 PR 到 integration/nerv-ui-extraction。实现席自证，独立 review/merger **UNRUN**。起点 `51ae30e34b5aa2f4bd6ae534d5ca1bf6b8af62e9` / tree `03604adf595a918259a163588c4fd25990dc09f6`，开工 clean。真实任务树 `/Users/mang/Project/nerv-ui-worktrees/t06-f04-pdf-preview`；全部 shell 显式 workdir 此处，旧 T3 自动树无实现写入。

保留根 FileUpload、稳定 FilePreview 子入口和 F01–F03 能力。仅适配 PdfPreview engine/provider 生命周期、Document 的 viewport DOM 桥接及当前来源事件隔离；Toolbar 公开行为保持原实现，另验分页/边界/计时器。没有业务 SDK/auth/DTO、依赖升级、远程 CDN 替代、vendor JS 修改或新仓库许可。

## Requirement | Evidence

| Requirement | Evidence |
| --- | --- |
| 初始化失败公开 RED→GREEN | `FilePreview reports PDF initialization failure instead of indefinite loading`：red-init 22PASS/1FAIL → green-init 23PASS；最终套件同名 PASS。旧加载分支遮蔽 error。 |
| 未激活文档失败公开 RED→GREEN | `FilePreview reports PDF document failure before activation`：red-document 23PASS/1FAIL → green-document-v2 24PASS；按已知 documentId 渲染状态，不等 activeDocumentId。 |
| 快速换源只发当前来源事件 | `FilePreview ignores obsolete PDF status while switching sources`：red-source 24PASS/1FAIL → green-source 25PASS；真实 renderer 的延迟旧错误释放后当前中文仍 ready，见浏览器矩阵。 |
| engine 初始化晚到、离页清理 | `FilePreview disposes a PDF engine that resolves after unmount without late events`；真实 WASM 初始化闸门在图片替换后释放，无旧 PDF GET/事件。 |
| observer/scroll/RAF 清理 | `FilePreview disconnects the PDF viewport observer and scroll subscription on unmount`：red-viewport-valid 27PASS/1FAIL（disconnect0）→ green-viewport-valid 28PASS。browser13 原真实清理 FAIL；browser16 修复后 workers/活动observer/timer均0。 |
| Toolbar 下拉与边界/计时器 | `FilePreview allows jumping PDF pages from the unified toolbar`；`FilePreview releases the PDF page jump timer on unmount and disables page boundaries`。真实 `next-page-two`、`dropdown-page-three`、`previous-page-two` 对照截图/scrollTop/bitmap像素。 |
| 本地 PDF 宿主 URL 与无写请求 | `offers local PDF fixtures and owns a local PDF URL without upload writes`；库/宿主既有测试保留，实际网络另核对 GET/HEAD 与阻断外联。 |
| 原1129字节/三页/中文真实画面 | `single-page-1129`、`multipage-page-one`、`next-page-two`、`dropdown-page-three`、`embedded-chinese`：PDFium实际解码 bitmap，绘入检查canvas读取非白像素与hash，另目视截图。mock engine/RenderLayer测试不算renderer验收。 |
| zoom/fit/scroll真实变化 | `zoom-in-geometry`、`zoom-out-geometry`、`fit-width-geometry`、`native-scroll-geometry`：图像rect宽高/viewport位置对照，非仅工具栏数字。 |
| HTTP404/坏PDF/WASM失败恢复 | `pdf-missing-error/recovery`、`pdf-broken-error/recovery`、`wasm-blocked-error/wasm-recovery`；PDF请求明确 Accept:application/pdf，独立真实404与HTML200坏内容区分。 |

## 实现与资源身份

上游精确 2.14.4 Vue hook 默认 jsDelivr WASM，异步初始化卸载未守卫；worker wasmError不进入其ready路径。当前采用同版本 public direct engine API，WASM随库资源本地供应，明确主线程模式：**不创建 Worker，无独立 worker response**。`fontFallback:null`，不换远程字体，不虚造 cmaps/standard_fonts。2.14.4 上游 Viewport 的 ResizeObserver没有disconnect；Document只接管DOM桥接，继续使用viewport/scroll/zoom插件。上游 EmbedPDF await 后注册hook会有Vue warning，当前显式管理registry以补清理；警告保留。

WASM来源为已安装 `@embedpdf/pdfium@2.14.4/dist/pdfium.wasm`，4,633,788 bytes，SHA256 `c0af5a6aca30d7e54a149c3a68e317116ca906d6edc28fd3318b12c7d9478ac8`。库内资源、实际 HTTP body、最终 dist 三者逐字节核对；`application/wasm`，WebAssembly.validate/compile成功，真实 Emscripten实例及PDF画面另有记录。LICENSE / LICENSE.pdfium原样保留。完整包/wasm/worker/font/license文件审计见 producer-audit.json；没有把包内worker代码字符串说成已加载worker。

原单页 SHA256 `09914b585f5395d52a76609dca4aa3c6771b2e03144ac43f02b503ad00a87a67`；三页 `ef7e0c8edc0b2a984a78d60dd3f2439708f48f5b379b42633a055c571c461137`；中文 `04bfc41b569eb5e933088c1045cf133e21dd05c28dd8b6c0580418718fa99f8f`。中文已知文本“春日阅读／山水之间／中文字体已嵌入”，字体取已锁定 fonts-sc@1.0.0，保留 Adobe/Google OFL 1.1 notice。fontTools 子集/CFF转TrueType后更名嵌入；producer字体SHA与脚本在 PDF-SOURCES.md/持久证据。不承诺缺少嵌入字体的任意中文完整。

16个依赖输入逐字节相同，完整lock及4 importers/973 packages/973 snapshots全对象相同（含resolution/integrity/peer/optional依赖，非keys-only）。三个活动包Vue3.5.39同一realpath。源码来源冻结migration与旧源不改，回传决定留给#12–#15。

## 门禁、失败与边界

最终本地 UI **776**、mobile **144**、host **249**、docs-source **6+2**，JSON success=true、failed/pending0且逐assertion均passed；numUnhandledErrors **NOT PROVIDED**，日志无unhandled/uncaught行。命令、cwd、exit、耗时见raw/final-header/commands.jsonl。普通build（含三个活动包typecheck）、base `/pdf-proof/` build、维护6代码文件fmt/lint均exit0；最终lint无诊断。旧轮unicorn warning、CSS parser、motion变量/PURE等原始warnings保留。

F01/F02/F03独立回执仅 **inherited**，没有重放其整套上传/布局/协议矩阵；本轮全套相关测试为fresh。F03等待PUT初始1%的P3按授权延后，未顺修。Office #76、父#7组合、CI、packed#11、完整docs#10、device#41、旧consumer#12–#15、生产FileStorage/发布 **UNRUN**；#43/#51未扩修。直接source workspace宿主不替代packed消费。

保留全部初始RED、失败工具轮和原日志空白：路径猜测、脚本SyntaxError/TypeError、T3 snapshot两次超时、早期字体blank、工具栏ready时过早截图、误等canvas（renderer实为img）、smooth scroll过早几何、HMR丢popup、错误anchor、上游observer泄漏、初轮无效viewport测试count、production preview base失配、缺失PDF回退HTML200。`tool-failures.md`与原RAW区分产品失败/准备失败/无效证据，后续PASS不覆盖历史。最早未落盘的工具错误另标“转录”，不冒称完整工具export。原F02 route FAIL/窄屏缺字UNKNOWN保持继承回执边界。

## 最终浏览器资源读回

生产 `/pdf-proof/` 最终 renderer 10条画面/几何读回 + 9条失败/晚回/初始化卸载读回；31个实际HTTP200 decoded response body 与最终dist逐字节相同，包含HTML/JS/CSS/Inter/图片/PDF/WASM。原始响应体保存于持久归档，仓内JSON保留各URL/type/status/content-type/bytes/SHA/initiator和对应body相对路径。两个缺失PDF请求实际404；两个非loopback http/https探针均被CDP以inspector阻断，写请求0。initial desktop与files图片态没有PDF/Office renderer JS/WASM/doc请求；UI Inter自托管字体可提前加载，不概括为所有字体懒加载。所有Worker0、observer/timer活动0、bitmap Blob URL全回收、window error/unhandled0；实际WASM实例记录已完成。

截图：[第二页](raw/final-prod-page-two.png)、[第三页](raw/final-prod-page-three.png)、[单页](raw/final-prod-single.png)、[中文glyph](raw/final-prod-chinese.png)。

完整脚本、原始失败、所有response body与输入回执在 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t06-f04-implementation-r1/`，临时 `/tmp/nerv-ui-t06-f04/`。过滤node_modules/cache/cleancheckout/.vite/dist/.git后逐文件SHA256SUMS回读；仓内选取原始报告/截图，二者不互相冒称包含全部body。最终base/head/tree与PR状态由持久 handoff.md 固定。

最终dev复验含真实404/坏文件恢复/原单页/三页/中文，WASM bytes/MIME/hash及实例均吻合，离页worker/observer/timer均0（raw/final-dev-matrix.json）。两轮完整response共54项，其中31个应用HTTP200响应全部匹配dist；本地blob、浏览器自有chrome-extension资源及404单独保留，不把它们当dist文件。

清理：ego space35 finish({keep:[]})已resolved；T3自有tab已关闭。浏览器未改native zoom，最终width=scrollWidth2300、scale1、dpr2。两个自有5215/5216服务核对PID/cwd后SIGTERM，listeners absent；wrapper143属于主动停止，非自然exit0。

完整staged diff-check包含原样PDF时exit2：7条xref行的原始尾空白；维护代码/文档范围独立exit0。保留PDF字节与RAW，未为格式检查清洗证据。
