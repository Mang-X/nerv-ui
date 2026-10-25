# PDFium 2.14.4 本地资源

本目录仅原样保存固定已安装 `@embedpdf/pdfium@2.14.4` 的 `dist/pdfium.wasm`、`LICENSE`、`LICENSE.pdfium`。WASM 为 4,633,788 bytes，SHA256 `c0af5a6aca30d7e54a149c3a68e317116ca906d6edc28fd3318b12c7d9478ac8`；来源为锁定 pnpm 包，不从 CDN 获取。声明不代表新的仓库发行许可。

PdfPreview 的 `?url` 导入由 Vite 生成含 base 的资源 URL。EmbedPDF direct engine 使用同版本 PDFium，在主线程运行；此路径没有 Worker、独立 worker response 或远程字体回退。安装包资源/声明逐文件审计及 HTTP body/dist 字节核对见仓库 `docs/evidence/t06-f04/README.md`。

来源修复在新库实施，冻结 migration 材料不改；是否回传旧库由后续消费者接入票决定。
