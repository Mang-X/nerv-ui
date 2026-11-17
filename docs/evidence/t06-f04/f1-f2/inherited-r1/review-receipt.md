# T06/F04 #75 / PR80 独立 merger R1 回执

日期：2026-10-25。结论：**Standards material 0 / optional 0；Spec material 2（F1、F2 均 P2）/ optional 0。本轮拒绝集成，返父实施。** 未 ready、merge、close、改码或写 GitHub 评论。#75 保持 open，PR80 保持 OPEN/DRAFT；父 #7/#1 open，总 PR18 OPEN/DRAFT。现有正常渲染与门禁 PASS 不抵消生命周期反例。

## 固定对象、授权与来源

- 唯一目标 https://github.com/Mang-X/nerv-ui/pull/80 ，base `integration/nerv-ui-extraction`。
- head `3f67b382b3a6165dc9d32a037bf514d4ca6d9f08`；tree `123fee8f733e9ed72c7b7b7848ad4ab512ce9708`。
- base/integration `51ae30e34b5aa2f4bd6ae534d5ca1bf6b8af62e9`；tree `03604adf595a918259a163588c4fd25990dc09f6`。merge-base 精确等 base；实时 PR、远端 refs、本地对象相同。开工和结束目标/root均 clean。
- diff `git diff 51ae30e34b5aa2f4bd6ae534d5ca1bf6b8af62e9...HEAD`。两笔提交 ac505d8e532bf09a78243d9edbdf5966c4f80f0b 实现，3f67b38 仅 docs/evidence/t06-f04；差异列表已实际核对。全部 fresh tests/build 直接执行在最终 head。
- 所有 shell 显式 workdir `/Users/mang/Project/nerv-ui-worktrees/t06-f04-pdf-preview`；root/旧源只用明确 `git -C` 或 subprocess cwd 只读核验，未写旧自动树。目标任务树保留交父。
- 已读 implement-spec 第5步、code-review、verification-before-completion、真实根/包 AGENTS、包 CLAUDE→AGENTS、README、frontend/DESIGN/governance、API/接入文档。采用 pnpm、vue-best-practices；浏览器 fallback 使用 ego-browser 技能。
- 原 brief 为实时 Issue75 全文，父7/spec1亦实时读取，见 raw/issue-{75,7,1}.json；研究 /tmp/nerv-ui-t06-research.md、控制 /tmp/nerv-ui-implementation-context.md、实施 handoff、仓内 README/RAW及 F01–03 同日独立回执已读。无前轮 finding/未决异议。旧回执仅 inherited。
- 立即 T3 link PR80；最终 list 只关联本票、watching=false，未 watch/poll。两个只读轴用独立 T3 child，均 codex/gpt-6.1-sol、reasoningEffort=high/serviceTier=default；原始轴结论 raw/standards.md、raw/spec.md。重型门禁和浏览器由 merger 独占。

## Standards

独立轴 **material 0、硬违规 0、smell 建议 0**。原报告 raw/standards.md，未与 Spec 互相抵消。

覆盖全部手写生产/测试差异、文档和 fixture/vendor 来源；file-preview 为包规则明确的自研冻结例外。公开桶/子入口/名称/default/props/types保持，未新增 SDK/auth/DTO 或 CSS token/层越权。source guard 两层有不同责任，viewport DOM 桥接有具体泄漏修复目的，不据此报重复/过度抽象。RAW抽读、第三方内部非全文审阅；轴席未执行完整tests/build/browser。

merger 独立审计：16 个完整 package/lock/workspace 输入 byte-equal；完整 lock 对象相等，4 importers / 973 packages / 973 snapshots 全对象相同，含 resolution/integrity/依赖/optional/peer，非 keys-only。三活动包 Vue3.5.39 实际同一 realpath。资源 WASM、MIT LICENSE、LICENSE.pdfium 与固定已装 @embedpdf/pdfium@2.14.4 原包逐字节相同；WASM4633788B/SHA256 c0af5a6aca30d7e54a149c3a68e317116ca906d6edc28fd3318b12c7d9478ac8。OFL notice 与 fonts-sc 原包相等，轴席核实嵌入派生字体 family/full/PostScript 已改为 Nerv Fixture Hans/NervFixtureHans-Regular。没有新仓库许可、依赖升级、CDN替代。

## Spec

独立轴 **material 2（均P2）、optional 0**。原报告 raw/spec.md 保留；merger随后用真实公开 FilePreview/PDFium/WASM路径独立确认两项。owner 均为本票 F04，足以阻止本轮合并。

### F1 / P2：有效文档晚到成功会在 engine 销毁后重开

- 位置 `frontend/packages/ui/src/components/ui/file-preview/PdfPreview.vue:39`（disposeEngine）、`:92`（卸载顺序）、`:109`（文档 requestOptions 无取消 signal）。
- 公开触发：在 `/#files` 选择原1129B有效PDF，延迟该GET成功；引擎已初始化且正在加载文档时点击“桌面演示”，待真正 destroy 完成后再释放有效响应。
- 结果：FilePreview 已不在 DOM，engine销毁后的native cache documents=0；晚响应仍执行 openDocumentBuffer，成功返回1页，cache documents=1，没有产品侧后续close。没有伪造engine/ready，原WASM与有效PDF字节真实执行。证据 `browser-10.mjs`、raw/browser-10.log、raw/finding-f1-public-browser.json。观测后探针主动close至0，raw/finding-f1-cleanup.json。
- producer链：2.14.4 DocumentManager.closeDocument 对 loading 状态仅删 store；openDocumentUrl 仍 await fetch/arrayBuffer，随后无 destroyed guard 调 openDocumentBuffer；direct engine destroy也不取消此待返回GET。registry destroy和已打开文档close并不能覆盖该请求。守住ready/error不会阻止native文档晚分配。
- AC：#75“快速换源”“离页不残留…或晚到事件”及本PR新文档的 engine 释放承诺。head引入direct执行路径但未闭合在途成功；base worker路径本轮未运行，不冒称base fresh对照。新增测试只覆盖engine初始化晚到；已有真实延迟的是missing.pdf失败，未覆盖有效文档晚成功。
- 影响表述仅限实际证明：销毁后native资源重新打开且缺少后续显式close；不推断GC后的无限驻留或超大PDF性能。

### F2 / P2：bitmap URL创建后、图片load前卸载不回收URL

- 位置 `frontend/packages/ui/src/components/ui/file-preview/PdfPreviewDocument.vue:115`；固定producer `@embedpdf/plugin-render/dist/vue/index.js:71–89`。
- 公开触发：真实1129B PDF渲染出bitmap Blob URL后，在img尚未load窗口换源/离页。
- merger真实浏览器以HTMLImageElement.src赋值闸门控制decode/load时序；不mock renderer/engine/bitmap：实际WASM实例630exports，PDFium生成 **99,755B image/png**，img naturalWidth=0。离页后observer/timer已0、FilePreview消失，该URL仍 revoked=false，创建1/回收0。证据 `browser-11.mjs`、raw/browser-11.log、raw/finding-f2-public-browser.json。记录反例后恢复原setter并手动回收，清理不改写失败结果。
- producer cleanup只有hasLoaded=true才revoke；urlRef已存在且hasLoaded=false时既不revoke也不abort。engine/registry没有该URL ownership。轴席用真实Vue/core/RenderLayer、受控capability的轻量jsdom探针另得未load1/0、已load1/1对照（raw/spec-probe-tool-transcript.json）；该Node探针只证明ownership，不冒称真实PDF渲染，merger浏览器证据补足实际bitmap路径。
- base/head依赖和RenderLayer调用路径相同，是**本票AC范围内继承缺口**，不是伪称新增上游bug。现有正式测试mock RenderLayer；已存正常browser均先等解码再离页，遗漏此窗口。#75生命周期与文档URL释放承诺未闭合。

Document手动viewport桥接的register/resize/scroll/onScrollRequest/gating与固定producer对照过；真实页导航/zoom/fit/scroll可用，disconnect/scroll订阅/RAF清理有代码与正常离页读回。上游provide("viewport-element")仅供当前未使用的ZoomGesture路径，未据该差异报无触发条件的finding。上述viewport修复不解决F1/F2的不同资源owner。

## Fresh 独立正常门禁与浏览器

完整命令/显式cwd/exit/耗时见 verify.py、raw/commands.jsonl；Python全经uv，外部bin/pnpm shim固定corepack pnpm@11.22.0，包括nested scripts。

- UI **776** / mobile **144** / host **249** / docs-source **6+2** 全exit0；逐assertion均passed，JSONsuccess、failed/pending0。numUnhandledErrors字段未提供，保留NOT PROVIDED；日志无unhandled/uncaught行。raw/result-validation.json。
- build exit0含三个活动包vue-tsc；production普通/base `/pdf-proof/` build、维护6代码文件fmt/lint exit0、lint无诊断。原CSS/motion/PURE/chunk warnings保留。
- scoped diff-check0；全量diff-check **exit2/17条**：原PDF xref7、RAW build10，未清洗证据字节。
- T3 preview_status/open成功；首次about:blank解析失败后改为空参open，navigate本席production5220成功。同一步snapshot两次均 `Preview automation snapshot timed out after 15000ms.`，按授权fallback已安装ego-browser，未升级。自有space36/p1。
- production `/pdf-proof/` **10画面/几何读回**：原1129B单页、3页独有文本/图形、嵌入合法字体中文；上一/下一/下拉/首尾disabled；zoom in/out/fit和真实wheel scroll。三页非白像素219434/158230/261150、独立bitmap hash；中文88363且已目视“春日阅读/山水之间/中文字体已嵌入”。已实际查看fresh第二页、第三页、中文截图。原PDF和三页均真正渲染为img，再绘检查canvas取像素，不用class/mock替代。
- **9失败/晚回读回**：真实404、坏PDF、WASM阻断各恢复；旧错误晚回当前中文仍ready；初始化WASM晚到而换图片不取旧PDF。正常解码后离页workers/observer/timer0、URL全回收。以上是正常矩阵特定时序，F1/F2针对另外窗口，不能推广“所有生命周期通过”。
- actual生产响应body **25个HTTP200**逐字节等fresh dist（renderer JS/WASM/PDF等）；URL/type/status/MIME/bytes/SHA/initiator/body路径见raw/fresh-prod-*-resources.json及fresh-resource-validation.json。missing.pdf真实404×2；http/https外联探针均被CDP inspector阻断，实际请求写0。非HTTP/blob及其body单列，不当dist资源。初始desktop及files图片态无PDF/Office renderer/doc/WASM；UI Inter字体单列。
- direct主线程，无Worker constructor/独立worker response；不造cmaps/std-fonts。fontFallback:null仅已知嵌入glyph，不承诺任意CJK/缺字体PDF/超大PDF性能。
- dev fresh主要用于上述两个对抗生命周期反例；完整dev正常导航矩阵未重新全跑，见下述继承。

## Inherited、历史FAIL与未运行

- 实施31个真实HTTP200捕获body由merger在fresh最终head build后全部逐字节核对，相同；raw/inherited-fresh-dist.json。它们支持对应的正常dev/prod画面/资源继承，**不把旧运行改称本席fresh**。实施最终dev三组矩阵、正常离页清理、prod10+9读回已抽核；不同时间/修改阶段仍照原记录保留。
- 仓内49文件、持久实施归档2695文件 SHA256SUMS 全部回读匹配；这是**完整hash核验**，不是2695文件逐字审阅或全部fresh。merger/轴席RAW、第三方内部均有未读边界。
- 前序F01–03独立回执仅inherited，未重跑完整上传/布局/HTTP矩阵。F02历史route FAIL与窄屏缺字UNKNOWN、F03等待PUT初始1%P3不擦除。#43/#51不扩修。
- 实施所有RED、observer初始FAIL、字体blank、无效测试/准备失败、T3超时、HTML200缺失PDF等完整历史保留于inherited-implementation；本轮17条diffcheck也保留。
- 本轮browser05本地PDF探针超时来自前轮测试残留的WASM gate；06读回并释放后reload。08/09在导航后误假定CDP新文档注入跨CLI持久，缺__pdfAudit而TypeError；分别在10/11同轮显式注入后完成反例。原脚本/日志保留，失败未计作产品反例或PASS。本轮本地file-input URL完整矩阵未完成，不冒称fresh PASS。
- Office76、父7组合、CI（checks=[]）、packed11、完整docs10、device41、旧consumer12–15、生产发布均UNRUN。复制wasm+notice是后续#11必须纳入包内容、类型/构建消费及basepath资源验收的边界；本票source workspace/Vite成功不代验packed。

## 状态、清理与归档

本轮 **不合并**：未调用ready/merge/close、未改源代码/测试/仓内证据，也未发布GitHub评论或Review。PR80仍OPEN/DRAFT、head/base精确如上；#75/#7/#1 open、PR18OPEN/DRAFT。root integration仍base/tree不变且clean。

双main不变：新库main `599031a688496679e300458f56a1896d41ac8f81`；旧源main `ecb7626378e446dcc361cfc4f3c43227ba7e8364`。旧源HEAD `79b1578f2b75f55709765b5e7882aaf33146c603` / tree `58e30c637acb7efdd393af291e570288b03b5aa9` clean，完全未写；raw/identities-final.json。任务树HEAD/tree仍固定head且clean保留。

反例观测后，F1探针native cache手动close至0，F2遗留URL手动revoke；browser-cleanup中worker/observer/timer/未回收URL/errors均空。nativezoom未改，最终width=scrollWidth2300/scale1/dpr2；ego space36 finish({keep:[]})已resolved。T3自有tab关闭。按cwd/command核验自有production5220 PID47703、dev5221 PID23083后SIGTERM，listeners absent；两pnpm wrapper实际exit143，属于主动清理。未清理其它服务/任务树。Ego提示有更新，遵用户指令未升级。

临时回执 `/tmp/nerv-ui-t06-f04-merger-r1-20261025/review-receipt.md`；持久 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t06-f04-review-r1/`，包括本轮脚本/RAW/截图/响应body、两个独立轴原报告、历史实施归档、研究/控制及F01–03回执。过滤node_modules/cleancheckout/cache/.vite/dist/.git/__pycache__，附SHA256SUMS并逐文件回读。

两轴汇总：Standards material0/optional0；Spec material2/optional0，最严重P2（F1、F2）。父代理收到此固定候选及反例后安排最窄实施；本merger不修复、不另开审核轮。
