# T10-1 独立宿主验收证据

实施 + 验收，2026-11-17，工作树 `/Users/mang/Project/nerv-ui-worktrees/t10-1-mobile-pkg`，分支 `feat/t10-1-mobile-pkg`，base `4143840`。本文件记录 `@nerv-iip/ui-mobile` 产物化骨架在独立宿主（零 alias、零 patch、非 workspace）的实际执行证据。区分：未运行项会明确标注。

## 1. 选型结论

**tsdown 0.23.7**（rolldown 生态库打包器），理由：

- 与本仓现有 rolldown 系工具链同源（`vite-plus` / `@voidzero-dev/vite-plus-core`），不引入第二条构建线。
- 单 `tsdown.config.ts` 同时覆盖 JS bundling、Vue SFC 编译（`unplugin-vue/rolldown`）、`.d.ts` 生成（`rolldown-plugin-dts`）、SFC `<style scoped>` CSS 抽取（`@tsdown/css`）。`vite lib mode` 要达到同等产出须手拼 `vite-plugin-dts` + css 抽取，改动面更大。
- 产物 `dist/index.js`（155.4 kB）+ `dist/index.d.ts`（58.4 kB）+ `dist/style.css`（29.1 kB）。scoped `data-v-*` 选择器在产物 JS 与抽取 CSS 间一一对应（实测 scope id 交集对齐）。

**Vue SFC dts 的已知坑（模板必须带）**：`<script setup>` 里 `export interface X`（本包 9 个 SFC：`TabItem`/`StepItem`/`ActionItem`/`SwipeAction`/`MobileTabItem`/`GridItem`/`FabAction`/`PickerOption`/`DropdownOption`）只有 `tsc` 生成器（vue-tsc/Volar）能浮现为命名导出；默认 `oxc` 生成器报 `MISSING_EXPORT`。`tsdown.config.ts` 里必须 `dts: { tsc: { vue: true } }`。

## 2. 改动面

| 文件 | 内容 |
| --- | --- |
| `packages/ui-mobile/package.json` | `build`=`tsdown`；`exports` `.`→`{types:./dist/index.d.ts, import:./dist/index.js}`、新增 `./styles.css`→`./dist/style.css`；`files`=[`dist`,`src`]；`vue` 移到 `peerDependencies(^3.5.0)`；新增 devDeps `tsdown`/`unplugin-vue`/`@tsdown/css` |
| `packages/ui-mobile/tsdown.config.ts` | 见上文（`deps.neverBundle` 外置 vue/@nerv-iip/ui/reka-ui/@lucide/vue/@vueuse/core） |
| `packages/ui-mobile/tsconfig.build.json` | extends base，去掉 `vitest/globals` types、排除 `*.test.ts`——保证产物 `.d.ts` 不引用 vitest（survey §5 R10） |
| `pnpm-lock.yaml` | 新 devDeps 解析 |

**未动的设计决定**：

- `./styles/mobile.css` 入口仍指 `./src/styles/mobile.css`（Tailwind v4 源文件即最终形态，survey §3 方案 A），不进 bundler。
- `files` 同时收 `src`：它既是 `mobile.css` 载体，也是 `@source '../'` 的扫描源（见 §4 R5）。
- `@nerv-iip/ui` 仍是 `dependencies`（`workspace:*` pack 时物化为 `0.1.0`）；它自身产物化属 T10-3，本票不动它。

## 3. 构建与打包证据

```text
$ pnpm run build        # tsdown
✔ dist/index.js    155.40 kB │ gzip: 35.39 kB
  dist/style.css    29.13 kB │ gzip:  5.52 kB
  dist/index.d.ts   58.36 kB │ gzip: 11.84 kB
✔ Build complete in 2796ms

$ pnpm pack --pack-destination /tmp/t10-1
→ /tmp/t10-1/nerv-iip-ui-mobile-0.1.0.tgz
```

tgz 内容：`dist/{index.js,index.d.ts,style.css}` + `src/`（全部 `.vue`/`.ts` 含 `styles/mobile.css`）+ `package.json`。`grep` 产物 `dist/index.d.ts` **零 vitest 引用**；`TabItem`/`StepItem`/`ActionItem`/`SwipeAction` 等命名类型导出均在。

## 4. R5 验证：`@source '../'` 在 packed node_modules

**结论：成立。** `src/styles/mobile.css` 里 `@source '../'` 相对自身解析到包内 `src/`。packed 布局里 `src/` 随 `files` 分发、含全部 `.vue`/`.ts` 类名载体，宿主 Tailwind v4 能扫到。

独立宿主 `dist/assets/index-*.css` 实测：

- 5 个 `@utility` 全部生成：`.pt-safe`、`.pb-safe`、`.px-safe`、`.min-h-touch{min-height:48px}`、`.min-h-row`。
- `nv-m-cell` scoped 样式经 `dist/style.css` 抽取进入宿主 bundle（`nv-m-cell[data-v-...]:after{...}` 命中）。

## 5. 独立宿主验收（真实执行）

宿主：`/tmp/t10-1-host`，手工 scaffold 的 Vue3+TS app（等价 `pnpm create vite`），**无** alias、**无** patch、`vite.config.ts` 仅 `tailwindcss()`+`Vue()`+`dedupe:['vue']`。`@nerv-iip/ui` 以同方式 tgz + `pnpm-workspace.yaml overrides` 满足 `ui-mobile` 对它的 `0.1.0` 依赖（它尚未产物化，T10-3 前只能以源 tgz 形态供给；这是本票的已知接缝）。

宿主 `src/style.css`：

```css
@layer theme, nv-tokens, base, components, nv-components, utilities, nv-overrides, app;
@import '@nerv-iip/ui/styles.css';
@import '@nerv-iip/ui-mobile/styles/mobile.css';
@import '@nerv-iip/ui-mobile/styles.css';   /* 抽取的组件 scoped css */
```

宿主 `App.vue` 渲染 `<NvCellGroup><NvCell title note value arrow /></NvCellGroup>`，外层 `div.pt-safe.min-h-touch`。

| 验收项 | 命令 | 结果 |
| --- | --- | --- |
| `pnpm i` 两 tgz | `pnpm install` | 588 packages，成功 |
| vite build | `npx vite build` | 7217 modules transformed，`✓ built` 无错 |
| 渲一个 NvCell 不报错 | playwright chromium 打开 `vite preview` 页 | `[data-slot="cell"]` 渲染出 `单元格说明文字值`；`pageerror`/`console.error` **NONE** |
| pt-safe 生效 | `getComputedStyle(.pt-safe).paddingTop` | `12px`（=max(0.75rem, env)） |
| min-h-touch 生效 | `getComputedStyle(.min-h-touch).minHeight` | `48px` |
| 宿主 vue-tsc | `npx vue-tsc --noEmit` | exit 0，零错 |

## 6. 未运行 / 遗留

- **`pnpm publish` 未运行**（产物化≠发 npm，本票只到 tgz）。
- **`@nerv-iip/ui` 真实产物未验**：它仍以源 `.ts` exports 进宿主（T10-3 范围）。本票的宿主验收里 ui 的 runtime（`cn`）经 Vite 转译源码消费成功，但 Node 直跑会因 ui 是 raw TS 失败——这是 ui 未产物化的预期行为，不是 ui-mobile 缺陷。
- **`reka-ui` patch 不传**（survey R2）在宿主侧**未定性**——本宿主装的是未打补丁的 reka-ui@2.10.x，当前验收用例（NvCell/NvCellGroup 不触 patch 面）未暴露差异；归 T10-2。
- **`shadcn-vue/tailwind.css`、`tw-animate-css`、`tailwindcss`、`@tailwindcss/vite`、`@fontsource-variable/inter`** 是宿主构建期依赖（不进包 dependencies），宿主 devDeps 已装——与 survey §2 裁定一致。
- `src/**/*.test.ts` 随 `files` 进了 tgz（作为 `@source` 扫描源的无害附带）。它们 import vitest/`@vue/test-utils`/`node:*`，但**不**经 exports 暴露、不进 d.ts；宿主 vue-tsc `include` 只圈宿主 `src` 故不受扰。若后续想收紧可给 `src` 加 `.npmignore`，本票保留以保 `@source` 覆盖最大面。

## 7. 对 T10-3~6 的模板沉淀

后续包产物化可直接复用：`tsdown.config.ts` 骨架（SFC→unplugin-vue、dts→`tsc:{vue:true}`、css→`@tsdown/css`）、`tsconfig.build.json`（去 vitest types + 排除 test）、`package.json` 的 exports/files/peer 模式。ui 需注意：多入口（`./file-preview` 等子路径 + wasm `?url` + `export type *`）在 T10-3 单独验。
