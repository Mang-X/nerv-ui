# T10-3 独立宿主验收证据：`@nerv-iip/ui` 主桶产物化

实施 + 验收，2026-11-17，工作树 `/Users/mang/Project/nerv-ui-worktrees/t10-3-ui-pkg`，分支 `feat/t10-3-ui-pkg`，base `integration/nerv-ui-extraction`。本文件记录 `@nerv-iip/ui` 产物化在独立宿主（零 alias、零 patch、非 workspace）的实际执行证据。区分：未运行项会明确标注。

## 1. 选型结论

复用 T10-1 的 **tsdown 0.23.7** 骨架（rolldown 生态库打包器）：

- `tsdown.config.ts` 结构与 `ui-mobile` 同形——`unplugin-vue/rolldown` 编 SFC、`dts.tsc.vue: true` 走 vue-tsc 产声明、`@tsdown/css` 抽取 scoped `<style>`。
- `tsconfig.build.json` 与 ui-mobile 同款：去 `vitest/globals` types + 排除 `*.test.ts`/`*.contract.test.ts`，保证产物 `.d.ts` 不引用 vitest（survey §5 R10）。

本包在骨架上需要两个增量：

- **多入口 entry map**：`index`（`.` 主桶，全量）、`desktop`/`screen`/`pad`（三个形态子路径）、`file-preview`、`test-support`。`tsdown` 按 entry 名产 `dist/<name>.{js,d.ts}`。
- **`*.wasm?url` 插件**：rolldown 不实现 Vite 的 `?url` 后缀——给 `tsdown` 塞了一个 27 行 `resolveId`/`load` 插件，把 wasm 文件 `emitFile` 成 asset 并把导入替换成 `new URL(import.meta.ROLLDOWN_FILE_URL_<ref>, import.meta.url)` 模块。产物形态与 Vite lib 模式一致（相对 `import.meta.url` 的 asset URL），宿主 dev/build 两态下都可解析。

## 2. 改动面

| 文件 | 内容 |
| --- | --- |
| `packages/ui/package.json` | `build`=`tsdown`；`exports` `.`→`{types,import}` 指 `dist/index.*`；新增 `./desktop`/`./screen`/`./pad` 形态子路径；`./file-preview`/`./test-support`→`dist/*`；三个 css 入口（`styles.css`/`theme.css`/`overrides.css`）保持指 `src/styles/*`（survey §3 方案 A）；`files`=[`dist`,`src`]；`vue`/`reka-ui` 移到 `peerDependencies`（按 T10-2 裁定：patch 不影响 ui 公开行为，reka 可降 peer） |
| `packages/ui/tsdown.config.ts` | entry map + `wasmUrlPlugin` + `neverBundle` 全部运行时依赖 |
| `packages/ui/tsconfig.build.json` | extends base，去 vitest types、`types:[node, vite/client]`（`vite/client` 供 `*.wasm?url` 模块声明） |
| `packages/ui/src/components/ui/calendar/Calendar.vue` | 补 `import type { WeekDayFormat } from 'reka-ui/date'`——`withDefaults(defineProps<...>)` 的推断类型引用 reka 内部 `index2` 路径，vue-tsc 报 TS2883「not portable」；显式导入公开路径让 dts 可命名 |
| `pnpm-lock.yaml` | 新 devDeps（`tsdown`/`unplugin-vue`/`@tsdown/css`）解析 |

**未动的设计决定**：

- `.` 主入口仍是全量（pc + touch + screen + blocks + layout + ui primitives + file-upload + filePreviewKind）。`./desktop`/`./screen`/`./pad` 是**可选的按需引入口**，宿主不引则不受影响——满足任务书「不物理拆包」原则。
- `files` 同时收 `src`：它既是三个 css 入口的载体，也是 `@source '../'` 的扫描源（与 T10-1 同一妥协形态）。
- `@embedpdf/*`×7 + `@silurus/ooxml` 保留在 `dependencies`——它们只被 `./file-preview` 子路径消费，但 npm/pnpm 语义上 dependencies 是全包级；宿主装 `@nerv-iip/ui` 就背这部分传递依赖。按 survey §5-R4 留待 T10-4 裁定是否拆 `@nerv-iip/ui-file-preview`。

## 3. 构建与打包证据

```text
$ pnpm run build        # tsdown
ℹ dist/index.js         277 kB │ dist/index.d.ts        168 kB
ℹ dist/desktop.js       7.4 kB │ dist/desktop.d.ts      8.6 kB
ℹ dist/screen.js        1.0 kB │ dist/screen.d.ts       3.4 kB
ℹ dist/pad.js           136 B  │ dist/pad.d.ts          575 B
ℹ dist/file-preview.js   14 kB │ dist/file-preview.d.ts 1.2 kB
ℹ dist/test-support.js  549 kB │ dist/test-support.d.ts 3.7 kB
ℹ dist/style.css        168 kB
ℹ dist/assets/*.wasm    ×4     (pdfium + ooxml docx/pptx/xlsx, ~6.9MB)
✔ Build complete in 3990ms

$ pnpm pack --pack-destination /tmp/t10-3
→ /tmp/t10-3/nerv-iip-ui-0.1.0.tgz   (7.4 MB)
→ /tmp/t10-3/nerv-iip-ui-mobile-0.1.0.tgz (132 kB, 同机重打包)
```

产物实证：

- `grep vitest dist/test-support.d.ts` → 仅注释里出现，零 `import`/`reference`。
- `grep 'new URL.*wasm' dist/PdfPreview*.js dist/OfficePreview*.js` → 4 处 `new URL("assets/<name>-<hash>.wasm", import.meta.url).href`，4 个 wasm 文件落在 `dist/assets/`。
- `dist/index.d.ts` 里 `export interface NvLineMarker`/`LineSeries`/`NvDataTableColumn` 等命名类型导出完整（`<script setup>` 里 `export interface` 经 `tsc:{vue:true}` 正常浮现）。
- `node --input-type=module -e "import('@nerv-iip/ui/desktop')"` → 子路径在 packed 形态 SSR 可导入、组件真实渲出。

## 4. R5 验证：`@source '../'` + 形态子路径在 packed node_modules

**结论：成立。** `src/styles/standalone.css` 里 `@source '../'` 相对自身解析到包根 `node_modules/@nerv-iip/ui/`；packed 布局里 `src/` 随 `files` 分发、含全部 `.vue`/`.ts` 类名载体，宿主 Tailwind v4 扫到。

独立宿主 `dist/assets/index-*.css` 实测：

- 5 个 `@utility` 全部生成：`.pt-safe` `.pb-safe` `.px-safe` `.min-h-touch{min-height:48px}` `.min-h-row`。
- 组件 scoped 样式经 `dist/style.css` 抽取进入宿主 bundle（`nv-tbtn`、`nv-step`、`nv-scr-df` 类命中；`nv-m-cell` 来自 ui-mobile 的抽取样式）。
- `@layer` 层序声明（宿主 `style.css` 首行 `theme, nv-tokens, base, components, nv-components, utilities, nv-overrides, app`）在产物中保持，preflight 未击穿组件样式。

## 5. 独立宿主验收（真实执行）

宿主：`/tmp/t10-3-host`，手工 scaffold 的 Vue3+TS app（等价 `pnpm create vite`），**无** alias、**无** patch reka-ui、`vite.config.ts` 仅 `tailwindcss()`+`Vue()`+`dedupe:['vue']`。`@nerv-iip/ui`/`ui-mobile` 以 `/tmp/t10-3/*.tgz` + `pnpm-workspace.yaml overrides` 装入（ui-mobile 对 ui 的 `0.1.0` 依赖经 override 指到本地 tgz）。

宿主 `src/style.css`：

```css
@layer theme, nv-tokens, base, components, nv-components, utilities, nv-overrides, app;
@import '@nerv-iip/ui/styles.css';
@import '@nerv-iip/ui-mobile/styles/mobile.css';
@import '@nerv-iip/ui-mobile/styles.css';   /* 抽取的组件 scoped css */
```

宿主 `src/App.vue` 覆盖 survey §6 验收清单 1–8（桌面表单 / 表格 / 弹窗+scroll-lock / 导航壳 Sidebar / 移动 safe-area+TabBar / 触屏 NvTouchButton+QtyStepper / 大屏 NvScreenScaler+DigitalFlop / 图表 NvLineChart+NvDonutChart）+ 暗色切换。

| 验收项 | 命令 / 手段 | 结果 |
| --- | --- | --- |
| `pnpm i` 两 tgz | `pnpm install` | 成功（588+ packages；ui tgz 7.4MB 装入） |
| vite build | `npx vite build` | `3892 modules transformed`，`✓ built` 无错 |
| 宿主 vue-tsc | `npx vue-tsc --noEmit -p tsconfig.app.json` | exit 0，零错（d.ts 与运行产物一致） |
| 渲页面无 console/pageerror | playwright(chromium_headless_shell-1255) 打开 `vite preview` | `ERRORS: NONE` |
| 1. 桌面表单 | `input[placeholder="输入名称"]` 存在 | ✓ |
| 2. 表格 | `table tbody tr`=3、表头「名称」存在 | ✓ |
| 3. 弹窗 + scroll-lock | `[role="dialog"]` 出现、`body overflow:hidden` | ✓ |
| 4. 导航壳 | Sidebar 渲出「工作台/报表」 | ✓ |
| 5. 移动 safe-area + TabBar | `getComputedStyle(.pt-safe).paddingTop`=`12px`、`min-h-touch.minHeight`=`48px`、`我的` TabBar 项存在 | ✓ |
| 6. 触屏 | `data-slot="touch-button"`、`data-slot="qty-stepper"` 存在 | ✓ |
| 7. 大屏 | `NvScreenScaler` 渲出、`nv-scr-df` 数字滚动存在 | ✓ |
| 8. 图表 | 页面 `svg` 12 个（line+donut+装饰 bg） | ✓ |
| 暗色切换 | 点击后 `html.dark` 生效 | ✓ |
| 形态子路径可引 | `import('@nerv-iip/ui/desktop')`/`screen`/`pad`/`file-preview`/`test-support` | 五者均解析、SSR 渲出真实组件 |

light/dark 全页截图留证于 `/tmp/t10-3-host-{light,dark}.png`（在宿主目录、未入仓）。

## 6. 未运行 / 遗留

- **`pnpm publish` 未运行**（产物化≠发 npm，本票只到 tgz）。
- **`./file-preview` 的 wasm 在浏览器里实渲染 PDF/docx 未验**：当前验收只到「wasm 资产正确 emit + 可解析 URL + 子路径可引」；FilePreview 打开真文件走 `@embedpdf/engines` 的运行时链路属 T10-4 验收（该票专门验 wasm 预览）。本票已把卡点的「资产化 + URL 形态」落地，T10-4 在此基础上接 FilePreview 渲染。
- **`test-support` 的 `runNvUiImportHygieneContract` 依赖 `node:fs`/`node:path`**：packed 后这个函数在浏览器宿主不可调用（本来也只给 vitest `setupFiles` 用）；`node:*` 解析失败会成 external 依赖警告，不影响主桶/其它子路径。若未来宿主在浏览器侧误引 `./test-support`，需要在文档注明它只可在 vitest setup 语境。
- **`NvScreenScaler` 的 screen tokens（`--nv-scr-*`）** 在 packed 形态已验证 `nv-scr-df` 类命中；`screen/tokens.css` 由 `components/screen/index.ts` `import './tokens.css'` 经 tsdown `css:true` 抽进 `dist/style.css`，宿主只需 `@import '@nerv-iip/ui/styles.css'`（standalone）+ 可选 `@nerv-iip/ui-mobile/styles.css`（组件 scoped）即得全量。
- **reka-ui patch 不传**（survey R2 / T10-2 裁定 1）：宿主装的是未打补丁的 reka-ui@2.10.1，ui 的 339 处 reka import 无消费 `nv-roving-focus` 信号的点——本票范围内无回归。ui-mobile 的 `MobileRadioGroup` 快速 keyup 缺陷是 ui-mobile 的已知缺陷、不属本票（T10-2 把它划给「跨票新输入」）。
- **`@embedpdf/*`+`@silurus/ooxml` 在 dependencies**：任何装 `@nerv-iip/ui` 的宿主背这部分传递依赖（即便不引 `./file-preview`）。R4 裁定项归 T10-4。
- **`NvAppShellMobile` 未在验收页面引**（`NvCell`/`NvCellGroup`/`NvTabBar` 已覆盖 mobile 形态代表交互）——清单 5 只要求「移动 safe-area + TabBar」。
- **`src/**/*.test.ts` 随 `files` 进 tgz**：作为 `@source` 扫描源的无害附带（同 T10-1），不经 exports 暴露、不进 d.ts。

## 7. 对 T10-4/5/6 的输入

- **T10-4**（file-preview）：wasm 资产管线已通（emit + `new URL`），只剩 FilePreview 真渲染 PDF/docx 在宿主的端到端走查 + R4「拆不拆独立包」裁定。
- **T10-5**（scheduling）：骨架模板可直接复用；`./vendor`/`./vendor.css`/`./vite` 三个入口按 T10-2 裁定 2 走「宿主自备」契约；`schedulingVendorStyles` 进 `files` 形态已在本包验证可行（`vite.mjs` 手写文件直接收 `files`）。
- **T10-6**（app-shell）：骨架复用 + 补 workspace 成员行前置（T10-2 裁定 3）。
- **跨票**：`./desktop`/`./screen`/`./pad` 三个形态子路径已在 packed 形态证明可引，后续给其它包加形态入口沿用同 pattern。
