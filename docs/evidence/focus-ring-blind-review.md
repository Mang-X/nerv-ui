# 输入件聚焦环 · 视觉盲审验收（方向 C）

日期：2026-11-17 ｜ 仓库：Mang-X/nerv-ui @ main `d30e0cc`（方向 C #322 已合入）
方式：本机 docs dev server `http://127.0.0.1:5180`（vitepress dev），Playwright 实机逐页 focus + `getComputedStyle` 取读数 + 截图目击。

## 契约标尺

`.nv-focusable`（`frontend/packages/ui/src/styles/theme.css:467-486`）统一下发：
`--nv-focus-ring = 0 0 0 1px var(--nv-brand), 0 0 0 4px brand@18%`
focus 同时 `border-color → var(--nv-brand)`；`[data-invalid]/[aria-invalid]` 切 `--nv-focus-ring-destructive`。
亮色 `--nv-brand = oklch(0.54 0.16 256)`，深色 `oklch(0.64 0.15 256)`（同色系、深底提高明度，故读数两值并存属设计）。

## 逐控件实测读数（focus 终态 box-shadow + border）

| 页面 | 控件根类 | 触发件 | 聚焦环（终态 box-shadow） | border | 判定 |
|---|---|---|---|---|---|
| desktop/input | `nv-input nv-focusable` | INPUT | `brand 0 0 0 1px, brand/0.18 0 0 0 4px` | brand | 一致 |
| desktop/input（invalid） | 同上 + `data-[invalid]` | INPUT | `destructive 0 0 0 1px, destructive/0.18 0 0 0 4px` | destructive | 一致（错误态变体符合契约） |
| desktop/input（disabled） | 同上 | INPUT(disabled) | `none` | `--input` | 一致（禁用不聚焦，正确） |
| desktop/select | `nv-strigger nv-focusable` | BUTTON | `brand 1px + 4px/18%` | brand | 一致 |
| desktop/combobox | `nv-focusable`（裸 INPUT 与触发 BUTTON 两种形态） | INPUT/BUTTON | `brand 1px + 4px/18%` | brand | 一致（两形态同环） |
| desktop/date-picker | `nv-strigger nv-focusable` 及 `nv-focusable` | BUTTON | `brand 1px + 4px/18%` | brand | 一致 |
| desktop/entity-picker | `nv-focusable` | BUTTON | `brand 1px + 4px/18%` | brand | 一致 |
| desktop/entity-multi-picker | `nv-focusable` | BUTTON | `brand 1px + 4px/18%` | brand | 一致 |
| desktop/cascade（entity-picker 页内 `[data-slot=nv-cascade-picker]`） | `NvSearchSelect` 触发 `nv-focusable` ×3 | BUTTON | `brand 1px + 4px/18%` | brand | 一致 |
| mobile/input | `nv-m-minput nv-focusable` | INPUT | 亮 `oklch(0.54)/brand 1px+4px/18%`；暗 `oklch(0.64)` | brand | 一致 |
| mobile/search-bar | `min-h-touch nv-focusable` | INPUT + 后缀 BUTTON | `brand 1px + 4px/18%` | brand | 一致（输入框与"搜索"按钮共用同环） |
| touch/qty-stepper（pad 场景唯一输入型控件） | `nv-focusable` | BUTTON | `brand 1px + 4px/18%` | brand | 一致 |
| screen/screen-input | `nv-scr-in nv-focusable` | INPUT | `brand 1px + 4px/18%`（覆盖原有 inset 浮雕阴影） | brand | 一致 |
| screen/screen-search | `nv-scr-se nv-focusable`（输入）+ `nv-scr-se-clear nv-focusable`（清除钮） | INPUT/BUTTON | `brand 1px + 4px/18%` | brand | 一致 |
| screen/screen-select | `nv-scr-sel-trigger nv-focusable` | BUTTON | `brand 1px + 4px/18%` | brand | 一致 |

（`brand` 占位：亮 `oklch(0.54 0.16 256)`、暗 `oklch(0.64 0.15 256)`；`destructive` 亮 `oklch(0.55 0.2 25)`、暗 `oklch(0.66 0.18 25)`。）

## 验收点核对

1. **同一形态**：全部输入件聚焦终态都是 `1px brand 实线 + 4px brand@18% 光晕`，无一组件自带例外环；screen 系原本自带的 inset 浮雕阴影在聚焦时被环整体替换（`box-shadow` 被覆盖而非叠加），仍读同一形态。✔
2. **brand 读出强调**：亮 `oklch(0.54 0.16 256)`（饱和 indigo-blue）在白纸底、暗 `oklch(0.64 0.15 256)` 在深底均为清晰强调蓝，截图目击非灰雾（`raw/focus-dark-input.png`、亮/深色 screen 截图）。✔
3. **亮/暗双态可读**：desktop/mobile 亮暗各实测一遍，色值随 `--nv-brand` 主题令牌翻转，对比度均足。✔
4. **hover→focus 过渡**：`nv-focusable` 自带 `box-shadow 150ms + border-color 150ms ease-out-quart`。实测中间帧（15/33/49/66/83/99/116ms）环宽与 border 色平滑插值、无跳变；hover 态本身不带 shadow，从 `none` 均匀长出 1px+4px。✔
5. **错误态**：`data-invalid` 输入聚焦环整体换 `destructive` 同构形（1px+4px/18%），契约内分派，非组件私改。✔
6. **禁用态**：disabled 输入无法聚焦、无环，符合契约（`.nv-focusable` 只挂 `:focus-visible/:focus-within`）。✔

## 不合格项

无。一次初测中 combobox 裸 INPUT 与 screen 系曾出现 `fv=true` 但 `shadow=none/inset-only` 的读数，复核为 CSS transition 中间帧采样假象，终态（≥300ms）均达契约环，非实现缺陷。

## 总分 / 判定

**10 / 10 — 合格**。
方向 C 契约经 `.nv-focusable` 单点下发，桌面 + 移动 + 触屏 + 大屏四域全部实测同一形态、同一令牌、同一过渡；无组件私造例外。

## 取证附件

- `raw/focus-all.txt`：逐页批量 computed-style 原始读数（首次跑批，含中间帧噪声，结论以本表终态复测为准）
- `raw/focus-dark-input.png`：深色下 NvInput 聚焦截图（brand 环 + 光晕 visível）
- `raw/focus-light-input.png`：亮色下 NvInput 聚焦截图
- `raw/focus-screen-dark.png`：screen-input 深色聚焦截图（brand 环 sobre painel escuro）
