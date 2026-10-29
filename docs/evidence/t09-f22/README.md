# T09/F22 基础 Dialog 实施候选

范围：#197，父 #10；单一同族文档 PR，仅 draft。基线 PR196 已 MERGED：`a4a86d53554e76fa480ad8736d6dbc7d357709bf`，tree `bfbc8ae8944c0dcd3b75777694ee2902b57817e0`。末次 fetch integration 未漂移。

现有 [dialog 页](../../../frontend/apps/design-system/docs/components/desktop/dialog.md) 追加一个同源 SFC 的固定 Content 与 ScrollContent 两个代表例。Content 内部原版 Overlay 覆盖，不叠加重复遮罩；页脚 Close 为原版合同。未改基础库、API、锁、治理、registry 或 Sidebar。

## 本地证据

固定命令前缀：`node /Users/mang/.cache/node/corepack/v1/pnpm/11.22.0/bin/pnpm.cjs`。

| Requirement | Evidence |
| --- | --- |
| fixed 内层 attrs、as/as-child 语义、说明链接、单 Overlay、隐藏默认关闭钮、Footer Close 关闭/重开/Esc 回焦 | `AC fixed: inner attrs, title description nodes, close reopen and synthetic Escape focus` |
| scroll 内层 attrs、标题描述节点及链接、24段末端与页脚顺序、关闭/重开/Esc 回焦 | `AC scroll: inner attrs, title description nodes, close reopen and synthetic Escape focus` |

局部 RED：空模板两项行为失败 → 真实公开组件 GREEN 2/2。首次脚本在错误 cwd 导致 FileNotFoundError；随后缺少 SFC 的准备运行无测试可执行，均不充当行为 RED。外部记录保留准备失败和 RED。

在 `frontend/apps/design-system` 执行 `exec vitest run --config vitest.config.ts`：27 文件、99/99，通过，原97未削弱。`frontend` 执行 `docs:typecheck`、`docs:build`：退出0。`exec vp lint` 对新测试、vitest 配置和 SFC；`exec vp fmt --check` 对三者与 dialog.md：退出0。`git diff --check` 通过。Markdown 原183页非空二次比较，182页字节不变，dialog 原内容仅加 import 与尾部追加；build 站内链接检查通过。同源源码 include 与 live 引用同一 SFC。

jsdom `Could not parse CSS stylesheet` 与 build Rollup `#__PURE__` 注释警告保留；不影响本次命令退出0。历史81/82 FAIL 保留为历史，未复现也不改写；历史缺 runtime 数字为 UNKNOWN。

## 独立验收边界

browser/HTTP、1440/390 亮暗、真实鼠标 Tab/Enter/Esc、实际滚动至末端、遮罩/OS 原生滚动条保护全部 UNRUN，由独立席按 AC 裁决。合成 Esc/焦点和 DOM 文本顺序不等于实际布局或滚动实测；本轮没有 runtime 签署、自审、ready、merge、close、watch 或父票更新。CI 空不算 PASS；packed/device/production 独立 UNRUN。旧应用接入退出 NOT_PLANNED。

外部原始日志、SHA/source 回读与交接：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f22-implementation-r1/`；无 dist/deps 入库。
