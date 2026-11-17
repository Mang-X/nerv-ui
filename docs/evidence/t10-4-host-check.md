# T10-4 独立宿主验收证据：`./file-preview` 子路径产物化收尾

实施 + 验收，2026-11-17，工作树 `/Users/mang/Project/nerv-ui-worktrees/t10-4-filepreview`，分支 `feat/t10-4-filepreview`，base `integration/nerv-ui-extraction`。本文件记录 `@nerv-iip/ui` 的 `./file-preview` 子路径在独立宿主（零 alias、零 patch、非 workspace，`pnpm i file:...tgz`）的实际执行证据。区分：未运行项明确标注。

## 1. R4 依赖策略裁定：选 C（可选 peerDependencies）

### 实测负担（决策输入）

任何装 `@nerv-iip/ui` 的宿主在 T10-3 形态（重依赖在 `dependencies`）下会传递拉入：

| 依赖                                                                  | 仓内 .pnpm 实测大小 | 说明                                                             |
| --------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------- |
| `@embedpdf/fonts-{sc,tc,jp,kr,latin,arabic,hebrew}`                   | **~150 MB**         | `@embedpdf/engines` 的传递 deps，CJK 字体包占绝对大头            |
| `@embedpdf/pdfium` + `@embedpdf/engines` + `core` + 5 插件 + `models` | ~13 MB              | PDF 渲染本体                                                     |
| `@silurus/ooxml`                                                      | ~9.3 MB             | OOXML 解析 + viewer                                              |
| `react` / `react-dom` / `svelte` / `preact`                           | ~13 MB              | embedpdf 各包把四框架列为**非 optional** peer，pnpm auto-install |
| **合计**                                                              | **~185–190 MB**     | 与是否引 `./file-preview` 无关                                   |

### 三方案权衡

- **A 保留 dependencies**：被否。直接违反票面验收「主桶用户可选不装其重依赖」，且 ~190 MB 传递负担对不渲 PDF 的宿主是纯浪费。
- **B 拆 `@nerv-iip/ui-file-preview` 独立包**：结构性最干净，但工作量实测超 M（file-preview 源码树牵动的 `ui-primitives.contract.test.ts`、`nvui-naming.contract.test.ts`、命名映射、playground/design-system 消费点、wasm 资产搬运都需一并迁移），本票内硬做会烂尾。按 owner「按需、不过度」取向与约束条款，**不在本票做，建议需要硬隔离时另立票**。
- **C 可选 peerDependencies（选定）**：`peerDependencies` 声明 8 个包 + `peerDependenciesMeta.*.optional: true`。pnpm/npm 语义下 optional peer **不**被传递安装，宿主自选装不装——精确满足「可选不装」。配合 FilePreview 自身对 `PdfPreview`/`OfficePreview` 的 `defineAsyncComponent` 懒加载边界（重依赖只出现在 `dist/PdfPreview-*.js`/`OfficePreview-*.js` 两个懒 chunk），主桶/轻量路径与重依赖零接触。

**理由**：C 与 B 给主桶用户的收益**完全相同**（不装重依赖）；差别只在「file-preview 用户是手写 deps 还是装第二个包」。C 零新包零拆分成本，且 embedpdf 自身把 react/svelte/preact 列为非 optional peer——**即使拆 B，选用 file-preview 的宿主仍背同样的 ~190 MB**，B 买不来更轻的 file-preview 消费方，只买来更复杂的仓库结构。owner 的「按需、不过度」与 T10-2「重资产让宿主自备」两条口径同时指向 C。

### 落地改动

`frontend/packages/ui/package.json`：`@embedpdf/*`×7 + `@silurus/ooxml` 从 `dependencies` 移入 `peerDependencies`，并配 `peerDependenciesMeta.optional:true`。`tsdown.config.ts` 的 `neverBundle` 已含全部 8 个（外部化逻辑不变）。

## 2. 主桶隔离证据（结构性）

- `dist/index.js`（主桶）只 `import ... from "./filePreviewKind-*.js"`——`filePreviewKind` 是**纯 TS**（只引 vue 类型 + `@lucide/vue` + `../../../lib/{file,motion}`），**不引** embedpdf/ooxml。
- `grep '@embedpdf\|@silurus' dist/index.js dist/desktop.js dist/screen.js dist/pad.js` → **零命中**；重依赖只出现在 `dist/PdfPreview-*.js`（`@embedpdf/*` 静态 + `engines` 动态 import）与 `dist/OfficePreview-*.js`（`@silurus/ooxml/*` 动态 import）。
- **轻量宿主实测**（`/tmp/t10-4-light-host`，deps 只含 `@nerv-iip/ui`+tailwind+reka+vue）：`node_modules` 里**没有** `@embedpdf`/`@silurus`/`react`/`svelte`/`preact`/`react-dom`；`import { Button, getFilePreviewKind } from '@nerv-iip/ui'` 可用（`getFilePreviewKind('a.pdf','application/pdf')`→`'pdf'`），`vite build` 绿、playwright 打开无 error。**这是「不背重依赖」的直接实证。**

## 3. wasm `?url` 双模式 base 验证

产物 `dist/PdfPreview-*.js` 与 `dist/OfficePreview-*.js` 内是 `new URL("assets/<name>-<hash>.wasm", import.meta.url)`（T10-3 插件产物，相对**模块自身** URL 而非主 chunk）。四 wasm 随 tgz 落在 `dist/assets/`（pdfium 4.4MB + docx/pptx/xlsx 各 ~0.9MB）。

| 模式                        | wasm 请求 URL                                                                                                        | 结果                                                        |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **dev**（`vite dev`）       | `/node_modules/.pnpm/@nerv-iip+ui@file+...tgz.../node_modules/@nerv-iip/ui/dist/assets/pdfium-RAgkpwfK.wasm` 等 3 个 | **全 200**，相对库 chunk 正确解析，**不错绑主 chunk base**  |
| **build**（`vite preview`） | `/assets/pdfium-RAgkpwfK.wasm`、`/assets/docx_parser_bg-*.wasm`、`/assets/xlsx_parser_bg-*.wasm`                     | **全 200**，宿主 bundler 把资产 hoist 进自身 `dist/assets/` |

结论：`new URL(..., import.meta.url)` 相对模块 URL 的机制在 dev/build 两态都生成正确资产 base，FilePreview 懒加载动态 import 无错绑。**packed 宿主不需要 `vite-plugin-wasm`**（已更正设计系统文档原「宿主需启用 vite-plugin-wasm」的源码形态口径）。

## 4. 端到端渲染（独立宿主，`pnpm i file:...tgz`）

宿主 `/tmp/t10-4-host`：`pnpm create vite --template vue-ts` 骨架，`vite.config` 只 `tailwindcss()+Vue()+dedupe:['vue']`，**零 alias、零 patch、零 wasm plugin**；`src/style.css` 只 `@layer` 声明 + `@import '@nerv-iip/ui/styles.css'`。fixture 复用 `design-system/docs/public/file-preview/`（`reading-journey.pdf` 3 页、`quality-evidence-report.pdf`、`quality-work-instruction.docx`、`inspection-metrics.xlsx`、`preview-review-deck.pptx`）+ `playground/public/files/garden.png`。

playwright（chromium_headless_shell-1228，`--headless`）逐 tab 走查，`page.on('pageerror'|'console'|'requestfailed'|'response')` 全量监听：

| 验收项                                      | 实测                                                                                                                               | 结果       |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| PDF 多页                                    | `reading-journey.pdf` 渲出「MEADOW - PAGE ONE」实像素（截图），工具栏「第 1 页」117%；点「下一页」→「第 2 页」「RIVER - PAGE TWO」 | ✓ 翻页有效 |
| PDF 单页                                    | `quality-evidence-report.pdf` 渲出                                                                                                 | ✓          |
| DOCX                                        | `quality-work-instruction.docx` 渲出全文（Scope/Checklist/Disposition），canvas×1，1/1 页                                          | ✓          |
| PPTX                                        | `preview-review-deck.pptx` 渲出「Preview Coverage」，1/3 张                                                                        | ✓          |
| XLSX                                        | `inspection-metrics.xlsx` 渲出 3 sheet 表格 + 底 tab                                                                               | ✓          |
| 图片                                        | `garden.png` 渲出                                                                                                                  | ✓          |
| `ready` 事件                                | `pdfMulti:pdf`、`docx:office-docx`、`xlsx:office-xlsx`、`image:image`、`pptx:office-pptx` 全部触发                                 | ✓          |
| wasm 请求                                   | dev 3 个 200 / build 3 个 200（pdfium+docx+xlsx，pptx 复用缓存）                                                                   | ✓          |
| `pageerror`/`console.error`/`requestfailed` | 两模式均 `ERRORS NONE`、`FAILED_REQS []`                                                                                           | ✓          |

## 5. types / 门禁

- 宿主 `npx vue-tsc --noEmit -p tsconfig.app.json` → **exit 0**（dist d.ts 与运行产物一致）。
- `grep vitest node_modules/@nerv-iip/ui/dist/file-preview.{d.ts,js}` → **零命中**（build tsconfig 去 vitest types）。
- 仓内 `packages/ui`：`pnpm typecheck` exit 0；`pnpm test` **910 passed (70 files)**。
- `vp fmt --check` 对我改的 `packages/ui/package.json`+`file-preview.md` → **all correct**（仓内另有 10 个 base 上就失败的 fmt 项，与本票无关，未顺手修以免扩大 diff）。

## 6. 未运行 / 遗留

- **`pnpm publish` 未运行**（tgz 分发，同 T10-1/3 口径）。
- **PPTX 在 dev/build 截图里渲出但 wasm 只在 build 抓包到**（dev 时 docx 先行把 ooxml wasm 缓存，pptx 复用未发新请求）——不算缺陷，但「pptx wasm 独立 200」未单独取证。
- **R4 若 owner 要硬隔离（B 拆包）**：本票按 C 落地；B 的剩余工作量（迁移源码树 + 契约测试 + 命名映射 + 新包骨架）建议另立票，不在本 PR 硬做。
- **embedpdf 的 react/svelte/preact 非 optional peer**：选用 file-preview 的宿主仍会被 pnpm auto-install 这些框架 peer（~13MB）——这是 embedpdf 上游的 peer 声明行为，不是本包能消掉的；对「不装 file-preview」的主桶用户无影响。
- **`@embedpdf/fonts-*` ~150MB 只在选用 file-preview 的宿主上发生**：字体包是 `@embedpdf/engines` 的传递 deps；本包 `fontFallback:null` 已禁远程补字体，字体包字节不进产物、不进 wasm，只影响宿主 node_modules 体积。
- **验收宿主 `/tmp/t10-4-host`、`/tmp/t10-4-light-host` 与截图在 /tmp**，按约束不入仓。

## 7. 对 T10-5/6 的输入

- 可选 peer 的形态可直接复用到任何「重资产/许可敏感且非全包必需」的依赖（对照 T10-2 裁定 2 的「宿主自备」语义，C 是「宿主可选安装」的对偶机制）。
- file-preview 的 `?url` wasm 管线 + 懒 chunk 隔离模式已双模式验证，后续包若有 wasm 资产沿用同 pattern。
