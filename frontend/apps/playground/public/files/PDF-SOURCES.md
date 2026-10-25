# PDF 样张来源

仅为 Issue75 本地合成资料，无用户文件或业务数据。SHA256 按最终文件字节计算。

| 文件 | 来源 | bytes | SHA256 |
| --- | --- | --- | --- |
| quality-evidence-report.pdf | 原样复制当前 design-system/docs/public/file-preview 同名文件；固定旧源79b1578f2b75f55709765b5e7882aaf33146c603同路径 | 1129 | 09914b585f5395d52a76609dca4aa3c6771b2e03144ac43f02b503ad00a87a67 |
| reading-journey.pdf | 本票 PyMuPDF 自制3页：MEADOW圆形、RIVER折线、SUNSET三角形，各有独立页首/页尾文本 | 3782 | ef7e0c8edc0b2a984a78d60dd3f2439708f48f5b379b42633a055c571c461137 |
| reading-chinese.pdf | 本票 ReportLab 自制1页，已知文本“春日阅读／山水之间／中文字体已嵌入” | 6560 | 04bfc41b569eb5e933088c1045cf133e21dd05c28dd8b6c0580418718fa99f8f |
| broken.pdf | 本票55字节确定坏文件，不冒充有效PDF | 55 | 6aad67eb76711088ca5dc3b450f87483313c280f980c5b6ef12874239f4c9ef9 |

中文字体 producer 是已锁定 `@embedpdf/fonts-sc@1.0.0/fonts/NotoSansHans-Regular.otf`，SHA256 `7db3c634bbd0301b3082a80ffcac2f422e8ef9ce0730f8b279c3e8f756598f68`。其 LICENSE 原样保留为 `NotoSansHans-LICENSE.txt`：Copyright 2014-2021 Adobe / Google，SIL Open Font License 1.1。生成时 fontTools 仅提取上述已知 glyph、CFF 曲线转 TrueType，派生字体更名 `Nerv Fixture Hans` 后嵌入 PDF；不单独供应或运行下载字体。完整输入/转换脚本及失败的早期嵌入记录在持久实施证据中。

`fontFallback:null` 下，本样张证明的仅是这些嵌入 glyph，不能推导缺字 PDF 或任意 CJK 字体都支持。没有新增远程字体、cmaps、standard_fonts 或业务上传。
