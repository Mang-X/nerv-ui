# FilePreview 文件预览

纯前端文件预览容器。组件只接收 `src / fileName / contentType / sizeBytes`，不绑定 FileStorage、API Client 或业务附件模型。上层负责把任意文件系统、对象存储或业务接口转换成可访问的 `src`。

PDF、Word、PowerPoint 和 Excel 预览都在统一工具栏内提供快速定位下拉：PDF / Word 可选择页码，PowerPoint 可选择幻灯片，Excel 可选择工作表。

<script setup>
import { FilePreview } from '@nerv-iip/ui/file-preview'
import { ref } from 'vue'
import PdfPagesExample from '../../.vitepress/examples/PdfPagesExample.vue'

const openedSource = ref('')
function onOpenSource(src) {
  openedSource.value = src
}

const samples = {
  image: '/file-preview/quality-evidence.svg',
  pdf: '/file-preview/quality-evidence-report.pdf',
  docx: '/file-preview/quality-work-instruction.docx',
  xlsx: '/file-preview/inspection-metrics.xlsx',
  pptx: '/file-preview/preview-review-deck.pptx',
}
</script>

所有预览工具栏以中文说明翻页、缩放、旋转与打开源文件操作；文件名保留原名供用户识别。

点击“打开”后，示例下方显示当前源文件链接；点击链接可在新标签页打开文档站提供的文件。此处不调用业务下载接口。

## 示例

### 图片预览

<Demo title="图片预览" block>
  <FilePreview
    @open-source="onOpenSource"
    :src="samples.image"
    file-name="quality-evidence.svg"
    content-type="image/svg+xml"
    :size-bytes="734003"
    :height="430"
  />
  <p v-if="openedSource" role="status">
    已选择源文件：<a :href="openedSource" target="_blank" rel="noopener noreferrer">{{ openedSource.split('/').pop() }}</a>
  </p>
</Demo>

示例图片是文档用样张，不作为色板或业务图形规范。真实业务侧只需要传入浏览器可访问的 `src`。

```vue
<script setup lang="ts">
import { FilePreview } from '@nerv-iip/ui/file-preview'
import { ref } from 'vue'

const openedSource = ref('')
function onOpenSource(src: string) {
  openedSource.value = src
}
</script>

<template>
  <FilePreview
    @open-source="onOpenSource"
    src="/file-preview/quality-evidence.svg"
    file-name="quality-evidence.svg"
    content-type="image/svg+xml"
    :size-bytes="734003"
    :height="430"
  />
  <p v-if="openedSource" role="status">
    已选择源文件：<a :href="openedSource" target="_blank" rel="noopener noreferrer">{{
      openedSource.split('/').pop()
    }}</a>
  </p>
</template>
```

### PDF 预览

<Demo title="PDF 预览" block>
  <FilePreview
    @open-source="onOpenSource"
    :src="samples.pdf"
    file-name="quality-evidence-report.pdf"
    content-type="application/pdf"
    :size-bytes="1129"
    :height="430"
  />
  <p v-if="openedSource" role="status">
    已选择源文件：<a :href="openedSource" target="_blank" rel="noopener noreferrer">{{ openedSource.split('/').pop() }}</a>
  </p>
</Demo>

```vue
<script setup lang="ts">
import { FilePreview } from '@nerv-iip/ui/file-preview'
import { ref } from 'vue'

const openedSource = ref('')
function onOpenSource(src: string) {
  openedSource.value = src
}
</script>

<template>
  <FilePreview
    @open-source="onOpenSource"
    src="/file-preview/quality-evidence-report.pdf"
    file-name="quality-evidence-report.pdf"
    content-type="application/pdf"
    :size-bytes="1129"
    :height="430"
  />
  <p v-if="openedSource" role="status">
    已选择源文件：<a :href="openedSource" target="_blank" rel="noopener noreferrer">{{
      openedSource.split('/').pop()
    }}</a>
  </p>
</template>
```

### 多页 PDF 导航

以下样本包含三个内容不同的页面，可使用上一页、下一页和页码下拉切换。
样本原样复用本仓库 playground 的本地合成资料；原单页 PDF 示例保持不变。
窄屏在预览区域内横向滚动，站点正文不随工具栏撑宽。

<Demo title="多页 PDF 导航" block>
  <PdfPagesExample />
</Demo>

<<< @/.vitepress/examples/PdfPagesExample.vue

### Word / DOCX 预览

<Demo title="Word / DOCX 预览" block>
  <FilePreview
    @open-source="onOpenSource"
    :src="samples.docx"
    file-name="quality-work-instruction.docx"
    content-type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    :size-bytes="3062"
    :height="430"
  />
  <p v-if="openedSource" role="status">
    已选择源文件：<a :href="openedSource" target="_blank" rel="noopener noreferrer">{{ openedSource.split('/').pop() }}</a>
  </p>
</Demo>

```vue
<script setup lang="ts">
import { FilePreview } from '@nerv-iip/ui/file-preview'
import { ref } from 'vue'

const openedSource = ref('')
function onOpenSource(src: string) {
  openedSource.value = src
}
</script>

<template>
  <FilePreview
    @open-source="onOpenSource"
    src="/file-preview/quality-work-instruction.docx"
    file-name="quality-work-instruction.docx"
    content-type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    :size-bytes="3062"
    :height="430"
  />
  <p v-if="openedSource" role="status">
    已选择源文件：<a :href="openedSource" target="_blank" rel="noopener noreferrer">{{
      openedSource.split('/').pop()
    }}</a>
  </p>
</template>
```

### Excel / XLSX 预览

Excel 示例使用一个包含 `Inspection / Trend / Summary` 3 个工作表的工作簿，用于验证表格预览的工作表切换体验。

<Demo title="Excel / XLSX 预览" block>
  <FilePreview
    @open-source="onOpenSource"
    :src="samples.xlsx"
    file-name="inspection-metrics.xlsx"
    content-type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    :size-bytes="6424"
    :height="430"
  />
  <p v-if="openedSource" role="status">
    已选择源文件：<a :href="openedSource" target="_blank" rel="noopener noreferrer">{{ openedSource.split('/').pop() }}</a>
  </p>
</Demo>

```vue
<script setup lang="ts">
import { FilePreview } from '@nerv-iip/ui/file-preview'
import { ref } from 'vue'

const openedSource = ref('')
function onOpenSource(src: string) {
  openedSource.value = src
}
</script>

<template>
  <FilePreview
    @open-source="onOpenSource"
    src="/file-preview/inspection-metrics.xlsx"
    file-name="inspection-metrics.xlsx"
    content-type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    :size-bytes="6424"
    :height="430"
  />
  <p v-if="openedSource" role="status">
    已选择源文件：<a :href="openedSource" target="_blank" rel="noopener noreferrer">{{
      openedSource.split('/').pop()
    }}</a>
  </p>
</template>
```

### PowerPoint / PPTX 预览

<Demo title="PowerPoint / PPTX 预览" block>
  <FilePreview
    @open-source="onOpenSource"
    :src="samples.pptx"
    file-name="preview-review-deck.pptx"
    content-type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    :size-bytes="4353"
    :height="430"
  />
  <p v-if="openedSource" role="status">
    已选择源文件：<a :href="openedSource" target="_blank" rel="noopener noreferrer">{{ openedSource.split('/').pop() }}</a>
  </p>
</Demo>

```vue
<script setup lang="ts">
import { FilePreview } from '@nerv-iip/ui/file-preview'
import { ref } from 'vue'

const openedSource = ref('')
function onOpenSource(src: string) {
  openedSource.value = src
}
</script>

<template>
  <FilePreview
    @open-source="onOpenSource"
    src="/file-preview/preview-review-deck.pptx"
    file-name="preview-review-deck.pptx"
    content-type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    :size-bytes="4353"
    :height="430"
  />
  <p v-if="openedSource" role="status">
    已选择源文件：<a :href="openedSource" target="_blank" rel="noopener noreferrer">{{
      openedSource.split('/').pop()
    }}</a>
  </p>
</template>
```

### 状态示例

<Demo title="状态示例" block>
  <div class="grid gap-4 lg:grid-cols-3">
    <FilePreview
    @open-source="onOpenSource"
      file-name="待上传预览源.pdf"
      content-type="application/pdf"
      :height="260"
      :show-header="false"
    />
    <FilePreview
    @open-source="onOpenSource"
      :src="samples.image"
      file-name="图片加载失败.png"
      content-type="image/png"
      error="图片加载失败，请检查文件地址或访问权限。"
      :height="260"
      :show-header="false"
    />
    <FilePreview
    @open-source="onOpenSource"
      :src="samples.pdf"
      file-name="不支持的图纸格式.dwg"
      content-type="application/acad"
      :height="260"
      :show-header="false"
    />
  </div>
  <p v-if="openedSource" role="status">
    已选择源文件：<a :href="openedSource" target="_blank" rel="noopener noreferrer">{{ openedSource.split('/').pop() }}</a>
  </p>
</Demo>

```vue
<script setup lang="ts">
import { FilePreview } from '@nerv-iip/ui/file-preview'
import { ref } from 'vue'

const openedSource = ref('')
function onOpenSource(src: string) {
  openedSource.value = src
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-3">
    <FilePreview
      @open-source="onOpenSource"
      file-name="待上传预览源.pdf"
      content-type="application/pdf"
      :height="260"
      :show-header="false"
    />
    <FilePreview
      @open-source="onOpenSource"
      src="/file-preview/quality-evidence.svg"
      file-name="图片加载失败.png"
      content-type="image/png"
      error="图片加载失败，请检查文件地址或访问权限。"
      :height="260"
      :show-header="false"
    />
    <FilePreview
      @open-source="onOpenSource"
      src="/file-preview/quality-evidence-report.pdf"
      file-name="不支持的图纸格式.dwg"
      content-type="application/acad"
      :height="260"
      :show-header="false"
    />
  </div>
  <p v-if="openedSource" role="status">
    已选择源文件：<a :href="openedSource" target="_blank" rel="noopener noreferrer">{{
      openedSource.split('/').pop()
    }}</a>
  </p>
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

PDF 预览依赖 `@embedpdf/engines` 的 wasm 资源。在源码/workspace 形态下（仓内 playground、design-system），消费 `FilePreview` PDF 路径的 Vite 应用启用已锁定的 `vite-plugin-wasm`。普通 UI primitives 导入不会主动加载 PDF / OOXML 渲染器，`FilePreview` 通过稳定子入口 `@nerv-iip/ui/file-preview` 暴露。

### packed 产物形态（T10-4）：重依赖是可选 peer

`@nerv-iip/ui` 的 packed tgz 把 `@embedpdf/*`（×7）与 `@silurus/ooxml` 声明为 **`peerDependencies` + `peerDependenciesMeta.optional: true`**：

- **只用主桶 / 不渲 PDF·Office 的宿主**：装 `@nerv-iip/ui` 不会传递拉入 embedpdf/ooxml 及其约 150 MB 的字体包、约 9 MB 的 ooxml，也不会引入 react/svelte/preact 框架 peer——安装树里**没有**这些包。
- **要渲 PDF/Office 的宿主**：自己把下列 8 个可选 peer 加进 `dependencies`（版本须落在 peer 声明的范围内）：
  `@embedpdf/core`、`@embedpdf/engines`、`@embedpdf/plugin-document-manager`、`@embedpdf/plugin-render`、`@embedpdf/plugin-scroll`、`@embedpdf/plugin-viewport`、`@embedpdf/plugin-zoom`（均 `2.14.4`）、`@silurus/ooxml`（`0.72.2`）。
  只用图片预览的宿主可以不装它们。
- **wasm 资产**：pdfium 与三个 ooxml `*_parser_bg.wasm` 已随 tgz 以 `dist/assets/*.wasm` 分发，`?url` 经 `new URL(..., import.meta.url)` 解析——**packed 宿主无需 `vite-plugin-wasm`**（该插件只在源码形态消费时需要）。dev 下 wasm URL 相对库 chunk 解析，build 下宿主 bundler 把资产 hoist 到自身 assets 目录，两种模式均 200。

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

## PDF 本地资源与生命周期（T06/F04）

PDF 固定使用 EmbedPDF/PDFium **2.14.4 direct engine**，在主线程运行。切换来源时只接受当前来源的 ready/error；初始化失败和未激活文档的加载失败也向外触发 error。ready 表示文档加载完成，位图随后绘制，不能单凭 ready 判断某页已经可见。上/下一页、下拉选择、滚动、缩放（25%–400%）和适应宽度沿用统一工具栏。

WASM 从精确已安装包原样复制到库的 file-preview/pdfium/pdfium.wasm，随 Vite 的 ?url 导入生成本地资源 URL，并保留 LICENSE 与 LICENSE.pdfium；资源身份见[证据](../../../../../../docs/evidence/t06-f04/README.md)。宿主仍启用已锁定的 vite-plugin-wasm。此路径不创建 Worker，也没有独立 worker response；不配置 pdf.js worker、cmaps 或 standard_fonts。

fontFallback:null 关闭第三方回退字体请求。已有嵌入字体可正常显示；缺少字体的 PDF 不保证任意中文字符完整，不使用远程字体弥补。中文样张从 @embedpdf/fonts-sc@1.0.0 的 NotoSansHans-Regular.otf 提取已知 glyph 并转为嵌入 TrueType 子集；OFL notice 随样张保留，它只是确定内容的验收样张，不构成通用字体包。

`/#files` 提供原 1129 字节单页、三页独有内容、嵌入中文、坏文件和 404 来源；同一选择器保留图片和 unsupported。可选择本地图片或 PDF，仅生成宿主 Blob URL，不上传。更换来源/离页释放 URL、viewport observer、工具栏定时器和 engine；初始化晚完成的实例同样销毁。大量 PDF 在主线程的响应性与未嵌入字体覆盖不在本票承诺范围。Office #76、父组合 #7、完整文档站 #10 和 packed #11 仍由各票验收。

2.14.4 上游 Vue Viewport 的清理函数未断开 ResizeObserver；当前 Document 只接管 viewport DOM 桥接，继续使用同版本 viewport/scroll/zoom 插件能力，卸载时显式 disconnect observer、移除 scroll 监听、取消待执行 RAF 并注销 viewport。未修改已安装包或 vendor JS。

翻页期间，Document 从 scroll capability 读取目标页，并在执行滚动帧时按当前页面布局定位；自动适应宽度产生的旧位置请求不能把首次翻页拉回上一页。普通缩放仍沿用插件请求的位置。首次导航的原始失败与修复证据见 [导航记录](../../../../../../docs/evidence/t06-pdf-navigation/README.md)。

F04 的 F1/F2 生命周期修复由本地来源持有 `AbortController`：换源或卸载取消 PDF GET/响应体读取；两个 await 后再次检查来源，只把当前完整 buffer 交给 PDFium。已开始的浏览器读操作若无法立即停止，晚到字节会丢弃；已入队的 native open 若晚成功，则显式 close 后才销毁 engine，不以 GC 代替释放。位图层沿用固定插件的 render 参数，每轮独立持有 task/Blob URL；换源、缩放重绘和卸载都会清理，即使 img 尚未 load，取消后的晚 bitmap 也不再创建 URL。当前显示位图在本轮有效期间保持 URL，不在 load 前提前回收。

R1 原始有效 PDF 晚成功与未解码位图的 FAIL 保留，修复及真实 renderer 证据见 [F1/F2 回执](../../../../../../docs/evidence/t06-f04/f1-f2/README.md)。它们不被原正常矩阵的 PASS 覆盖。

## Office 本地预览（T06/F05）

Office 固定使用 `@silurus/ooxml@0.72.2`，DOCX / PPTX 在主线程绘制 canvas 与文本层，三种格式的 ZIP / WASM 解析使用包内 Blob Worker；XLSX 由同版本 viewer 绘制表格。`useGoogleFonts:false` 显式关闭可选 Google Fonts 请求；使用文档嵌入字体和本机可用字体，不保证所有字体、排版和字符覆盖。没有把文件或 src 发送到在线 Office 服务。

三个 `*_parser_bg.wasm` 从精确安装包原样供应到库内 `file-preview/ooxml/`，通过 `?url` 产生本地资源 URL；MIT LICENSE 与原始 THIRD_PARTY_NOTICES 随资源保留。后者包含 Rust/WASM、Unicode、可选 MathJax/STIX 的上游声明；本包装层没有启用可选 math 引擎。宿主继续使用已经锁定的 `vite-plugin-wasm`，不依赖 CDN。

DOCX / PPTX 提供前后页、下拉跳转、50%–200% 相对容器宽度缩放和重置。缩放及 resize 会重新绘制实际 canvas，保留当前文档和页码。0.72.2 没有公开的绝对渲染宽度 resize API，兼容点只写 DOCX `_opts.width` 或 PPTX `opts.width`，再调用对应 `_render` / `renderCurrentSlide`；公开 `setScale` 是相对自然页面尺寸的比例，语义不同。升级依赖时须重新验证这个内部兼容点。

XLSX 提供前后工作表与下拉选择；内置底栏隐藏，表格绘图区保留。`showZoomSlider:false`，不提供本包装层的 XLSX 缩放按钮。独立样张包含 `Inspection`、`Trend`、`Summary`；验证预期先从 ZIP 单元格读取，真实画面另行检查。

包装层持有来源 GET 的 `AbortController`，在响应和响应体完成后分别检查当前来源；切换 src、格式和离页后丢弃旧字节，避免再创建 viewer。动态导入与 viewer.load 完成后也检查来源，旧回调不更新当前导航或转发 ready/error。每代 render surface 独立，释放旧 viewer、observer、待执行定时器和 RAF；已开始的浏览器读取和解析不承诺可抢占。非 ZIP 字节先报错，防止上游把它们显示为一页空白；此签名检查不是完整文件安全验证，也不保证所有损坏 ZIP 都能诊断。

`/#files` 独立供应原 DOCX/XLSX/PPTX、明确分页的三页 DOCX、三种坏文件与 404 地址；本地文件选择也接受这三种 Office 扩展名，只生成宿主 Blob URL。原样本、生成方式、资源 SHA 和真实浏览器证据见 [F05 记录](../../../../../../docs/evidence/t06-f05/README.md)。父 #7 组合、完整文档站 #10、packed host #11、设备 #41 和旧消费方 #12–15 分别验收。
