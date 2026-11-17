# T09-G 移动 / 触屏 / 大屏 文档覆盖核对

只读核对，2026-11-17，分支 `integration/nerv-ui-extraction`（HEAD `05b2e1a`）。
判据（与 F 一致）：「公开导出组件/能力在 `frontend/apps/design-system/docs/components/{mobile,touch,screen}/` 是否有一个有效示例页」——页面存在且含 live 示例（`<MobileDoc>`/`<Demo>`/`<ScreenDemo>` 包裹的真实组件渲染或 playground 深链宿主）或代码示例，不计 grep 命中、不计空壳索引页。

## 1. 组件清单（公开导出）

| 形态 | 来源 | 公开导出数 | 口径 |
| --- | --- | --- | --- |
| mobile | `packages/ui-mobile/src/index.ts`（`package.json` exports `.`） | 48 个 `Nv*` 组件 + `cn` + `MOBILE_OVERLAY_TARGET` + 类型导出 | `default as Nv*` 计 50 行，其中 `NvSwiper`/`NvSwiperItem`、`NvMobileDropdownMenu`/`NvMobileDropdownMenuItem`、`NvCell`/`NvCellGroup`、`NvMobileRadioGroup`/`NvMobileRadioItem` 为同页成对组件 |
| touch | `packages/ui/src/components/touch/index.ts`（经 `@nerv-iip/ui` 主桶 `export *`） | 5 个组件 | `NvTouchButton`、`NvStatTile`、`NvQtyStepper`、`NvTouchSegmented`、`NvStationBar` |
| screen | `packages/ui/src/components/screen/index.ts`（同上） | 46 个 `Nv*` 组件 + `scale.ts`（`computeScale`/`ScaleMode`/`Scale`）+ `useScreenData` | 48 行导出语句全部映射到页 |

补充公开能力：`@nerv-iip/ui-mobile/styles/mobile.css` 导出 5 个安全区/触控工具类（`pt-safe`、`pb-safe`、`px-safe`、`min-h-touch`、`min-h-row`），属 package.json `exports` 的公开入口。

## 2. 文档页清单

- `docs/components/mobile/`：**48 页**（含 `index.md`、`gallery.md`、`flow-recipe.md` 三个结构/recipe 页）
- `docs/components/touch/`：**6 页**（5 组件页 + `index.md`）
- `docs/components/screen/`：**48 页**（含 `index.md`、`gallery.md`、`dashboard-recipes.md`、`decorative-backgrounds.md`、`detail-parameter.md` 组合/归类页）

## 3. 逐形态核对

### mobile（48 公开导出 → 45 个组件页 + 3 结构页）

| 分类 | 导出 | 页 | 有效性 |
| --- | --- | --- | --- |
| 已覆盖 | 47 / 48 组件 | 45 页一一对应（成对组件同页） | 每页均含 `<MobileDoc><template #phone>` live 示例 + ```vue 代码段（实测 grep ≥3 标记/页） |
| 确认缺口 | `NvMobileErrorRetry` | 无独立页，无 live 示例 | 见下 |
| 未决 | — | — | — |

`NvMobileErrorRetry` 是 mobile 唯一无专属示例页的公开导出。它出现在 `task-list-shell.md` 的 live demo 内部（`MobileTaskListShell` 组合件在 `errorMessage` 分支渲染它），且该 demo 有"让下次加载暂缓"按钮触发失败路径——所以它在组合内**可被演示**，但按「每个公开导出组件有有效示例页」口径没有一个以它为主体的示例页（无 API 表、无 props 说明、无独立触发入口）。DESIGN 决策文档（`DESIGN/components/mobile-task-list-shell.md`、`component-coverage.md`）有它的名字，故 contract test 通过；这不等于文档站覆盖。

mobile 形态特别核对：
- **扫码输入**：`scan-bar.md` 有 `NvScanBar` live 示例（扫码枪回车触发 `scan` 事件）；`number-keyboard.md` 有 `NvNumberKeyboard` 页。已覆盖。
- **移动密度 / 触控**：`button.md`、`checkbox.md`、`input.md`、`slider.md`、`stepper.md`、`switch.md`、`tag.md` 等页均写明 44px 触控目标与移动密度取值；`foundations/tokens.md` 有四场景触控尺寸矩阵。已覆盖。
- **安全区工具类**（`mobile.css` 公开入口的 `pt-safe`/`pb-safe`/`px-safe`/`min-h-touch`/`min-h-row`）：仅在 `swipe-cell.md` 示例代码里出现 `min-h-touch` 一次，五个工具类作为公开导出**没有以它们为主体的示例页/说明页**（`app-shell-mobile.md` 只在表格里提"避让安全区"）。归类**未决**——它们是 CSS 能力不是组件，是否要求独立示例页取决于 G 的口径。

### touch（5 公开导出 → 5 组件页 + index）

| 分类 | 导出 | 页 | 有效性 |
| --- | --- | --- | --- |
| 已覆盖 | 5 / 5 | `touch-button.md`、`touch-segmented.md`、`qty-stepper.md`、`stat-tile.md`、`station-bar.md` | 每页 `<Demo>` live 示例 + ```vue 代码段；另有 `board.md` 工位看板完整示例组合全部 5 件 |
| 确认缺口 | — | — | — |
| 未决 | — | — | — |

### screen（46 组件 + `scale` + `useScreenData` → 46 页覆盖）

| 分类 | 导出 | 页 | 有效性 |
| --- | --- | --- | --- |
| 已覆盖 | 46 / 46 组件 + 2 能力 | 46 页一一对应（`NvScreenFlowLinesBg`/`NvScreenIsometricBlocksBg` 合并入 `decorative-backgrounds.md`；`NvScreenDetailDialog`/`NvScreenParameter` 合并入 `detail-parameter.md`；`scale` 入 `screen-scaler.md`；`useScreenData` 入 `use-screen-data.md`） | 每页 `<ScreenDemo>` live 示例或 playground `/#screen/*` 深链 + 代码段 |
| 确认缺口 | — | — | — |
| 未决 | — | — | — |

screen 形态特别核对：
- **缩放**：`screen-scaler.md` 覆盖 `NvScreenScaler` + `computeScale`/`ScaleMode`，写明 fit/width/stretch 与 `/#screen`、`/#screen/stage` 独立入口。已覆盖。
- **图表**：`trend-chart.md`、`screen-bar-chart.md`、`screen-donut.md`、`screen-pareto.md`、`sparkline.md`、`ring-gauge.md`、`takt-gantt.md`、`heatmap.md`、`oee-hero.md` 均有 live `<ScreenDemo>`。已覆盖。
- **展示组件**：`digital-flop.md`、`status-wall.md`、`summary-card.md`、`stage-flow.md`、`alarm-table.md`、`screen-table.md` 等全部有 live 示例。已覆盖。

## 4. 附注（非缺口，但记录在案）

- screen 侧栏 nav（`config.mts` `/components/screen`）缺 `decorative-backgrounds`、`gallery`、`screen-freshness` 三条链接；三页均有页间入链（index→decorative-backgrounds、overview→gallery、use-screen-data→screen-freshness）与 live 示例，属**可发现性瑕疵**不是覆盖缺口。
- `mobile/gallery.md`、`screen/gallery.md`、`touch/index.md`、`mobile/index.md`、`screen/index.md` 为结构/总览页，不承载组件示例，不计缺口。
- `MOBILE_OVERLAY_TARGET`、`cn` 及全部 `type` 导出按 NvUI 命名规约不要求文档页（`nvui-doc-coverage.contract.test.ts` 只强制 `Nv*` 根组件）。
- 多数 screen 页注明"本轮文档站运行 UNRUN / live 源码仅表示文档接线"——这是页面作者的运行证据声明，不影响"页面存在且含 live 示例"的覆盖判定；真实浏览器验收属 F/T09 上层验收接缝，不在本核对范围。

## 5. 子票切片建议（对「确认缺口」）

只有 mobile 有 1 个确认缺口 + 1 个待口径裁决的未决项，合计建议 **≤2 张子票**：

| # | 内容 | scope | 一句话验收 |
| --- | --- | --- | --- |
| G1 | 为 `NvMobileErrorRetry` 补 `mobile/error-retry.md` 示例页（live 失败/重试两态 + props/emit 表 + 侧栏 nav 入链） | S | 页面含 `<MobileDoc>` live 示例，可直接触发 `retry` 事件且 `pending` 态可见 |
| G2（条件票，待口径裁决） | 若 G 口径认定 `mobile.css` 安全区/触控工具类是"公开能力"，补一页或在 `foundations/tokens.md`/mobile index 增"安全区与触控工具类"小节，示例化 `pt-safe`/`pb-safe`/`px-safe`/`min-h-touch`/`min-h-row` | S | 五个工具类各有一个可见效果示例或明确写出宿主用法 |

不建议把 G2 与 G1 合并：G1 是组件页补齐（有现成样板可套），G2 是 CSS 能力文档化（无现成样板，先需裁决是否算组件等价物）。

screen 侧栏三条漏链可作为零成本顺手项并入任一实施票，不单独建票。

## 6. 计数汇总

| 形态 | 已覆盖 | 确认缺口 | 未决 |
| --- | --- | --- | --- |
| mobile | 47 / 48 组件（+ 扫码、密度、触控特别项已覆盖） | 1（`NvMobileErrorRetry`） | 1（`mobile.css` 安全区/触控工具类 5 个，口径未定） |
| touch | 5 / 5 | 0 | 0 |
| screen | 46 / 46 组件 + `scale` + `useScreenData` | 0 | 0 |

建议子票数：**1 张必建（G1）+ 1 张条件建（G2）**。
