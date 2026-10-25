# 独立文件接入（T06/F01）

启动命令与 Node/pnpm 版本沿用[桌面接入](desktop-standalone.md)。`pnpm -C frontend dev` 后打开 `/#files`；所有已完成 desktop/touch/mobile/screen 分组都有“留住片刻”链接，文件页保留各 hash 返回入口。

宿主从 `@nerv-iip/ui` 消费 FileUpload、公开类型/helper/ref；从稳定 `@nerv-iip/ui/file-preview` 消费 FilePreview，不使用源码 alias、原仓 SDK/auth/业务后端。布局和样式沿用公共主桶 CSS、语义令牌和 Inter 自托管字体；没有全局覆盖。

上传默认 `autoUpload=false`，选择与拖放只入队。开始上传后宿主创建内存会话；“推进传输”依次走 25/65/100，“本次传输失败”拒绝当前传输，文件行可暂停/继续/重试。adapter 响应 signal 的 AbortError，所有计数、操作记录和成功快照可读回。这里没有 HTTP endpoint，没有 PUT/PATCH 或第三方外发。回执应替换当前快照；清空、变体切换与离页显式清空宿主回执。avatar 更换文件也清空此前回执，不依赖 synthetic empty。

同页可选 default/queue/compact/avatar/gallery/table/image。默认最多 5 个、每文件 32 KiB；类型策略可选扩展名、MIME、image/\* 或不限。槽位、拒绝行与 disabled/ref 权限边界遵从现有合同。“加入 48 份便笺”先更新 48 槽位，再通过公开 ref 加入本地生成文本；queue 的虚拟滚动窗口由库拥有。主桶新增的仅是已经存在于内部 barrel 的 `FileUploadVariant` type 导出。

预览独立于上传队列，不把待上传文件算作已成功。SVG 原样复制自 design-system public 样张；PNG/JPEG 为本票自制图形，生成脚本、SHA 见[证据](evidence/t06-f01/README.md)。本地图片选择器只创建 host Blob URL；更换先卸载旧 keyed preview，再 revoke；离页回收。库缩略图由库创建、卸载/移除时回收。`openSource` 仅记录请求，宿主另一个明确按钮才打开当前受控本地 src；预览 GET 不属于上传写动作。

宿主 Vite 使用已锁定的 WASM plugin 编译 FilePreview lazy graph，不新增/升级依赖。PDFium 2.14.4 与本地 OOXML 0.72.2 保持不变。本票只验图片/状态和顺序注入传输：#73 取消晚回与 attempt、#74 native HTTP/tus、#75 PDF、#76 Office、父 #7 组合、CI、完整 docs #10、packed #11、设备 #41、旧消费者与旧库退出均不由本票声称完成。

## F02：可控等待与取消晚回

“等待创建会话”“等待完成回执”默认关闭；开启后用“释放创建/回执”或对应失败按钮结束等待。“模拟传输忽略取消”保留已取消传输，继续“推进传输”会产生旧进度与晚成功，用于核对当前有效 attempt 的隔离。操作记录包含 attempt、abort 和 receipt，等待闸门列出阶段及编号。取消已经发出的 complete 只隔离本地结果，不回滚远端完成请求。

本机 fixture 的 `window.__nervUploadFixture` 提供 `readback()`（计数、signal/attempt、闸门、操作记录和成功快照）以及 `release(stage, fail?, id?) / advance() / fail()`。诊断句柄保留到下一次文件页挂载或页面关闭，便于离页后释放已发出的 promise 并读回后台行为；不包含 File 内容，也不发送网络请求。它属于 playground 验收夹具，不是组件库公共 API。完整行为证据见 [F02](evidence/t06-f02/README.md)；#74–#76 及父组合仍单独验收。

API 合同继续以对应[上传页](../frontend/apps/design-system/docs/components/desktop/file-upload.md)与[预览页](../frontend/apps/design-system/docs/components/desktop/file-preview.md)为准。早期研究“docx + image 可能 image”的描述与当前实现不符；公开回归确认当前为 office-docx，F01 只修正文档，不改变 MIME 策略。原库来源与第三方声明不变，回传旧库由后续消费者接入票决定。

## F04：本地 PDF 阅读

同一个预览选择器增加原样单页、三页阅读旅程、嵌入中文字体、坏 PDF 和无效地址。本地图片输入也接受 PDF，保持既有可访问标签和原文件操作。PDF 的分页、缩放、适应宽度与滚动由现有三件内部 SFC 负责；宿主只供应来源和读回事件。

固定 PDFium 2.14.4 使用 direct engine，在主线程运行，无 Worker。WASM 原样随库本地资源打包，Vite 根据 base 生成 URL；fontFallback:null 禁止远程补字体，只承诺嵌入字体样张的已知 glyph。失败可换来源或切换 loading 重试；ready 为文档 loaded，真实画面另按解码位图检查。资源 SHA、来源/notice、真实浏览器与 RED/GREEN 身份见 [F04 证据](evidence/t06-f04/README.md)，接口见[预览页](../frontend/apps/design-system/docs/components/desktop/file-preview.md#pdf-本地资源与生命周期t06f04)。原迁移素材不变，本轮修复是否回传原仓由 #12–#15 消费者接入决定。

## 本地 Office 预览（T06/F05）

在同一 `/#files` 选择器中打开工作指引 DOCX、三页阅读旅程 DOCX、检查记录 XLSX 或预览回顾 PPTX；三种格式均使用固定 `@silurus/ooxml@0.72.2`，没有在线预览服务。DOCX/PPTX 可翻页、下拉跳转和按容器宽度的 50%–200% 重绘缩放；resize 保留页码。XLSX 可在 Inspection/Trend/Summary 间切换，不提供包装层缩放工具。

三个 WASM 和上游许可随库本地供应，解析 Worker 来自包内 Blob，绘制在主线程；Google Fonts 可选路径显式关闭。字体按文档嵌入与本机可用字体回退，不能据本地样张推断所有文档字体完整。坏字节和 404 进入 error，切换正常样张恢复。来源 GET/响应体、旧 viewer 回调及 render surface 按代次隔离；离页清理 viewer、observer、timer/RAF 和宿主 Blob URL。

本地文件选择支持图片、PDF、DOCX、XLSX、PPTX，不触发上传；上传排列、内存和原生 HTTP 演示仍由原区域提供。完整验证与未运行边界见 [F05 证据](evidence/t06-f05/README.md)，父 #7 仍需最终组合验收。
