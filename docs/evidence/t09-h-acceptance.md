# T09 H 集成验收 · docs 站独立运行

日期：2026-11-17 ｜ 执行人：Claude（核对席位）
范围：`frontend/apps/design-system` docs 站四形态覆盖、导航、资源、构建、独立浏览器（HTTP/预渲染 HTML）证据。
约束：只读 + 本文件；不写实现代码。验收口径随 PR301 收窄为 **desktop / screen / touch(pad) / mobile** 四形态；scheduling-* 与 app-shell 已撤出。

## 1. 全页面存活

逐文件扫描 `docs/components/{desktop,screen,touch,mobile}/*.md`，核对行数、代码围栏数与 live 示例标记（`<Demo>` / `<ScreenDemo>` / `<MobileDoc>` / 直接内联渲染真实组件）。**无 0 行文件，无空壳页。**

| 形态 | 页数 | 含 live 组件渲染标记 | 纯代码块/概览页 | 缺口 |
| --- | --- | --- | --- | --- |
| desktop | 62 | 58 | `index.md`(概览)、`gallery.md`(嵌入 DesktopShowcase 全宽 live)、`neutral-shells.md`(嵌入 NeutralShellDemo live)、`group-panel.md`(内联 `<NvGroupPanel>` live + 代码块) | 0 |
| screen | 47 | 45 | `index.md`(概览)、`gallery.md`(嵌入 ScreenGallery live) | `screen-scaler.md` 仅代码块无 live（组件文档页，内容有效） |
| touch | 6 | 5 | `index.md`(概览，链接各件) | 0 |
| mobile | 49 | 47 | `index.md`(概览)、`gallery.md`(嵌入 MobileShowcase live) | 0 |

说明：`index.md`/`gallery.md` 是概览/全宽示例页，不属"缺示例"。live 判定含直接渲染真实组件（`<NvGroupPanel>`、`<ClientOnly><XxxShowcase/>`、`<ScreenDemo>`）。

## 2. 导航完整

- 侧栏/顶栏 link 共 **171 条**（含 1 条外链 github）。全部解析到存在的 `.md`：**死链 0**。
- 四形态首页/概览 `/components/{desktop,screen,touch,mobile}/` 均存在 `index.md` 且可达。
- **孤立页 3 个**（有内容、有正文入链、但无侧栏项，非死链）：
  - `components/screen/decorative-backgrounds.md`（screen/index.md 正文 `[流线与等距块体装饰背景]` 链入）
  - `components/screen/screen-freshness.md`（use-screen-data.md 正文 `[NvScreenFreshness]` 链入）
  - `components/screen/gallery.md`（components/overview.md 正文 `[大屏]` 链入）

## 3. 排程残留

| 检查面 | 结果 |
| --- | --- |
| `docs/components/**/scheduling-*` 源文件 | 0（已删） |
| `.vitepress/config.mts` 内 `schedul` | 0 |
| 构建产物 `.vitepress/dist/**schedul*/**gantt*` | 0 |
| `frontend/packages/scheduling` | 目录已删除 |

**正文内链残留 2 处**（demo 内 `<a href>` / `<XxxLink href>` 指向已删页，点击后 404）：
- `components/desktop/breadcrumb.md:55` → `href="/components/desktop/resource-scheduler"`
- `components/desktop/navigation-menu.md:52` → `href="/components/desktop/gantt-chart"`

**组件名残留 1 处**：
- `components/screen/index.md:47` 概览表列 `NvTaktGantt`，但 `@nerv-iip/ui` 源码无任何 TaktGantt 导出（grep 0 命中）。属"列出不存在组件"的描述性残留。

## 4. 资源

- `docs/public/`：7 个静态文件（file-preview 6 件 + media/portrait.svg 1 件），构建后全部复制到 dist 并可 HTTP 200 访问。
- file-preview.md 引用的 5 个样本（svg/pdf/docx/xlsx/pptx）均存在于 `public/file-preview/`。
- 无引用已删 scheduling 的 404（除 §3 正文两处 href）。

## 5. 构建 / 类型检查

在 `frontend/` 先 `pnpm install` + `pnpm --filter @nerv-iip/ui --filter @nerv-iip/ui-mobile build`（产物化 dist 前置）后：

| 命令 | exit | 备注 |
| --- | --- | --- |
| `pnpm --filter @nerv-iip/ui --filter @nerv-iip/ui-mobile build` | 0 | ui dist 含 `.`/`desktop`/`screen`/`pad`/`file-preview`/`test-support` 子路径导出 |
| `pnpm --filter @nerv-iip/design-system typecheck` | 0 | `vue-tsc --noEmit`，无输出 |
| `pnpm --filter @nerv-iip/design-system build` | 0 | vitepress build，173 个 md 处理、175 个 html 产出、26.45s |
| `pnpm --filter @nerv-iip/design-system dev` | 起服务 OK | `vitepress dev`，127.0.0.1:5180 |

注：dev 模式下所有路由返回同一 SPA shell（675B 含 `/@vite/client`），不在 HTML 内联正文——故内容断言改用 `vitepress preview`（serve dist）。

## 6. 独立宿主 / 浏览器证据（HTTP + 预渲染 HTML）

`vitepress preview` serve 构建产物（端口 5199），curl 实测：

| 路径 | HTTP | 字节 | 关键标记命中 |
| --- | --- | --- | --- |
| `/` | 200 | 43220 | `设计系统`x6 `Nerv`x7 `组件`x9 |
| `/components/desktop/` | 200 | 61470 | `桌面` `组件` |
| `/components/desktop/button` | 200 | 65097 | `NvButton`x10 `按钮`x12 `vp-doc` |
| `/components/desktop/file-preview` | 200 | 151665 | 文件预览页（最大） |
| `/components/screen/` | 200 | 57559 | `大屏`x18 `控制室`x9 |
| `/components/screen/oee-hero` | 200 | 59918 | `OEE`x16 `hero`x20 |
| `/components/touch/` | 200 | 41825 | 触控概览 |
| `/components/touch/touch-button` | 200 | 48077 | `TouchButton`x12 `触控`x12 |
| `/components/board` | 200 | 38060 | `工位`x10 `看板`x5 `Board`x18 |
| `/components/mobile/` | 200 | 56583 | `移动`x9 `PDA`x12 |
| `/components/mobile/button` | 200 | 61393 | `MobileButton`x13 `按钮`x15 |
| `/guide/introduction` | 200 | 40255 | 指南页 |
| `/foundations/tokens` | 200 | 61344 | 令牌页 |
| `/file-preview/quality-evidence.svg` | 200 | 1079 | SVG 二进制 |
| `/file-preview/quality-evidence-report.pdf` | 200 | 1129 | `%PDF-1.4` 头正确 |

**未做（UNRUN）**：未使用 Playwright/真实浏览器渲染截图、未做 JS 运行时交互验证、未做亮暗切换/宽窄屏实机走查。本票最低线为「HTTP 200 + 内容断言 + build 绿」，已达到；组件是否在浏览器里真实可交互未验。

## 7. Nerv-IIP 依赖

- `design-system` deps 仅 `@nerv-iip/ui` + `@nerv-iip/ui-mobile`（workspace:*）+ vue + lucide。
- docs 源树 `grep @nerv-iip/{scheduling,mes,erp,quality,inventory}` → 0（除 `frontend/DESIGN/component-coverage.md` 历史记录注明 scheduling 已撤出，非依赖）。
- 无 `import from ...Nerv-IIP` 业务包路径。

## 结论

**H 达成（有保留）。** 四形态 164 个组件页全部存活且含有效示例、导航 171 链零死链、build/typecheck/dev 三绿、preview HTTP 200 + 预渲染组件标记断言通过、无业务包残留。

保留项（非阻断，如实记录）：
1. 2 处 demo 内正文 href 指向已删排程页（breadcrumb `resource-scheduler`、navigation-menu `gantt-chart`）——点击后 404。
2. `screen/index.md` 概览表列出不存在的 `NvTaktGantt`。
3. 3 个 screen 页无侧栏入口（但正文可达、内容有效）。
4. 浏览器真实渲染/交互未验（仅构建产物 HTML 断言）。

## 附：运行副产物

本次跑命令在 `frontend/apps/design-system/` 生成未跟踪产物 `.vitepress/`、`typed-router.d.ts`（dev/build 副产物），非本票交付物，未纳入报告。
