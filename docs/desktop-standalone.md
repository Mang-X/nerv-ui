# T02：独立桌面宿主与样式接入

本决策落实 [批准 spec #1](https://github.com/Mang-X/nerv-ui/issues/1) 的桌面阶段 [#3](https://github.com/Mang-X/nerv-ui/issues/3)。来源为 T01 固定提交；本票仅改变新库工程接入、测试责任与演示宿主，不需要回传 Nerv-IIP。公共组件名称、主桶与原版 shadcn 源码保持原样。

## 启动与验证

在仓库根执行（Node >=22.18，packageManager 固定 pnpm 11.22.0）：

```sh
pnpm -C frontend install --frozen-lockfile
pnpm -C frontend dev
pnpm -C frontend test
pnpm -C frontend --filter @nerv-iip/ui test:docs
pnpm -C frontend build
pnpm -C frontend --filter @nerv-iip/playground preview --port 4173 --strictPort
```

`build` 先对 UI 与 playground 执行 `vue-tsc`，再构建宿主。`test` 串行运行活动包：UI 行为/库内契约与 playground 行为/导入契约。`test:docs` 单独检查文档源码覆盖、命名与 VitePress 布局；通过不代表文档站独立运行。

T08/R14 的中性可搜索多选示例位于 `/#entity-multi-picker`：一侧展示宿主的旧逗号字段转换，另一侧展示宿主管理搜索结果与分页。公共数组合同、标签缓存时机和事件见[组件文档](../frontend/apps/design-system/docs/components/desktop/entity-multi-picker.md)，本票执行结果见[R14 记录](evidence/t08-r14/README.md)。

宿主为 `frontend/apps/playground`。它只用 `@nerv-iip/ui` 的 workspace 公共导出，没有源码 alias、旧仓库路径、业务 SDK 或后端。演示包括表单新增、表格搜索/排序/分页、详情 dialog、布局、明暗及强调色。数据只存在内存，刷新重置；主题遵循库已有 localStorage 行为。小型宿主不会替代完整文档站。

## 独立库决策：公开 CSS 接入边界

初始 `frontend/DESIGN/governance.md` 只允许 `file-preview` 和 `test-support` 两个子入口，宿主还必须知道库内相对路径。独立消费不能延续该路径约束。本票新增以下稳定 CSS 入口，原组件入口不变：

| 入口                         | 用途                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| `@nerv-iip/ui/styles.css`    | 普通 Tailwind v4 宿主：层序、Tailwind、动画、shadcn 工具、字体/token、覆盖样式和包内 `@source` 一次接入 |
| `@nerv-iip/ui/theme.css`     | 自行组织样式的宿主引用 token、字体、基础与动效；保留原文件自身分层                                      |
| `@nerv-iip/ui/overrides.css` | 自行决定覆盖层的宿主；内容仍故意不分层                                                                  |

推荐入口 CSS：

```css
@layer theme, nv-tokens, base, components, nv-components, utilities, nv-overrides, app;
@import '@nerv-iip/ui/styles.css';

@layer app {
  /* 宿主样式 */
}
```

入口 JS 的第一条 import 先加载该 CSS，再导入 Vue/组件；挂载前调用公共 `initTheme()`。宿主配置 `@tailwindcss/vite` 与 Vue 插件，沿用 workspace 固定依赖。`styles.css` 包内 `@source` 负责库 utility 收集，宿主无需指向任何旧树目录。字体由库依赖打包，无运行时 CDN。

定制宿主可以单独导入 `theme.css` 与 `overrides.css`，由自己的 Tailwind pipeline 收集库源码 utility；产品宿主须把后者导入 `layer(nv-overrides)`。VitePress 的未分层例外仍适用，完整接入由 #10 验证。不要同时导入聚合入口与分项入口。

这些是供构建工具处理的源码 CSS，不是预编译样式。T02 证明自身 workspace 源码分发能运行；打包产物中的 Tailwind 扫描、类型、资源与 Vue 身份仍由 #11 做仓库外安装实验，不提前认定其已通过。

`nvuiImportHygiene.ts` 同步只放行这三个精确 CSS 路径；私有 `src/styles/*` 和未知 CSS 路径仍判红。冻结 shadcn 原版零改动，未新增组件 API 或 token。

## 分阶段 workspace 与恢复责任

T02 建立的活动成员为 `packages/ui`、`apps/playground`。T04/N01 / #45 增加 `packages/ui-mobile`，根 TypeScript 配置同步包含移动源码；移动接入见 [独立移动接入](mobile-standalone.md)。旧 app/API 路径 alias 和生成任务仍已移除。

#300 撤除：`packages/scheduling` 与 `packages/app-shell` 整体移出本库（范围收敛为 desktop+screen+pad+mobile 四形态），`contract-consumers/`、`reference-tests` 中的排程参考测试与相关文档/演示一并移除。历史恢复责任表不再适用。

| 成员                 | 恢复责任                          |
| -------------------- | --------------------------------- |
| `apps/design-system` | #10：全部文档站解耦后恢复（已恢复）|

lockfile 按当前活动集合保留来源解析。初版 `621ca3d8` 虽然新增 resolved package keys 为 `[]`，却把保留的 `wrap-ansi@7.0.0` 两条边改到来源中已存在的较新版本；这不是纯裁剪，独立审核 F1 已拒绝集成。keys-only 比较不能证明无升级，原失败记录保留。

F1 修复恢复 `string-width@4.1.0`、`strip-ansi@6.0.0` 原边，以及它们需要的四个旧 package/snapshot。以 T01 integration `274d12ba` 的图、当前三个 importer 为根计算可达闭包：保留 **973 packages / 973 snapshots**，移除 **262** 个来源不可达节点；全部保留节点的 resolution、依赖/可选依赖、peer 上下文及其他字段无语义差异。另有五个 snapshot 仅新增 `optional:true` 分类标记，逐项列于证据，未改解析边。根/UI importer 不变，宿主仅新增公共 workspace 链接和来源 Vue 解析；本修复未新增 override，未重新 resolve。

干净 frozen 安装同时核对安装 lock 与提交 lock 全对象相等，并从实际文件解析验证恢复链。复现命令、RED/GREEN 和历史 F1 见 [F1 证据](evidence/t02/f1/README.md)。各候选 package.json 依赖版本未升级；恢复成员时从 T01/对应历史解析原锁定版本，不趁机升级依赖。

## 测试责任分离

- `packages/ui/src` 的可运行组件行为与公共导出、token、CSS 层、命名契约继续由新库负责；没有移除行为断言。
- FileUpload 测试仍通过宿主传入的 opaque purpose 检验真实回调参数、上传/取消/重试等行为；停止读取旧后端配置。`quality-evidence` 的后端注册校验转入原库消费方参考。
- `frontend/reference-tests/nerv-iip-consumers.test.ts` 保留旧应用的入口层序、覆盖 import、四消费者注册和后端 purpose 注册契约。需显式 `NERV_IIP_REFERENCE_ROOT` 指向原库；不纳入新库命令、类型检查或通过数。#12–#15 接入时回到原仓验证。本票不读取或启动旧后端。
- 文档源码契约独立走 `test:docs`；`docs-layout.contract.test.ts` 保存原 VitePress 布局断言。文档站启动/构建责任 #10，不能以静态契约绿色替代。
- `migration/t01`、`migration/reference`、`migration/materials` 的冻结来源不变，不要求后续活动源码重新满足“原样复制”provenance 检查。

T02 不覆盖触屏、移动、大屏、文件预览、排程和版本化包验收；后续票继续负责。实际运行证据见 [T02 验证记录](evidence/t02/README.md)。
