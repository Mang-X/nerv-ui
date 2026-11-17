# T10 前置调查：版本化安装产物与独立宿主验收

只读调查，2026-11-17，工作树 `/Users/mang/Project/nerv-ui`（分支 `integration/nerv-ui-extraction`，HEAD `0416c89`）。本报告**不**声称任何产物已可用：当前四个包全部是「纯源码 workspace 包」——`exports` 全部指向 `./src/*.ts` 与 `./src/**/*.css`，没有 `files`、没有 `dist`、没有 `build` 脚本、没有 `.d.ts` 产物、`"private": true`。独立宿主今天只能通过 workspace 协议或源码 alias 消费。

## 0. 现状速览

| 包 | exports 形态 | 构建 | .d.ts | files | 结论 |
| --- | --- | --- | --- | --- | --- |
| `@nerv-iip/ui` | 7 个入口全部 `./src/*`（含 3 个 CSS 入口、`file-preview`、`test-support`、`schedule-model`） | 无（vite.config.ts 仅 vitest） | 无（`vue-tsc --noEmit`） | 无 | **需产物化** |
| `@nerv-iip/ui-mobile` | `.` → `./src/index.ts` + `./styles/mobile.css` | 无 | 无 | 无 | **需产物化** |
| `@nerv-iip/scheduling` | 7 个入口：`./src/*` + `vendor/dhtmlx/*` + `vite.mjs`（构建期插件） | 无 | 无（`vite.d.mts` 是手写 dts，非产物） | 无 | **需产物化** |
| `@nerv-iip/app-shell` | `.` → `./src/index.ts` | 无 | 无 | 无 | **需产物化，但当前不在 workspace 成员里**（`pnpm-workspace.yaml` 注释：app-shell in #9，即「待恢复」状态） |

宿主消费现状（验收参照系）：

- `apps/playground`：pnpm workspace 链接（无源码 alias），`main.css` 用公开入口 `@import '@nerv-iip/ui/styles.css'` + `@nerv-iip/ui-mobile/styles/mobile.css`。vite 配 `wasm()` + `schedulingVendorStyles()` + `dedupe:['vue']`。
- `apps/design-system`：**源码 alias**——`vite.config.ts` 把 `@nerv-iip/ui`/`ui-mobile` 别名到 `../../packages/*/src/index.ts`；VitePress `style.css` 用**相对路径** `../../../../../packages/ui/src/styles/theme.css` 等深链 + `@source` 指向包 src。**它不是产物消费的合格模型**，T10 验收不能以它为准。
- `contract-consumers/scheduling-host`：`prepare.mjs` 手工 symlink 真实包目录（仍是源码出口，非 packed tgz），这是今天最接近「独立宿主」的接缝——它证明裸 exports 在包外可解析，但没证 dist 产物。

## 1. 包边界与对外 public 面

### `@nerv-iip/ui`（~10MB src；400 `.vue` + 198 `.ts`）

公开面（exports）：

| 入口 | 内容 | 产物化注意 |
| --- | --- | --- |
| `.` | `src/index.ts` barrel：`cn`、empty 约定、`useTheme`/`initTheme` 等主题 composable、**五层组件** `blocks`/`pc`/`touch`/`screen`/`layout`、原版 `components/ui/*` primitives（~40 组）、file-upload、`toast`（re-export `vue-sonner`） | SFC 编译 + CSS 抽取 + `vue-sonner/style.css` 传递性导入 |
| `./file-preview` | `components/ui/file-preview/index.ts`：FilePreview 族（PDF/Office/图片预览） | **重资产入口**：`@embedpdf/*` 7 个包、`@silurus/ooxml`、4 个 wasm（`*.wasm?url` 导入，共 ~6.9MB）。必须独立 chunk/子路径，不能卷进主桶 |
| `./test-support` | vitest 支撑（unovis tooltip 定时器收口、nvui import hygiene 门禁实现） | test-only；产物里保留但消费者几乎不装 |
| `./styles.css` | `styles/standalone.css`：层序声明 + `tailwindcss` + `tw-animate-css` + `shadcn-vue/tailwind.css` + theme + overrides + `@source '../'` | **Tailwind v4 源文件**，由宿主 `@tailwindcss/vite` 编译；产物按原样分发（见 §3） |
| `./theme.css` | tokens + `@theme inline` + `@custom-variant dark` + `@import '@fontsource-variable/inter'` | 同上 |
| `./overrides.css` | **故意不分层**的 host-override（ADR 0020 §4.1 nv-overrides） | 同上 |
| `./schedule-model` | `lib/schedule-time.ts`：严格 instant parser + `export type *` | 纯 TS，零组件依赖；scheduling/model 与其共享类型 |

内部 css 传递导入（不在 exports 里但随组件生效）：`components/screen/index.ts` `import './tokens.css'`、`components/ui/sonner/index.ts` `import 'vue-sonner/style.css'`。→ 打包时 SFC `<style scoped>`（98 个文件有）+ 这两条 css import 必须抽成随包 CSS 产物或保留为 css import（宿主 bundler 处理）。

### `@nerv-iip/ui-mobile`（50 `.vue`）

- `.`：48 个 `Nv*`/`NvMobile*` 组件 + `cn`（re-export 自 `@nerv-iip/ui`）+ `MOBILE_OVERLAY_TARGET`。`lib/utils.ts` `export { cn } from '@nerv-iip/ui'` —— 跨包运行时依赖。
- `./styles/mobile.css`：`@source '../'` + 5 个 `@utility`（pt-safe/pb-safe/px-safe/min-h-touch/min-h-row）。token 依赖 ui 的 theme.css。

### `@nerv-iip/scheduling`（37 `.vue`）

| 入口 | 内容 |
| --- | --- |
| `.` | 大 barrel：GanttChart/ResourceSchedulerBoard/SchedulingWorkbench + 全部 panels/draft/snapshot/comparison/day/saved-plan/request-forms/async-candidates 组件、composables、model 映射、`DhtmlxEngine`/`isDhtmlxAvailable`/`preloadGantt` |
| `./model` | 纯类型 + factory-time/freeze-window/instant-validation（无组件） |
| `./host` | host.ts：纯回调与本地编辑态接口（无组件） |
| `./test-support` | 测试支撑 |
| `./styles.css` | `styles/scheduling.css`：`@layer nv-tokens` 排程色板 + `nv-components` 层组件视觉；另有 `components/day/day-print.css` 被 SFC 直接 import |
| `./vendor` / `./vendor.css` | `vendor/dhtmlx/dhtmlxgantt.{es.js,css,d.ts}` —— DHTMLX 9.1.4 **评估版**留在仓里（`stub.ts` 注释：评估许可禁止分发，真实库文件永不进 git——但文件实际在 `vendor/dhtmlx/`）。`loader.ts` `import('@nerv-iip/scheduling/vendor')` 动态加载，失败回落 `isDhtmlxAvailable()=false`。**产物化时必须裁定：vendor 是否随 tgz 分发（许可问题）** |
| `./vite` | `vite.mjs` `schedulingVendorStyles()`：构建期 Vite 插件，把 vendor css 剥 fonts.gstatic `@font-face` 再裹 `@layer nv-components`。宿主 vite 配置要它。**注意 `.mjs` 是手写文件不是产物** |

### `@nerv-iip/app-shell`

- `.`：AppShell（旧两级侧栏）、AppShellT + NavSide/NavTopDomains/NavUser（T 型导航壳），依赖 `vue-router` 5 + reka-ui + `@nerv-iip/ui`。
- 当前**不在 workspace packages 列表**（#9 待恢复）。产物化范围是否含它取决于 #9 状态；本报告按「需要时一起产物化」列出最小改动，拆票时单列。

## 2. 依赖面

运行时 dependencies 实读（`peer` 化建议基于「宿主必须持有单例」原则）：

| 依赖 | 使用面 | 建议 |
| --- | --- | --- |
| `vue@3.5.39` | 全部 4 包 | **peerDependencies**（宿主 `dedupe:['vue']` 已在用；两副本=响应性分裂） |
| `reka-ui@^2.10.1` | ui（339 处 import）、ui-mobile、app-shell | **peerDependencies 或严格 dependencies + 版本钉死**。⚠️ **本仓有 patch `patches/reka-ui@2.10.1.patch`（pnpm patchedDependencies）——独立宿主不继承 patch，产物必须先回答「patch 的内容是否已上游化/是否影响公开行为」** |
| `@lucide/vue@1.24.0` | 4 包图标 | dependencies 即可（纯组件库，无单例要求），也可 peer |
| `@vueuse/core@^14.3.0` | ui/ui-mobile/scheduling | dependencies |
| `reka-ui` 之外 reka 生态 | `@internationalized/date`（date-picker）、`vue-sonner`（Toaster/`toast` 直转出口）、`motion-v`（fileUploadMotion/filePreviewMotion）、`class-variance-authority`+`clsx`+`tailwind-merge`（cn）、`@tanstack/vue-table`（table/utils） | dependencies |
| `@unovis/ts` + `@unovis/vue` | pc/chart 四个图表组件 + test-support | dependencies（test-support 引用意味着 unovis 类型进 .d.ts，不能 external 成隐式 peer） |
| `@embedpdf/*` ×7 `@2.14.4` + `@silurus/ooxml@0.72.2` | **仅 file-preview 子路径** | dependencies 保留；产物分包后该子路径的依赖只在使用方安装解析时才拉——但 npm/pnpm 语义上 dependencies 是全包级的，**若想让宿主不装 embedpdf/ooxml，唯一干净做法是把 file-preview 拆成独立包**（见风险 §5-R4） |
| `@fontsource-variable/inter` | theme.css `@import` | css 期依赖：产物 theme.css 保留 `@import '@fontsource-variable/inter'` 则它必须是 dependency（宿主 bundler 解析 node_modules） |
| `tailwindcss`/`tw-animate-css`/`shadcn-vue/tailwind.css`/`@tailwindcss/vite` | standalone.css `@import` 链 + `@source`/`@theme`/`@utility`/`@custom-variant` | **不进包 dependencies**：它们是宿主构建期工具。但公开文档必须声明「宿主需 Tailwind v4 + @tailwindcss/vite + tw-animate-css + shadcn-vue 的 tailwind.css 可解析」——或者把这三个 css import 物化进产物 css（见 §3 方案 B） |
| `vue-router@5.2.0` | app-shell | peerDependencies（宿主路由必须是同一个实例） |
| DHTMLX vendor | scheduling `./vendor` | **许可裁定项**：评估版不进公共产物 → `./vendor`/`./vendor.css` 在 packed 形态要麽指向「宿主自备 dhtmlx」契约，要麽保持私有；`schedulingVendorStyles()` 插件同理 |

`private:true` 四包都要解除或改为发布字段（产物化≠发 npm，tgz 分发也需要 `version` 可信）。

## 3. 样式与资源分发方案

样式链是这个库**最不可省略的产物**。两条路线：

**方案 A（推荐，改动最小）：CSS 源文件原样分发 + JS 产物化**
- `files` 收 `src/styles/*.css`、`src/components/screen/tokens.css`、mobile `src/styles/mobile.css`、scheduling `src/styles/*.css` + `day-print.css` + `vendor/dhtmlx/*.css`（若许可放行），exports 的 css 入口**保持指向 src 原文件不动**（它们本来就是最终形态，Tailwind v4 `@source`/`@import` 语义依赖文件位置）。
- `@source '../'` 在 packed 包内解析为 `node_modules/@nerv-iip/ui/`——**此时它扫描的是 dist + 残留 src**。必须验证：若产物只含 dist，`@source` 还能不能扫到 Tailwind 类？→ 需要把 `@source` 指到产物里的真实类载体，或者**在产物里附带 src 的纯类名清单/`files` 同时收 src**（方案 A 的妥协形态：`files` = `dist` + `src`（仅作 @source 扫描源与 css 入口载体，不经 exports 暴露 JS））。⚠️ 这是本调查标记的**最大技术验证点**。
- `@import 'tailwindcss'`/`'tw-animate-css'`/`'shadcn-vue/tailwind.css'`/`'@fontsource-variable/inter'` 在宿主 node_modules 解析——前三者变宿主构建依赖，fontsource 变包 dependency。

**方案 B：css 也预编译**
- 库内跑一次 tailwind 把 standalone.css 物化成 `dist/styles.css`。缺点：`@source` 扫描宿主自己源码的职责消失（宿主 Tailwind 仍需为「宿主模板里写的 nv-* 类」生成 utilities）→ 实际上方案 B 消灭不了宿主对 Tailwind v4 的依赖，只换了一半形态。**不建议**，除非验收明确要求宿主零 tailwind。

资源：

- `*.wasm?url`（pdfium 4.4MB + ooxml 3 个共 2.5MB）：Vite lib 模式下 `?url` 产物化为 emitted asset + `new URL(..., import.meta.url)` 或相对路径。**宿主必须开着 wasm 资产管线**（playground 今天用 `vite-plugin-wasm`——产物化后 `?url` 已由库侧构建成普通 asset URL，理论上宿主不再需要 wasm plugin；要实测）。
- DHTMLX css/js/d.ts：随 `./vendor` 入口或裁定剔除。
- 字体：fontsource css import，宿主 bundler 解析 woff2。
- SVG/图表：无独立 svg 资产；unovis 是代码依赖。

## 4. 现有构建基建与类型产物

- **无库构建基建**：4 个 `vite.config.ts` 全部是 test-only（vitest 配置）。`frontend/vite.config.ts` 是 vite-plus 的 fmt/lint 门禁配置，不产物。`tsconfig.base.json` `noEmit:true`。
- **构建工具选型**：工作区已是 rolldown 系（vite-plus/`@voidzero-dev/vite-plus-core`）。建议 **tsdown**（rolldown 生态的库打包器，原生 Vue SFC + d.ts 隔离 + css 抽取）或 **vite lib mode + vite-plugin-dts**。tsdown 与现有工具链同源、单配置可给四包复用；vite lib mode 更可控但要手拼 dts。倾向 **tsdown**，调研票里先做 ui-mobile（最小、零 wasm、零 vendor）做骨架验证。
- **类型产物**：当前零 `.d.ts`。需要 `vue-tsc`/`tsdown dts` 生成；注意 barrel `export type *`、SFC props 类型推断、`schedule-model`/`model`/`host` 三个纯类型入口是声明文件质量的试金石。`components/ui/table/utils.ts` 用了 `@tanstack/vue-table` 类型 → 该依赖的类型会漏进公共 d.ts（dependencies 保留即可）。
- `components.json` 是 shadcn registry 元数据，与产物无关。
- `scheduling/vite.mjs` 手写插件文件可直接进 `files`（或转 ts 一起 build）。

## 5. 风险清单

- **R1 CSS 层序**：公开契约是八层 `theme, nv-tokens, base, components, nv-components, utilities, nv-overrides, app`，且宿主入口 css 第一行必须是 `@layer` 声明（design-system style.css 注释记录了「scoped SFC `@layer nv-components` 抢先生成层序导致 Preflight 击穿组件样式」的实事故）。产物化若把 scoped css 抽成单文件，**层序声明的先行性**必须在宿主 css 里保住——验收清单含「首屏组件样式不被 reset 击穿」。
- **R2 reka-ui patch 不传**：`patches/reka-ui@2.10.1.patch` 是 workspace 级 patchedDependencies，独立宿主装的是未打补丁的 reka-ui。若 patch 触及公开组件行为，tgz 形态与 workspace 形态行为不同 → 调查/实施第一步先 diff patch 内容定性。
- **R3 wasm 资产路径**：`?url` 产物化后资产落在 dist/assets，宿主 dev/build 两种模式的资产 base（`/` vs 相对）都要验；FilePreview 是懒加载动态 import，wasm URL 不能错绑到主 chunk 的 base。
- **R4 file-preview 重依赖污染全包**：embedpdf×7 + ooxml 在 dependencies → 任何宿主装 `@nerv-iip/ui` 都背 ~数 MB 传递依赖。要么接受，要么拆 `@nerv-iip/ui-file-preview` 独立包（额外一票的拆分成本）。
- **R5 Tailwind 类生成断链**：产物 JS 里的类名字符串（cva 变体、cn() 拼接）需要被宿主 Tailwind 扫到。`@source '../'` 在 node_modules 里语义是否仍覆盖 dist、`shadcn-vue/tailwind.css` 是否仍在宿主侧可解析——**不验证就发 tgz 等于裸奔**。
- **R6 类型与运行时代码一致性**：`export type *`、re-export `vue-sonner` 的 `toast`、SFC 泛型 props，dts 生成器与 bundler 产物可能漂移；`attw`/publint 类检查建议进验收。
- **R7 vendor 许可**：`vendor/dhtmlx/*` 是评估版，仓内自用与打进 tgz 分发是两件事；`schedulingVendorStyles` 还依赖它的文件路径存在。
- **R8 `private:true`+版本**：四包全 `private`、version 0.1.0；tgz 验收需要可信版本号（workspace:* 互相引用在 pack 时 pnpm 会物化成真实版本）。
- **R9 app-shell 未在 workspace**：要先随 #9 恢复成员资格再谈产物。
- **R10 test-support 入口**：它 import vitest 语境的桩；打进产物无害但要保证 dts 不引用 vitest 类型（宿主无 vitest 时 typecheck 不炸）——或给它独立 `types` 条件。

## 6. 独立宿主验收接缝建议

验收宿主形态：全新 `pnpm create vite` Vue+TS app，`pnpm i <tgz路径>`（或 `pnpm i file:` 指 packed 目录），**禁止** alias 到本仓、禁止 patch reka-ui、vite.config 只加 `@tailwindcss/vite` + `Vue()` +（需要的）wasm plugin。

入口 css（与 docs/desktop-standalone.md 现形态一致）：

```css
@layer theme, nv-tokens, base, components, nv-components, utilities, nv-overrides, app;
@import '@nerv-iip/ui/styles.css';
@import '@nerv-iip/ui-mobile/styles/mobile.css';
```

代表性交互清单（对应 T09/G 已盘点的公开面抽样）：

1. **桌面表单**：Input/Select/DatePicker/Combobox + NvField 校验态 + FormSection；暗色切换 + accent 换色（`initTheme`/`NvThemePicker`）。
2. **表格**：NvDataTable 排序/筛选/分页/空态 `—` 占位；FilterBar。
3. **弹窗**：Dialog/AlertDialog/Sheet/Drawer 开闭 + scroll-lock + `nv-overrides` 玻璃态生效（验证层序）。
4. **导航壳**：Sidebar/Breadcrumb/NavigationMenu（或 AppShellT，若 #9 落地）。
5. **移动**：NvAppShellMobile + TabBar/Cell/ActionSheet/BottomSheet/SwipeCell/PullRefresh + `pt-safe` 工具类生成（证明 `@source` 扫到了包产物）。
6. **触屏**：NvTouchButton/NvQtyStepper/NvTouchSegmented。
7. **大屏**：NvScreenScaler 缩放 + DigitalFlop + screen token 生效。
8. **图表**：NvLineChart/NvDonutChart（unovis 在 packed 形态渲染 + tooltip）。
9. **上传预览**：FileUpload 队列 + FilePreview 图片/PDF/Office wasm 预览（重资产接缝）。
10. **排程**：`@nerv-iip/scheduling/model`+`host` 类型可 import；GanttChart 在**无 vendor** 宿主回落 `isDhtmlxAvailable()=false` 占位不崩；若 vendor 随包分发则再验真甘特。
11. **typecheck**：宿主 `vue-tsc --noEmit` 通过——d.ts 与运行产物一致性的最低防线。

## 7. 建议拆票（≤6）

| # | 标题 | scope | 一句话验收 |
| --- | --- | --- | --- |
| T10-1 | 产物化骨架：ui-mobile 首个 tgz（tsdown 选型 + exports/files/dts 模板） | S | `pnpm pack` 出 tgz，新宿主 `pnpm i` + `@import '@nerv-iip/ui-mobile/styles/mobile.css'` + 渲一个 NvCell 不报错且 safe-area utility 生效 |
| T10-2 | reka-ui patch 定性 + vendor 许可裁定 | S | 报告给出 patch 内容是否影响公开行为、dhtmlx vendor 进不进 tgz 的裁定与后续形态 |
| T10-3 | `@nerv-iip/ui` 主桶产物化（含 css 入口原样分发 + `@source` 可用性验证） | M | packed ui 在独立宿主过验收清单 1–8（除 file-preview 项），宿主 vue-tsc 绿 |
| T10-4 | file-preview 子路径产物化（wasm `?url` + embedpdf/ooxml 依赖策略落地） | M | 独立宿主 FilePreview 渲出 PDF 与 docx，wasm 请求 200，主桶用户可选不装其重依赖（按 R4 裁定） |
| T10-5 | `@nerv-iip/scheduling` 产物化（model/host/styles + vendor 裁定落地 + `schedulingVendorStyles` 分发形态） | M | packed scheduling 在独立宿主完成清单 10；`./vite` 入口插件在宿主 vite.config 可用 |
| T10-6 | app-shell 产物化（前置 #9 恢复 workspace） | S | 独立宿主挂 AppShellT + vue-router 跑通导航壳 |

依赖序：T10-2 的裁定是 T10-4/T10-5 的输入；T10-1 的骨架是 T10-3–6 的模板。
