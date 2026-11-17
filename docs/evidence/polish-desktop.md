# 桌面组件逐状态视觉打磨验收（issue #335 波1：pc + blocks）

日期：2026-11-17 · 仓库：Mang-X/nerv-ui @ main · 方式：dev server `http://localhost:5180`（VitePress，design-system app；`@nerv-iip/ui` alias → `packages/ui/src`，源码实时生效），preview_evaluate 实测 computed style + focus/hover 态。

## 契约标尺

- **聚焦环**：`.nv-focusable`（`frontend/packages/ui/src/styles/theme.css:476-497`，顶层 class）→ `--nv-focus-ring` = `0 0 0 1px var(--nv-brand), 0 0 0 4px brand@18%`；focus 时 `border-color → --nv-brand`；`[data-invalid]/[aria-invalid]` → `--nv-focus-ring-destructive`（1px destructive + 4px destructive@18%）。环随元素 border-radius 走（box-shadow 天然跟随形状）。
- **弹层玻璃**：`overrides.css` 白名单 → `blur(16px) saturate(1.6)` + `color-mix(popover 76%)` 半透明（dialog/sheet 系 `card 82%`；tooltip 反相 `foreground 84% + blur(10px)`）。
- **动画**：弹层 `animate-in/out fade zoom` + `duration-(--nv-duration-*)`；`ui/` 系用 `nv-overlay-content` keyframes（`--nv-duration-fast-invoke`/`fade`）。

## 修复清单（不合格 → 已修）

非输入件家族此前保留 shadcn 风格 `focus-visible:ring-*`（PR #317 波1 明确延后，#335 收口）或完全无聚焦态。统一改挂 `.nv-focusable`，由契约下发 `1px brand + 4px brand@18%` 环；菜单键盘导航高亮模式（`focus:bg-accent`，reka activedescendant）保持不变。

| 组件 | 缺陷 | 修法 | 实测 |
| --- | --- | --- | --- |
| NvButton | `ring-[3px] ring-ring/45`（3px 灰/品牌 45% 单圈，非契约 1px+4px）；destructive 变体 `ring-destructive/35` | root 挂 `nv-focusable`，删 ring 工具类 | 亮 `oklch(0.54) 1px+4px/18%`，暗 `oklch(0.64)`，6px 圆角随形状 ✔ |
| NvCheckbox | `ring-[3px] ring-brand/30 + border-brand` | 挂 `nv-focusable` | 契约环 on 5px box ✔ |
| NvRadioGroupItem | 同 checkbox | 挂 `nv-focusable` | 契约环 on 圆形（br=full）✔ |
| NvSwitch | `ring-[3px] ring-brand/30` | root（pill 本体）挂 `nv-focusable` | 契约环 on pill（rounded-full）✔ checked=brand / unchecked=浅 / disabled 不可聚焦 ✔ |
| NvSlider thumb | `ring-[3px] ring-brand/30` | thumb 挂 `nv-focusable` | 契约环 on 圆形 thumb ✔ |
| NvTabsTrigger | `ring-2 ring-ring/50` | 挂 `nv-focusable` | 契约环 on 6px ✔ |
| NvTree item | `ring-2 ring-ring` | 挂 `nv-focusable` | 契约环 on 6px ✔ |
| NvNavigationMenuTrigger/Link | `ring-2 ring-ring/50` | 挂 `nv-focusable` | 契约环 on 8px ✔ |
| NvDialogContent/NvSheetContent 关闭钮 | `ring-2 ring-ring/50` | 挂 `nv-focusable` | 源码对齐，同 ring 实测族 ✔ |
| NvNotificationInbox 条目链接 | `ring-2 ring-ring` | 挂 `nv-focusable` + `rounded-sm` | 源码对齐 ✔ |
| NvActionSummary 出口钮 | `ring-2 ring-inset ring-ring` | 挂 `nv-focusable`（NvCard 无 overflow-hidden，外环不裁切） | 实测契约环 ✔ |
| NvPagination btn/num/gap/jump | scoped `0 0 0 3px ring45%` + jump `border-brand` | 挂 `nv-focusable`，删 scoped :focus-visible 死码 | data-table 页实测契约环 ✔ |
| NvDataTable sort/列设置/筛选 chip/opt/重置 | `nv-dt-sort:focus-visible 3px ring45%`；opt/chip/重置无聚焦态 | 全部挂 `nv-focusable`，删 scoped 死码 | seg/sort 实测契约环 ✔ |
| NvMetricFacetsPart / NvMetricAlertPart | `outline: 2px solid brand`（矩形 outline 不随形状） | 挂 `nv-focusable`，删 scoped outline | 源码对齐 ✔ |
| NvLineChart marker | `outline: 2px solid --ring` | 挂 `nv-focusable`，删 scoped outline | 源码对齐 ✔ |
| NvCarousel 箭头 | `0 0 0 3px ring50%` + drop shadow | 挂 `nv-focusable`，删 scoped ring（保留 hover 淡入） | 源码对齐 ✔ |
| NvDatePicker 月份导航/日格 | 完全无聚焦态 | 挂 `nv-focusable` | 弹层实测 cell/nav 契约环 ✔ |
| NvDateRangePicker 月份导航/日格 | 同上 | 挂 `nv-focusable` | 源码对齐 ✔ |
| NvTimePicker 时/分格 | 完全无聚焦态 | `nv-tp-cell` 挂 `nv-focusable` | 实测 cell 契约环 ✔ |
| NvCombobox 选项钮 | `outline-none` 无聚焦态 | 挂 `nv-focusable` | 实测 option 契约环 ✔ |
| NvSearchSelect 选项钮 | 同上 | 挂 `nv-focusable` | 源码对齐 ✔ |
| NvNotifierHost 关闭钮 | 无聚焦态 | 挂 `nv-focusable` | 源码对齐 ✔ |
| NvFilterBar chip 移除钮 | 无聚焦态 | 挂 `nv-focusable` | 源码对齐 ✔ |
| NvSidebarBrand / NvSidebarTrigger | 无聚焦态 / ui/button `ring-3 ring-ring/50` | 挂 `nv-focusable` | 源码对齐 ✔ |
| blocks NvGroupPanel 折叠头 | `ring-2 ring-ring/50` | 挂 `nv-focusable` | 源码对齐 ✔ |
| blocks ThemePicker 色板 + 重置钮 | `focus-visible:ring-2 ring-ring`；色板保留 `ring-2` 选中态 | 挂 `nv-focusable`；色板选中 `ring-2 ring-ring` 非聚焦，保留 | 源码对齐 ✔ |
| blocks ThemeToggle | ui/button `ring-3 ring-ring/50` | 挂 `nv-focusable` | 源码对齐 ✔ |
| blocks PageHeader 面包屑链接 | 无聚焦态 | BreadcrumbLink class 挂 `nv-focusable` | 源码对齐 ✔ |
| blocks EntityPickerPanel 选项钮 | `outline-none` 无聚焦态 | 挂 `nv-focusable` | 源码对齐 ✔ |

## 弹层玻璃实测

| 弹层 | data-slot | blur | 半透明 | 动画 |
| --- | --- | --- | --- | --- |
| NvSelect | nv-select-content | `blur(16px) saturate(1.6)` ✔ | popover 76% ✔ | `enter` @ `--nv-duration-fast` ✔ |
| NvDialog | dialog/nv-dialog-content | `blur(16px) saturate(1.6)` ✔ | card 82% ✔ | zoom-in ✔ |
| NvDropdownMenu | dropdown-menu-content | `blur(16px) saturate(1.6)` ✔ | popover 76% ✔ | `nv-overlay-content-open` 187ms+83ms ✔ |
| NvDatePicker | nv-date-picker-content | `blur(16px) saturate(1.6)` ✔ | popover 76% ✔ | zoom-in ✔ |
| NvTimePicker | nv-date-picker-content | `blur(16px) saturate(1.6)` ✔ | popover 76% ✔ | zoom-in ✔ |
| NvCombobox | nv-combobox-content | `blur(16px) saturate(1.6)` ✔ | popover 76% ✔ | zoom-in ✔ |
| Tooltip | nv-tooltip-content | `blur(10px) saturate(1.4)`（反相配方）✔ | foreground 84% ✔ | — |

## 状态矩阵核验

- **default**：尺寸/颜色/对齐按组件 cva/类，实测高度 h-9/h-8/h-10、br 6px/5px/full 符合令牌。
- **聚焦**：全部可聚焦元素实测 `1px brand + 4px brand@18%`，环随元素 border-radius（矩形 6px/圆角 5px/圆形 full/pill full）。亮 `oklch(0.54 0.16 256)`、暗 `oklch(0.64 0.15 256)`，令牌随主题翻转 ✔。
- **hover**：`.nv-focusable` 自带 `box-shadow+border-color 150ms ease-out-quart` 过渡；组件 hover（bg/color/scale）与聚焦独立、无跳变。
- **active/checked**：switch/radio/checkbox 切换 data-state + bg-brand 正确；tabs `data-state=active`。
- **disabled**：`disabled:opacity-50`/`pointer-events-none`，不可聚焦、无环 ✔。
- **invalid**：`[data-invalid]`/`aria-invalid` 走 `--nv-focus-ring-destructive`（输入件族契约覆盖；此前盲审已证 input/select/combobox/date-picker invalid 环）。
- **弹层**：统一 `blur(16px) saturate(1.6)` + 半透明 + `animate-in fade zoom`/`nv-overlay-content`。
- **形态令牌**：desktop 用 `--nv-*`（非 `--nv-scr-*`）；聚焦/玻璃/动画走契约。

## 保留项（非缺陷）

- **菜单/选项键盘导航**（dropdown-menu item、select item、combobox/search-select/entity-picker option、command item）：reka `aria-activedescendant`/`data-active` 高亮模式，焦点驻留触发器/输入框 — 正确模式，非聚焦环缺失。
- **NvSidebarRail** `tabindex="-1"`：reka 侧栏轨道惯例，鼠标专用，不进 Tab 序 — 正确。
- **ui/ 冻原版**（`ui/dialog` `duration-100`、`ui/pagination`、`ui/button`）：shadcn 原版零改动约束；其弹层 glass 由 overrides `data-slot` 白名单兜底仍生效。
- **command/entity-picker 面板内输入框** `outline-none`：焦点驻留对话框 chrome，搜索域内 — 可接受。
- **`transition-colors`/`transition-transform` 工具类**：Tailwind 属性列表（默认 150ms 缓动），非时长/缓动 hardcode，保留。
- **scoped `0.15s/0.18s/0.2s/0.25s` 等微交互秒值**：组件调节值，与 mobile 先例一致（token 仅覆盖标准档）。

## 遗留/待观察

- **`ui/button` 冻原版**仍带 `focus-visible:ring-3 ring-ring/50`（旧 3px 环）：所有 pc/blocks 消费点（sidebar trigger/theme-picker/theme-toggle）已改挂 `nv-focusable` 覆盖；文档页若直接用原版 `Button` 仍出旧环 — 但桌面文档统一用 `NvButton`，不受响影。
- **NvDialog 演示页首 dialog** 走 `ui/dialog`（冻原版，`duration-100`）；`NvDialogContent` 版用 `duration-(--nv-duration-base)`。玻璃一致，动画时长 ui/ 不受契约（冻结）。
- **`NvPagination`**：独立文档页用 `ui/pagination` 原语；NvPagination 本体经 data-table 页实测契约环。
