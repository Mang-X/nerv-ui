# FilePreview 文件预览

纯前端文件预览容器。组件只接收 `src / fileName / contentType / sizeBytes`，不绑定 FileStorage、API Client 或业务附件模型。上层负责把任意文件系统、对象存储或业务接口转换成可访问的 `src`。

PDF、Word、PowerPoint 和 Excel 预览都在统一工具栏内提供快速定位下拉：PDF / Word 可选择页码，PowerPoint 可选择幻灯片，Excel 可选择工作表。

<script setup>
import { FilePreview } from '@nerv-iip/ui/file-preview'

const samples = {
  image: '/file-preview/quality-evidence.svg',
  pdf: '/file-preview/quality-evidence-report.pdf',
  docx: '/file-preview/quality-work-instruction.docx',
  xlsx: '/file-preview/inspection-metrics.xlsx',
  pptx: '/file-preview/preview-review-deck.pptx',
}
</script>

所有预览工具栏以中文说明翻页、缩放、旋转与打开源文件操作；文件名保留原名供用户识别。

## 示例

### 图片预览

<Demo title="图片预览" block>
  <FilePreview
    :src="samples.image"
    file-name="quality-evidence.svg"
    content-type="image/svg+xml"
    :size-bytes="734003"
    :height="430"
  />
</Demo>

示例图片是文档用样张，不作为色板或业务图形规范。真实业务侧只需要传入浏览器可访问的 `src`。

```vue
<script setup lang="ts">
import { FilePreview } from '@nerv-iip/ui/file-preview'
</script>

<template>
  <FilePreview
    src="/file-preview/quality-evidence.svg"
    file-name="quality-evidence.svg"
    content-type="image/svg+xml"
    :size-bytes="734003"
    :height="430"
  />
</template>
```

### PDF 预览

<Demo title="PDF 预览" block>
  <FilePreview
    :src="samples.pdf"
    file-name="quality-evidence-report.pdf"
    content-type="application/pdf"
    :size-bytes="1129"
    :height="430"
  />
</Demo>

```vue
<script setup lang="ts">
import { FilePreview } from '@nerv-iip/ui/file-preview'
</script>

<template>
  <FilePreview
    src="/file-preview/quality-evidence-report.pdf"
    file-name="quality-evidence-report.pdf"
    content-type="application/pdf"
    :size-bytes="1129"
    :height="430"
  />
</template>
```

### Word / DOCX 预览

<Demo title="Word / DOCX 预览" block>
  <FilePreview
    :src="samples.docx"
    file-name="quality-work-instruction.docx"
    content-type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    :size-bytes="3062"
    :height="430"
  />
</Demo>

```vue
<script setup lang="ts">
import { FilePreview } from '@nerv-iip/ui/file-preview'
</script>

<template>
  <FilePreview
    src="/file-preview/quality-work-instruction.docx"
    file-name="quality-work-instruction.docx"
    content-type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    :size-bytes="3062"
    :height="430"
  />
</template>
```

### Excel / XLSX 预览

Excel 示例使用一个包含 `Inspection / Trend / Summary` 3 个工作表的工作簿，用于验证表格预览的工作表切换体验。

<Demo title="Excel / XLSX 预览" block>
  <FilePreview
    :src="samples.xlsx"
    file-name="inspection-metrics.xlsx"
    content-type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    :size-bytes="6424"
    :height="430"
  />
</Demo>

```vue
<script setup lang="ts">
import { FilePreview } from '@nerv-iip/ui/file-preview'
</script>

<template>
  <FilePreview
    src="/file-preview/inspection-metrics.xlsx"
    file-name="inspection-metrics.xlsx"
    content-type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    :size-bytes="6424"
    :height="430"
  />
</template>
```

### PowerPoint / PPTX 预览

<Demo title="PowerPoint / PPTX 预览" block>
  <FilePreview
    :src="samples.pptx"
    file-name="preview-review-deck.pptx"
    content-type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    :size-bytes="4353"
    :height="430"
  />
</Demo>

```vue
<script setup lang="ts">
import { FilePreview } from '@nerv-iip/ui/file-preview'
</script>

<template>
  <FilePreview
    src="/file-preview/preview-review-deck.pptx"
    file-name="preview-review-deck.pptx"
    content-type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    :size-bytes="4353"
    :height="430"
  />
</template>
```

### 状态示例

<Demo title="状态示例" block>
  <div class="grid gap-4 lg:grid-cols-3">
    <FilePreview
      file-name="待上传预览源.pdf"
      content-type="application/pdf"
      :height="260"
      :show-header="false"
    />
    <FilePreview
      :src="samples.image"
      file-name="图片加载失败.png"
      content-type="image/png"
      error="图片加载失败，请检查文件地址或访问权限。"
      :height="260"
      :show-header="false"
    />
    <FilePreview
      :src="samples.pdf"
      file-name="不支持的图纸格式.dwg"
      content-type="application/acad"
      :height="260"
      :show-header="false"
    />
  </div>
</Demo>

```vue
<script setup lang="ts">
import { FilePreview } from '@nerv-iip/ui/file-preview'
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-3">
    <FilePreview
      file-name="待上传预览源.pdf"
      content-type="application/pdf"
      :height="260"
      :show-header="false"
    />
    <FilePreview
      src="/file-preview/quality-evidence.svg"
      file-name="图片加载失败.png"
      content-type="image/png"
      error="图片加载失败，请检查文件地址或访问权限。"
      :height="260"
      :show-header="false"
    />
    <FilePreview
      src="/file-preview/quality-evidence-report.pdf"
      file-name="不支持的图纸格式.dwg"
      content-type="application/acad"
      :height="260"
      :show-header="false"
    />
  </div>
</template>
```

## 支持格式

| 类型                                      | 渲染器                                             |
| ----------------------------------------- | -------------------------------------------------- |
| PDF                                       | `@embedpdf/core` headless 插件组合，自研统一工具栏 |
| DOCX / XLSX / PPTX                        | `@silurus/ooxml`                                   |
| PNG / JPG / WEBP / SVG / GIF / AVIF / BMP | 自研图片预览                                       |

## 接口边界

| 属性 / 事件       | 说明                                                   |
| ----------------- | ------------------------------------------------------ |
| `src`             | 浏览器可访问的文件地址或 data URL                      |
| `fileName`        | 用于类型推断、标题和可访问标签                         |
| `contentType`     | 参与 family 与扩展名推断，详见下方冲突顺序             |
| `sizeBytes`       | 展示紧凑文件大小                                       |
| `height`          | 预览容器高度，默认 `520`                               |
| `loading / error` | 由上层控制的异步状态                                   |
| `ready(kind)`     | 当前预览器可用时触发                                   |
| `error(message)`  | 子预览器渲染失败时触发                                 |
| `openSource(src)` | 用户点击打开源文件时触发；组件不直接调用下载或业务接口 |

`src` 为空时组件显示独立空状态，不把缺少来源误判为不支持格式。图片预览会在原生 `load` 后触发 `ready`，在原生 `error` 后进入统一错误状态；PDF 预览使用 EmbedPDF 的 document / viewport / scroll / render / zoom 插件，文档加载完成后触发 `ready`，加载失败后进入统一错误状态；Office 预览在对应 OOXML viewer 完成 `load` 后触发 `ready`。

PDF 预览依赖 `@embedpdf/engines` 的 wasm 资源。消费 `FilePreview` PDF 路径的 Vite 应用需要启用 `vite-plugin-wasm`；design-system 文档和 `@nerv-iip/ui` 测试配置已经包含该插件。普通 UI primitives 导入不会主动加载 PDF / OOXML 渲染器，`FilePreview` 通过稳定子入口 `@nerv-iip/ui/file-preview` 暴露。

## 动效

本组件首次接入 `motion-v`。`filePreviewMotion` 采用 Windows Animation Values：功能切换使用 Fast Invoke，图片进入与预览体切换保持直接、短促；透明度使用 83ms linear。组件外层使用 `MotionConfig reduced-motion="user"`，遵从系统减少动态效果设置。

```ts
import { filePreviewMotion } from '@nerv-iip/ui'

filePreviewMotion.fastInvoke
filePreviewMotion.fade
```

## 类型推断与独立图片宿主（T06/F01）

从 `@nerv-iip/ui/file-preview` 导入 `FilePreview`，根入口只提供 helper/type。推断先调用共享 family：Word → spreadsheet → presentation → PDF → image → audio/video/archive；随后预览按 family PDF、family image、DOCX/XLSX/PPTX 扩展名或 OOXML MIME 选择 renderer。MIME 会去参数、trim、转小写，扩展名大小写不敏感，没有内容嗅探。`report.pdf + image/png` 为 PDF；`note.docx + image/png` 当前为 DOCX（Word family 更早匹配）；无扩展名且 `IMAGE/PNG; charset=utf-8` 为 image。不要概括成 MIME 总优先或 PDF 总压过 Office family。

旧 `.doc/.xls/.ppt`、文本、CSV、JSON、音视频与压缩包显示 unsupported；上传接受这些类型不等于能内嵌预览。空源提示没有可用来源，不触发 ready；图片通过真实浏览器 load/error 触发事件。

`/#files` 提供独立供应的本地 SVG/PNG/JPEG、损坏图片、empty/loading/error/unsupported。图片缩放范围 20%–300%，旋转每次 ±90°。`openSource` 仅发事件；宿主记录请求后，需要再点明确按钮才打开受控本地来源。预览读取 src 的 GET 是读动作，与上传写动作分开。宿主 Blob URL 更换后先卸载旧预览再 revoke，清空与离页也回收；库缩略图 URL 由库负责。

playground 为 FilePreview 的 lazy 构建图启用已经锁定的 `vite-plugin-wasm@3.6.0`；没有新增版本。F01 的构建包含既有 PDFium/Office 异步 chunk，不代表真实 renderer 已验收：PDF #75、三种 Office #76 单独验证，完整文档站 #10、packed host #11 另列。
