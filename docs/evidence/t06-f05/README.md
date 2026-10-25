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
