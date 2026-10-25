# T06/F05 Office 预览实施证据

唯一票 [#76](https://github.com/Mang-X/nerv-ui/issues/76)，scope:M。父 #7 与 spec #1 不在本票关闭。原始来源冻结为 Nerv-IIP `79b1578f2b75f55709765b5e7882aaf33146c603`；implementation base `3d865eb5a61bd8f1497947dadbff82bd73a69673` / tree `792c8bb64607d46cae94e2dc850236a855fe86e6`。最终候选与运行回执在交付章节记录。

## 范围与来源

OfficePreview 持有读取、viewer、导航、缩放和 render surface；FilePreview 只核对 Office 事件的来源和格式；现有 PreviewPanel 供应样张及本地选择。稳定根 FileUpload 与子入口 FilePreview 均保留。PDF F04 的本地 render layer 与 source/native dispose 生命周期没有改动。

原三个 Office fixture 从 `frontend/apps/design-system/docs/public/file-preview/` 原样复制到 `frontend/apps/playground/public/files/`，无需启动文档站。原文档业务措辞仅属于冻结演示内容，没有迁入 SDK/auth/DTO。

| 样张 | 字节 | SHA256 |
| --- | ---: | --- |
| quality-work-instruction.docx | 3062 | 2530d31ba3d3c5045a879bd9acddb9b4dad54e8aed569d0cee09b2da50648dcc |
| inspection-metrics.xlsx | 6424 | a2b21b1dcedcf3ce031a2948d3c3476563342cbd172dee110df0a27599d4a100 |
| preview-review-deck.pptx | 4353 | 6025f8f08a490758e0b68ddfdc602fa742045fba6e82310cae1ecac67ca46fa7 |

三页 reading-journey.docx 由同目录 [生成脚本](generate-fixture.py) 以标准库 ZIP 构造，复用原 DOCX 的包结构与样式，替换 document.xml；明确两处 page break，三页独有 MORNING FOREST / RIVER WALK / SUNSET NOTES 与绿/蓝/橙色表格面板，无第三方新字体。短原 DOCX 不假定多页。三种 broken 文件是相同的固定非 ZIP 文本，不能代表所有损坏 ZIP。

XLSX 的独立 oracle 在浏览器前从 ZIP sharedStrings/workbook/worksheet 读出：Inspection A1 Incoming Inspection Metrics、A3 LOT-2406-014、D3 120/E3 118；Trend A1 Weekly Quality Trend、A3 2026-W22、B3 21/C3 12；Summary A4 Total lots/B4 6、A5 Checked quantity/B5 1570。真实 renderer 的 canvas fillText、像素与截图另列，不以 toolbar sheet 名称替代正文。

## 固定包、资源与许可

`@silurus/ooxml@0.72.2` 的 package.json、types、三 viewer 实际 load/destroy/navigation/render 方法、内置 Worker 代码和相关字体加载路径已核实。旧 0.69 注释已纠正。DOCX `_opts.width/_render`、PPTX `opts.width/renderCurrentSlide` 是隔离的私有 resize 兼容点，公开 setScale 相对自然纸张，不替换现有相对容器缩放语义。

三个 parser WASM 原样复制到库内 `ooxml/`，`?url` 在 dev/prod/basepath 供应。原 MIT LICENSE 与 THIRD_PARTY_NOTICES 原样保留；后者包含 Rust/WASM 许可清单、Unicode-3.0 和可选 MathJax/STIX（本包装层未启用 math）。字体使用嵌入/本机回退，显式 `useGoogleFonts:false`；无新字体包或新发行许可。上游保留的 Google Fonts URL 常量不等于本路径发生了请求。

16 个 package/lock/workspace 输入完整字节等 base；解析后的完整锁对象相等，4 importers / 973 packages / 973 snapshots（包含 resolution/integrity/dependencies/optional/peer），不是 keys-only。三个活动包的 Vue 3.5.39 realpath 相同。原始 JSON 在 raw/dependency-identity.json。

## TDD 与证据身份

测试入口为公开 `@nerv-iip/ui/file-preview`，fake viewer 仅证明 wrapper 编排，不能替代真实 renderer。

| Requirement | Evidence |
| --- | --- |
| src/格式/离页后成功的旧响应体不再创建 viewer 或发旧事件 | `FilePreview discards a successful late %s source body after %s change`，三格式 × source/type/leave 共 9 个实例 |
| 旧 viewer load/error 不污染新来源，destroy 被调用 | `FilePreview isolates late %s load and error after a source switch`，三格式实例 |
| 非 ZIP 假文件不作为空白文档 ready | `FilePreview rejects non-ZIP %s bytes instead of reporting an empty document ready`，三格式实例 |
| 窄容器真实 50% 重绘 | `FilePreview renders a true 50 percent canvas at a narrow office width`，400px → 200px，旧实现 280px 的 RED 保留 |

`red-final-contract.json` 对恢复的 base 生产文件运行最终公开测试：15 项中 12 FAIL / 3 PASS，分别是 9 个来源读取取消缺口与 3 个坏字节缺口；旧 fake 的内部 load 不负责 HTTP，所以 RED 首个断言是受控读取未被包装层持有。三个旧 load 卸载后测试本来已 PASS，不冒称新修复。真实坏 DOCX 原本 ready/1页的浏览器反例在 worker-timeout-state.json。

早期 test 位于 playground 时第三方 mock 解析身份不符，实际报 Worker is not defined；移动到拥有该依赖的 ui 包、仍从稳定子入口消费后纠正。同步 setProps 窗口早于 props 生效、人工 presence stub 导致错误归属的尝试均无效，不能作为产品 RED。原文件、日志与 JSON 保留。浏览器 Worker 自动附加抓取两次超时、首个合并 instrumentation 少分号导致 TypeError 也保留为 harness FAIL。

补充的公开 HTTP 接缝：`FilePreview requests %s bytes with a document Accept instead of an HTML fallback`，三格式固定文档 MIME，原请求无 Accept 的三实例 RED 保留。首轮 missing 地址实际为 Vite SPA 的 200/HTML，不能算404；`history-before-accept/` 保留全轮原证据。最终生产重跑明确要求 missing 的 HTTP status=404，恢复正常样张后真实绘制。

## 最终运行与交付

实现提交 `41a549b8770000e09cc806e5cd5ccea35174ea1a` / tree `4f5923c458cc4b47379b2a18974ae3ace3f1dd83`；后续提交只归档本票证据。PR [#81](https://github.com/Mang-X/nerv-ui/pull/81) 保持草稿，仅向 integration，未合并/关闭/发布/监看。最终 head/tree 由持久 handoff 精确记录，避免把本文件自包含成循环哈希。

- **fresh 候选源码门禁：** UI 802 / mobile 144 / host 249 / docs-source 6+2，全部 exit 0，逐 assertion passed、failed/pending 0。JSON 没有 numUnhandledErrors 字段；日志另查无 unhandled/uncaught。普通 build（含三个活动包 vue-tsc）、`--base=/office-proof/` build、五个受影响源码 fmt/lint 均 exit 0。Accept 修改后 UI/host/build 已重新运行，mobile 与 docs-source 在本轮同一不变 owner 上运行。
- **真实浏览器：** dev 在 Accept 修改前通过 21 点，身份为本轮早期实现；最终生产 basepath 在 Accept 修改后再次通过完整 21 点：DOCX/PPTX 文本、彩色图形、三页不同像素与前后/下拉、50%/200%/reset、resize 保留第2页；XLSX 三张表 canvas/正文不同，独立 ZIP oracle 的数值经实际 fillText 读取。XLSX 原生水平滚动后 canvas 改变，内部 gridRegion 仍有正文高度、底栏 display:none，未提供公开 zoom。
- **错误/恢复：** 三格式坏字节各一次 error+恢复；三个 missing 地址实际 GET **404**，均 error 后恢复真实画面。先前 200/HTML 与早期不正确观察永久保留，不能冒充404。
- **对抗生命周期：** 三格式 × response/body × source/leave = 12 个真实成功读取，bytes/SHA 精确等独立 fixture 清单；旧 signal aborted、释放晚响应后 Worker 构造0，无旧 ready/error。真实 Worker 解析结果含 7564B DOCX JSON、4481B workbook JSON、6889B presentation JSON，故意晚交付；交付前每类1个 Worker 尚存，交付后均销毁、当前图片不变。XLSX 4313B worksheet 晚回亦无污染，Worker 在持有 workbook 的 destroy 时已终止。不承诺抢占已开始解析或所有任意格式故障。
- **本地选择与清理：** 三格式逐一通过真实 file input 生成 Blob 来源、ready 与绘制；来源更换/离页后三个宿主文件 URL 全 revoke，无写请求。正常错误恢复和最终资源 lane 都检查旧 Worker 终止、observer 断开、Office timer/RAF 归零。Worker Blob URL 的 revoke 在 Worker 内记录，三份均回收；不把主页面看不到的 revoke 误报泄漏。
- **最终资源：** 单轮 reload 捕获 **18 个页面 HTTP200 response body + 3 个 Worker WASM response body**，全部逐字节等最终 dist，URL/status/MIME/bytes/SHA/initiator 与 body 路径见 raw/final-resource-validation.json；WASM MIME 为 application/wasm，字节 892883 / 860696 / 815854。Blob worker 脚本不是 HTTP/dist 文件，原始脚本另存。测试 recorder 只在验收注入，把原 parser 脚本原样接在前缀后；生命周期 lane 不依赖这个 Worker fetch recorder，也没有 fake renderer。
- **console：** 最终主页面 console=[]、window error/unhandled=[]、Worker error=[]；三个 parser Worker 各保留一条上游 WASM 初始化 deprecated-parameters warning，不能声称零 warning。普通 build 的 CSS/motion/PURE/chunk warning 与原日志保留。

最终浏览器源/WASM/字体请求仅 loopback，非 loopback 由验收阻断；没有 Office 在线服务、文件外发或隐式写请求。字体仍受本机/嵌入覆盖限制，原 LICENSE/NOTICE 未删除。HTTP body 哈希核对不等于全文审阅所有第三方产物。

原始脚本/日志/截图/response bodies、有效与无效 RED、完整 history-before-accept、研究/控制和前序 F04 R2 receipt 保存于 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t06-f05-implementation-r1/`；仓内只保留本票可审核心记录及截图。归档过滤 node_modules/cache/cleancheckout/.vite/dist/.git，SHA256SUMS 逐文件回读。原始 RAW diff-check 与维护文件检查分别记录，不清洗历史字节。

**UNRUN / 独立边界：** 独立审核、父 #7 组合、CI、packed #11、完整 docs #10、device #41、旧 consumer #12–15、发布。F01–04 完整旧 browser 为 inherited；F02 route/窄屏缺字 UNKNOWN、F04 R1 两个 FAIL 及其 R2 修复历史、F03 PUT 初始1% P3、#43/#51 均保留且不扩修。原库/main、双 main 和 migration 来源不写。真实测试不是 packed 消费验收。
