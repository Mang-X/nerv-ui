---
title: NvFilePreview 文件预览
---

<script setup>
import { NvFilePreview } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const sampleSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300"><rect width="480" height="300" fill="#e2e8f0"/><rect x="40" y="40" width="400" height="220" fill="#cbd5e1" stroke="#94a3b8"/><text x="240" y="160" font-family="sans-serif" font-size="22" text-anchor="middle" fill="#334155">记录图纸 NX-220</text></svg>',
)}`
</script>

# NvFilePreview 文件预览

按内容类型选择渲染引擎：图片内联显示，PDF 走 pdfium（embedpdf），
docx / xlsx / pptx 走 `@silurus/ooxml` 的 wasm 解析器；引擎按需异步加载。

## 示例

<Demo block>
  <NvFilePreview
    :src="sampleSvg"
    file-name="记录图纸-NX-220.svg"
    content-type="image/svg+xml"
    :height="260"
  />
</Demo>

<Demo block>
  <NvFilePreview
    src="/sample-report.pdf"
    file-name="检验报告.pdf"
    content-type="application/pdf"
    :size-bytes="482000"
    show-thumbnails
    :height="480"
  />
</Demo>

<Demo block>
  <NvFilePreview
    src="/work-instruction.docx"
    file-name="作业指导书.docx"
    content-type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    :height="420"
  />
</Demo>

<Demo block>
  <NvFilePreview
    src="/output-report.xlsx"
    file-name="产量统计.xlsx"
    content-type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    :height="360"
  />
</Demo>

<Demo block>
  <NvFilePreview
    :src="sampleSvg"
    file-name="现场照片.jpg"
    :show-header="false"
    :height="260"
  />
</Demo>

<Demo block>
  <NvFilePreview file-name="现场照片.jpg" :height="160" />
</Demo>

## API

### NvFilePreview 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `src` | 文件地址，可用 blob / object URL；图片、PDF 与 OOXML 文档会内联渲染 | `string` | — |
| `fileName` | 显示名称；缺少 `contentType` 时也用于推断类型 | `string` | — |
| `contentType` | MIME 类型，如 `image/png`、`application/pdf` | `string` | — |
| `height` | 预览区高度（px），最小 120 | `number` | `420` |
| `sizeBytes` | 文件大小（字节），头部显示为 `类型 · 大小` | `number` | — |
| `showHeader` | 显示头部（文件名、类型/大小、新窗口打开） | `boolean` | `true` |
| `showToolbar` | 显示引擎工具条（页码、缩放、旋转、下载） | `boolean` | `true` |
| `showThumbnails` | 显示 PDF 缩略图栏 | `boolean` | `false` |
| `loading` | 用加载态替代预览体 | `boolean` | `false` |
| `error` | 用错误态替代预览体 | `string \| null` | `null` |

### NvFilePreview 事件

| 事件 | 说明 |
| --- | --- |
| `ready` | 引擎渲染就绪，参数为识别出的文件种类 |
| `error` | 引擎加载或解析失败，参数为错误信息 |
| `openSource` | 请求在新窗口打开源文件，参数为 `src` |

### NvFilePreview 插槽

无插槽；预览内容与占位说明由组件内置。

### 类型推断

- `contentType` 以 `image/` 开头视为图片；`application/pdf` 或 `.pdf` 视为 PDF。
- OOXML 三个子类型按 MIME 或扩展名识别：`docx` / `xlsx` / `pptx`。
- 没有 `contentType` 时按扩展名推断图片。
- 其余情况（含旧版 `doc` / `xls` / `ppt` 二进制格式）显示占位卡片，
  有 `src` 时提供「打开文件」链接。
