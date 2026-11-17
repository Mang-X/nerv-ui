# Mobile 组件逐状态视觉打磨（issue #335 · 波2）

**Scope**：`frontend/packages/ui-mobile/src/components/` 全部 47 个组件。
**对照契约**：`frontend/packages/ui/src/styles/theme.css` 的 `--nv-focus-ring`（1px brand + 4px brand halo），`overrides.css` 的 glass 弹层规则（`blur(16-20px)` + 半透明）。

## 验收矩阵与判定

| 组件 | default | 聚焦环跟随形状 | hover/active | disabled | invalid | 弹层玻璃 | 备注 |
|---|---|---|---|---|---|---|---|
| MobileButton | 44px / 10px 圆角 | rect 匹配 | active 透 | 0.4 | — | — | OK |
| MobileBadge | 16-20px 角标 | 非交互 | — | — | — | — | OK |
| Cell | min-h-touch | rect 匹配（仅 arrow 可点） | active:bg-accent | — | — | — | OK |
| ListRow | min-h-row | rect 匹配 | active:bg-accent | — | — | — | OK |
| MobileDivider | 静态 | — | — | — | — | — | OK |
| MobileAvatar | 静态 | — | — | — | — | — | OK |
| Tag | 20-24px chip | 关闭钮 circular | — | — | — | — | OK |
| MobileSkeleton | 静态 | — | — | — | — | — | OK |
| MobileInput | 44px / rounded-xl | wrapper 环匹配 | — | — | destructive via `nv-focusable[data-invalid]` | — | OK |
| MobileCheckbox | 22px box + 44px row | **修复**：环画在 22px box 上（之前画整行 44px） | active scale(0.88) | 0.4 | — | — | FIXED |
| MobileRadioItem | min-h-touch 行 | rect 匹配 | active:bg-accent | 0.4 | — | — | OK |
| MobileSwitch | 51×31 pill in 51×44 | **修复**：环画在 51×31 pill 上（之前同时画在外层 44px 椭圆） | thumb is-pressed | 0.5 | data-invalid 走 destructive | — | FIXED |
| NvStepper | 44px / rounded-lg | wrapper 环匹配 | active:bg-muted + glyph 缩 | 0.3 | — | — | OK |
| MobileSlider | track + 20px thumb | **修复**：环画在 20px 圆 thumb 上（之前 44px 方框 + 内部 outline 双环）；外加 compose drop-shadow + halo | thumb dot scale | — | — | — | FIXED |
| MobileRate | 44px star button | **修复**：rounded-full 环（之前无 border-radius → 方形 halo） | glyph pop | — | — | — | FIXED |
| NumberKeyboard | 56px key | rounded-xl 匹配 | active | — | — | surface 由 overrides.css 玻璃规则覆盖 | FIXED（glass 槽位补登） |
| SearchBar | pill + 取消钮 | wrapper 环匹配；**修复**：清除钮环画在 20px 内圆上（之前画整 48px 钮） | active | — | — | — | FIXED |
| NvPicker | 滚轮 40px/项 | — | — | — | — | 继承 BottomSheet glass | OK |
| MobileDatePicker | 滚轮 | — | — | — | — | 继承 BottomSheet glass | OK |
| ScanBar | min-h-touch / rounded-lg | rect 匹配 | — | — | — | — | OK |
| NvTabBar | min-h-touch col | **修复**：环画在内部 10px hit pill 上（之前画整 48px 矩形列） | hit fade | — | — | — | FIXED |
| MobileTabs | h-11 / underline | rect 匹配（标签列） | underline slide | — | — | — | OK |
| NvSteps | 静态步骤 | — | — | — | — | — | OK |
| NvNavBar | 12h / 36px back | **修复**：环画在内部 36px 圆上（之前画 44px 椭圆） | active bg-accent | — | — | — | FIXED |
| NvCollapse | min-h-touch head | rect 匹配 | active:bg-accent | — | — | — | OK |
| DropdownMenu | trigger + panel | trigger rect 匹配 | active | — | — | panel `data-slot='dropdown-menu-content'` → glass 16px | OK |
| ActionSheet | BottomSheet 内 | — | — | — | — | 继承 BottomSheet glass | OK |
| BottomSheet | drag handle | — | — | — | — | `data-slot='mobile-sheet-content'` → glass 20px saturate(1.7) | OK |
| MobileDialog | 17.5rem card | 按钮 rect 匹配 | active | — | — | `data-slot='mobile-dialog-content'` → glass 20px | OK |
| MobileToast | 居中 HUD | — | — | — | — | **修复**：`blur(4px)` → `blur(18px)`，alpha 0.92→0.78 | FIXED |
| NoticeBar | 静态横幅 | — | — | — | — | — | OK |
| MobileProgress | 静态 | — | — | — | — | — | OK |
| NvResult | 静态 | — | — | — | — | — | OK |
| NvEmpty | 静态 | — | — | — | — | — | OK |
| ErrorRetry | NvMobileButton 内嵌 | — | — | — | — | — | OK |
| Fab | 56px 圆 + 速度盘 | **修复**：fab-main 环 compose 已有 drop-shadow + halo（之前 nv-focusable 顶掉浮起阴影）；fab-act 环画在内部 40px 圆钮 | pressed scale(0.92) | — | — | scrim `blur(2px)` → `blur(6px)` | FIXED |
| MobileGrid | 宫格 cell | rect 匹配 | active:bg-muted | — | — | — | OK |
| PullRefresh | 手势 | — | — | — | — | — | OK |
| SwipeCell | 76px action 钮 | rect 匹配 | active:opacity | — | — | — | OK |
| MobileSwiper | 静态 | — | — | — | — | — | OK |
| NvImage | 静态 | — | — | — | — | — | OK |
| VirtualList | 滚动 | — | — | — | — | — | OK |
| InfiniteList | 滚动 | — | — | — | — | — | OK |
| AppShellMobile | sticky bars | — | — | — | — | sticky bar 已 `backdrop-blur-xl`(24px) | OK |
| MobileTaskListShell | 壳 + 内嵌 btn | — | — | — | — | — | OK |
| PhotoAttachments | NvMobileButton 内嵌 | — | — | — | — | — | OK |

## 修复缺陷清单

1. **`MobileSwitch`**：`nv-focusable` 在 51×44 触控根上画了一个高椭圆 halo，与 `:focus-within .nv-m-mswitch-pill` 在 51×31 pill 上画的环同时出现 → 双环。修法：root 移除 `nv-focusable`；新增 `:focus-visible`+`:focus-within` 都把 halo 落到 pill；同时补 `data-invalid`/`aria-invalid` 走 `--nv-focus-ring-destructive`。
2. **`MobileSlider`**：44px 方 hit area 上的 `nv-focusable` 画方 halo，同时 `.nv-m-slider-ring` 自带 2px `var(--ring)` outline → 双环 + 错 token（`--ring` 是中性灰）。修法：thumb 移除 `nv-focusable`；focus 规则改写为 compose `0 1px 5px` 休息态投影 + `var(--nv-focus-ring)`，并放在 `@layer` 外避免被 utilities 层覆盖。
3. **`MobileCheckbox`**：`nv-focusable` 在整行 44px 高按钮上画 halo。修法：移除 root 的 `nv-focusable`；focus 环落到 22px `.nv-m-mcheck-box`，形状与其 `rounded-md` 一致。
4. **`MobileRate`**：44px 方形 star button 上 `nv-focusable` 画方形 halo。修法：button 加 `rounded-full` + 自带 `box-shadow: var(--nv-focus-ring)`；halo 是圆形。
5. **`NavBar`**：44×44 back button 上 `nv-focusable` 画 44px 圆环。修法：环落到内部 36px `.nv-m-navbar-back` 圆。
6. **`SearchBar`**：清除按钮的 `nv-focusable` 画 48px 圆角矩形 halo。修法：环落到内部 20px `.nv-m-sb-clear-dot` 圆。
7. **`TabBar`**：48px 高矩形列上 `nv-focusable` 画矩形 halo。修法：环落到内部 `.nv-m-tabbar-hit`（10px 圆角内 pill）。
8. **`Fab`**：`nv-focusable` 在 `nv-m-fab-main` 上的 `box-shadow` 替换掉原本浮起投影（`0 8px 24px -6px brand`）；在 `nv-m-fab-act` 上画 halo 时把 hit area 整个框起来。修法：两处都移除 `nv-focusable`；fab-main focus 时 compose 既有 inset+drop shadow + `--nv-focus-ring`；fab-act focus 环落到内部 40px `.nv-m-fab-act-btn` 圆钮；scrim `blur(2px)` 升到 `blur(6px)`。
9. **`MobileToast`**：`backdrop-filter: blur(4px)` + `oklch 0.21/0.92` 与弹层玻璃契约（16-20px blur + 半透明）不符。修法：blur 提到 18px，alpha 调到 0.78。
10. **`NumberKeyboard` surface**：`data-slot='number-keyboard'` 不在 `overrides.css` 的移动 glass 选择器里，面板是 `bg-card` 不透明。修法：把 `[data-slot='number-keyboard']` 加进 `[data-slot='mobile-sheet-content']` 的同一 glass 规则（`blur(20px) saturate(1.7)` + `card 80%`）。

## 顶层 `.nv-focusable` 顶层 class 行为验证

- `theme.css` 的 `.nv-focusable` 规则确实是顶层（非 `@layer`/`@utility`）：`grep` 确认选择器在 `@layer` 块外。
- 实测：slider、switch、fab、stepper 等都正确渲染 `box-shadow: var(--nv-focus-ring)`。
- 唯一坑是 slider：之前 thumb 上同时挂了 Tailwind `shadow-[…]` utility（在 `utilities` 层，比 `nv-components` 层后胜出），把 `:focus-visible` 写的 `box-shadow` 顶掉。修法是把那条 focus 规则放到 scoped `<style>` 的 `@layer` 块之外（`MobileSlider.vue` 末段），让 scoped CSS 的未分层选择器胜过 utilities。

## 遗留不合格项

无。
