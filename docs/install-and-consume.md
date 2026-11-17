# 安装与消费

独立宿主消费 nerv-ui 打包产物（tgz）。**不依赖 Nerv-IIP checkout、不使用源码 alias、不需要 reka-ui patch**。

## 安装

```bash
pnpm add /path/to/nerv-iip-ui-0.1.0.tgz /path/to/nerv-iip-ui-mobile-0.1.0.tgz
# 宿主须自装 peer：
pnpm add vue reka-ui
# 宿主构建期 Tailwind v4 工具链（css import 在宿主 node_modules 解析）：
pnpm add -D tailwindcss @tailwindcss/vite tw-animate-css shadcn-vue
```

`@nerv-iip/ui-mobile` 将 `@nerv-iip/ui` 列为 peerDependencies——装 ui-mobile 必须自装 ui（跨包 `cn` 等运行时依赖 + 单例）。

## 入口 css

宿主全局 css（如 `src/style.css`）：

```css
@layer theme, nv-tokens, base, components, nv-components, utilities, nv-overrides, app;
@import '@nerv-iip/ui/styles.css';
@import '@nerv-iip/ui-mobile/styles/mobile.css';
```

## vite.config

```ts
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({ plugins: [vue(), tailwindcss()] })
```

无需 `vite-plugin-wasm`、无需 alias、无需 patchedDependencies。

## JS 入口

- `@nerv-iip/ui` — 全量（desktop + screen + pad + blocks + layout + primitives + file-upload）
- `@nerv-iip/ui/desktop` · `@nerv-iip/ui/screen` · `@nerv-iip/ui/pad` — 形态子路径按需引
- `@nerv-iip/ui/file-preview` — 文件预览（PDF/Office/图片）。**选用它才需** `@embedpdf/*`×7 + `@silurus/ooxml` 可选 peer（`peerDependenciesMeta.optional`；不渲 file-preview 的宿主零负担）
- `@nerv-iip/ui/test-support`、`@nerv-iip/ui-mobile` — 测试支撑 / 移动组件
- `@nerv-iip/ui/styles.css` · `theme.css` · `overrides.css` — Tailwind v4 源文件（最终形态，宿主 bundler 编译）

## 边界

- 排程与 app-shell 不在本库（owner 裁决撤出）。
- file-preview wasm 由产物 emitted asset + `new URL` 提供，宿主 dev/build 均 200，无需 wasm plugin。
- `MobileRadioGroup` 快速 keyup 的 #51 修复在未打 reka patch 的宿主存在已知缺陷（T10-2 A 方案待立票内化）。
