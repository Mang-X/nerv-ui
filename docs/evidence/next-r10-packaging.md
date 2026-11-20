# @nerv-ui 产物化与独立宿主验收（R10）

日期：2026-11-18｜分支：feat/nerv-ui-next-r1

## 产物
| 包 | tgz 体积 |
| --- | --- |
| @nerv-ui/desktop | 122 KB |
| @nerv-ui/mobile | 83 KB |
| @nerv-ui/pad | 16 KB |
| @nerv-ui/screen | 99 KB |
| @nerv-ui/theme | 5 KB |

每个包：`dist`（JS + `style.css` 原子 CSS + `.d.ts`）+ `src`（StyleX 变量源）。
`vue` / `@ui-sdk/vue` / `@ui-sdk/core` / `@stylexjs/stylex` 为 peerDependencies（宿主自持单例）；`@lucide/vue` 为 dependency。

## 独立宿主验收（/tmp/nx-host，`pnpm create vite` Vue+TS）
只安装 `nerv-ui-theme` + `nerv-ui-desktop` 两个 tgz，零源码路径、零 alias：

- `pnpm i <tgz>`：成功
- `vite build`：成功（419ms）
- `vue-tsc --noEmit`：exit 0（d.ts 可用）
- 浏览器实测（dev server）：
  - NvButton / NvBadge / NvCard / NvInput / NvSwitch 正常渲染
  - 输入 v-model 双向绑定生效（卡片同步显示）
  - Switch 点击后 aria-checked false→true
  - 聚焦环为 `1px brand + 4px brand/14%`（StyleX 类生效）
  - NvLineChart 渲染 SVG

宿主 vite 配置仅需 `vue()` + `@stylexjs/unplugin/vite`；无需 Tailwind、无需任何 CSS 框架。

## 已知边界
- StyleX 变量组哈希按编译单元生成，因此每个包内置 `src/theme` 副本（由 `scripts/sync-theme.mjs` 从 `packages/theme/src` 同步），不跨包 import 变量组。
- 宿主需自行引入 `@nerv-ui/<pkg>/styles.css`（原子 CSS 不自动注入）。

## 最终状态（2026-11-18 收口）

| 包 | 组件数 | tgz |
| --- | --- | --- |
| @nerv-ui/desktop | 83 | 122 KB |
| @nerv-ui/mobile | 36 | 83 KB |
| @nerv-ui/pad | 16 | 45 KB |
| @nerv-ui/screen | 27 | 99 KB |
| **合计** | **162** | — |

- 四个包 `typecheck` 全 OK、`build` 全通过（StyleX 原子 CSS 随产物）
- `apps/docs-next` 115 页全部 200，零控制台错误（除既有 favicon 404）
- 独立宿主（先前验收）只装 tgz 可用：渲染 / v-model / 切换 / 聚焦环 / SVG 图表全绿
- 旧库 `@nerv-iip/*` 与 `apps/docs` 全程零改动
