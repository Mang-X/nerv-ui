# T09/F23 原版 Sidebar 实施候选

#199 / 父 #10，scope:M，一个中文 draft PR，仅文档宿主组合。基线 `4a0f630b9532d2d97746f0b154bba9848fb13c23` / tree `14e3196b1d9606e829c30445fb7721988559419e`，PR198 MERGED；开工 clean。

现有 sidebar 页追加主桶原版 Sidebar 的同源 live/学习源码。一个 Provider、none 固定、桌面 icon、移动 Sheet；当前菜单共用状态。slot 的公开 SidebarTrigger 提供移动关闭，aria-label fallthrough 通过 DOM 验证。openMobile 是 context，未捏造根 prop。原版英文默认标签不改；Nv 中文关闭属于增强。transform 有界容器沿用本页先例，不改冻结组件/API/锁/治理/registry。

## 本地证据

命令前缀 `node /Users/mang/.cache/node/corepack/v1/pnpm/11.22.0/bin/pnpm.cjs`。

| Requirement | Evidence |
| --- | --- |
| none 与桌面 icon 折叠/展开、当前菜单 | `base Sidebar desktop icon and none preserve current menu` |
| 模拟移动 Sheet、slot 关闭/重开/Esc、当前菜单 | `base Sidebar mobile Sheet and none preserve current menu` |

局部 RED 空模板：2 FAIL / 原 F18 1 PASS；实现后3/3 PASS。完整 docs cwd `frontend/apps/design-system`，`exec vitest run --config vitest.config.ts`：27文件101/101，原99断言保留。同 cwd `typecheck`、`build` 退出0；frontend cwd `exec vp lint` 与 `exec vp fmt --check` scoped SFC/test/Markdown，diffcheck。媒体查询仅 matchMedia 模拟，不是实际 resize/CSS/视觉/回焦实测。

183旧页名称保留，182页字节不变；sidebar 原内容仅 import/追加及格式器删除 F18 前一个空行。旧 Nv/F18 示例原内容和原测试保留，同源 include 解析由完整 build 验证。非空 Markdown 二次比较和 source SHA256 回读见外部证据。

保留准备失败：首次以 docs cwd 使用 repo-relative 路径，两个写入失败，随后运行旧1项不算 RED；后续 Python 同类 FileNotFoundError。Markdown 初次 fmt FAIL，格式化后复验。jsdom CSS parse、Rollup 注释/chunk 警告均保留。历史81/82 FAIL 未重验/不抹除，缺 runtime 数字 UNKNOWN。

browser/HTTP、1440/390亮暗、鼠标/Tab/Enter、真实 resize、回焦和 document 横溢全部 UNRUN，留父独立席。无自审/runtime签署/ready/merge/close/watch/后继/父票修改。CI 空非 PASS；packed/device/production 独立 UNRUN；旧应用接入退出 NOT_PLANNED。

外部 raw/source/SHA 回读与 handoff：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f23-implementation-r1/`。无 dist/deps 入库。
