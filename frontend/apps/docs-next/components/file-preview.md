---
title: NvFilePreview 文件预览
---

<script setup>
import { NvFilePreview } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const sampleSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300"><rect width="480" height="300" fill="#e2e8f0"/><rect x="40" y="40" width="400" height="220" fill="#cbd5e1" stroke="#94a3b8"/><text x="240" y="160" font-family="sans-serif" font-size="22" text-anchor="middle" fill="#334155">工单图纸 NX-220</text></svg>',
)}`
</script>

# NvFilePreview 文件预览

按内容类型渲染预览：图片内联显示、PDF 用浏览器阅读器、其它类型给出占位说明。

## 示例

<Demo block>
  <NvFilePreview
    :src="sampleSvg"
    file-name="工单图纸-NX-220.svg"
    content-type="image/svg+xml"
    :height="260"
  />
</Demo>

<Demo block>
  <NvFilePreview file-name="检验报告.pdf" content-type="application/pdf" :height="200" />
</Demo>

<Demo block>
  <NvFilePreview file-name="工单明细.xlsx" content-type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
</Demo>

<Demo block>
  <NvFilePreview file-name="现场照片.jpg" :height="160" />
</Demo>

## API

### NvFilePreview 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `src` | 文件地址，可用 blob / object URL；图片与 PDF 会内联渲染 | `string` | — |
| `fileName` | 显示名称；缺少 `contentType` 时也用于推断类型 | `string` | — |
| `contentType` | MIME 类型，如 `image/png`、`application/pdf` | `string` | — |
| `height` | 预览区高度（px），最小 120 | `number` | `360` |

### NvFilePreview 插槽

无插槽；预览内容与占位说明由组件内置。

### 类型推断

- `contentType` 以 `image/` 开头视为图片；`application/pdf` 或 `.pdf` 视为 PDF。
- 没有 `contentType` 时按扩展名推断图片。
- 其余情况显示占位卡片，有 `src` 时提供"打开文件"链接。
