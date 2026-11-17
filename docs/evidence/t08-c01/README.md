# T08/C01 中性登录与改密实施候选

仅 #37、scope M，独立 draft PR 面向 `integration/nerv-ui-extraction`。不签整票；原应用接入已取消。本席没有自审、启动评审/子代理、浏览器/设备、ready、merge、close 或 watch。

## 固定对象

- checkout `/Users/mang/Project/nerv-ui-worktrees/t08-r08-status-hero`，branch `feat/t08-c01-neutral-login`；开工 clean，origin `https://github.com/Mang-X/nerv-ui.git`。
- 固定 base `cfd876db90e2f60471c42a85c721a86b963759c7`，tree `da33d2fecbf61ae6e44c803dff5f979810594f89`。
- 实现 head `90c5b56f0b9ddf4700bdfe830d37548b0da45cff`，tree `38db747654d3bf9a701b5d3508ba3c1d3e2087fb`。其后仅追加本证据归档 commit；最终 PR head/tree 与 clean、最小归档 SHA 回读由外部 handoff 固定，避免文档自包含 SHA 循环。
- 交付前已 fetch，integration 仍等于固定 base；无候选更新冲突。root、旧 Nerv-IIP、其它候选未写入；scheduling/P15 未修改。
- 外部持久证据 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-28/t08-c01-implementation-r1/handoff.md`。

## 来源与组合

完整 23 文件清单见 [sources.json](sources.json)，含原路径、target、blob、字节数和 SHA256；全部逐字节匹配 T01 provenance，未改原资产。固定来源 `79b1578f2b75f55709765b5e7882aaf33146c603`。来源清单覆盖四个完整 login 页面、两个完整 LoginForm、三个改密页面、auth/API/redirect wrappers、直接布局与 PDA 退出 consumer、screen real/mock store 和原插画。

四形态实际是 console/business-console/business-pda/screen。两类 PC、小屏品牌、PDA 安全区/输入/notice 与 R05 插槽的逐项处置见[决策](../../../frontend/DESIGN/components/login-recipe.md)；公开 props/events/slot、文档 live 源与导航见[组合文档](../../../frontend/apps/design-system/docs/components/desktop/login-recipe.md)。不新增库组件/导出/token，因此不伪造六件组件清单；只同步实际 recipe、文档、决策、覆盖矩阵和导航。

## Requirement | Evidence

以下测试通过公开 recipe props、input/form DOM 和宿主 callbacks 断言；不是 CSS 字符串、snapshot 或实现镜像。语义来自 #37 AC、用户实施约束及固定来源。

| Requirement | Evidence |
| --- | --- |
| PC 两种来源、受控草稿、trim 差异 | `keeps edits controlled and preserves PC trim versus PDA and screen raw credentials`；`keeps rejected controlled edits at the host value and accepts an external empty replacement` |
| PC 分栏/小屏品牌、PDA 四边安全区与表面差异 | LoginRecipe.vue 实际布局和既有 token；构建 PASS。真实宽窄/视觉仍 UNRUN，不能以 DOM 测试签该视觉 AC |
| PDA 输入属性/无 autofocus、Enter 声明、slot；大屏嵌入 R05 且唯一 form | `preserves input contracts and one screen form with usable slots and no autofocus`；真实 Enter/焦点 UNRUN |
| PDA failed/timed-out/空/缺 notice、readonly | `renders only known PDA exit notices and blocks readonly submission` |
| pending 禁重复、有效 receipt 才确认 | `blocks duplicate submits and only confirms an explicit accepted receipt`；`rejects malformed receipt case 0` 至 `rejects malformed receipt case 4` |
| 拒绝/throw/缺 callback 后可重试，不丢草稿、不显示技术原文 | `allows retry without losing drafts after reject and hides raw failures`；对应 `throw`、`decline`、`missing` 三个独立用例同样 PASS |
| 取消/卸载/形态/上下文/readonly/disabled/模式/草稿/callback 变更使旧 success/failure/finally 失效 | `invalidates late success failure and finally after surface`、`context`、`readonly`、`disabled`、`mode`、`modelValue`、`submit`、`cancel`、`unmount` 九例，每例分别测试旧 resolve 和 reject，旧 finally 不解锁新请求 |
| 改密三字段、显式空串、不内置非空/强度/一致策略 | `forwards all change fields without strength or equality policy and distinguishes empty values`；缺字段在类型上不合法，不自动补值 |
| 两个中性领域、fake 认证/redirect 仅明确确认、不建立会话/保存 | `requires fake host confirmation in both neutral domains and keeps redirects on this page` |
| 无 SDK/auth/store/router 私有依赖、复用公开组件/token | `src/nvui-imports.contract.test.ts` 96/96；新增源码仅 Vue、公开 UI/mobile 桶、类型与已有 SVG。无依赖/锁文件/库 primitive 变更 |
| 先 RED 后 GREEN、来源与执行边界 | 下列原始日志与 JSON；后续新增用例是 fresh GREEN，未逐例另做 RED，不冒称全部用例独立 RED |

## fresh 执行与原 FAIL

Node `v24.18.0`；所有 pnpm 调用都为 `node /Users/mang/.cache/node/corepack/v1/pnpm/11.22.0/bin/pnpm.cjs`（11.22.0）。未装包。以下 `pnpm` 为该精确 launcher 缩写，cwd 为本 checkout。

- `pnpm -C frontend --filter @nerv-iip/playground exec vp test run src/login/LoginRecipe.test.ts`：RED exit 1，16 failed / 1 passed / 1 unhandled error。原始 `red.log` 保留；空壳没有消费 promise，测试旧 reject 产生 `OLD SECRET` 测试哨兵错误，不是生产日志/密码。
- 第一轮实现 `green-01.log`：exit 1，6 failed / 11 passed。输入 value/required 转发暴露问题；保留该 FAIL。第二轮 `green-02.log`：17/17、exit 0。
- 最终 `pnpm -C frontend --filter @nerv-iip/playground exec vp test run src/login/LoginRecipe.test.ts src/login/LoginDemo.test.ts src/screen/ScreenLoginStage.test.ts --reporter=json --outputFile=<外部绝对路径>/final-tests.json`：exit 0，32/32（C01 25 + R05 7）；JSON success=true、failed=0、pending=0。runtime/unhandled 专用数字字段缺失，UNKNOWN，不填 0。
- `pnpm -C frontend --filter @nerv-iip/playground exec vp test run src/nvui-imports.contract.test.ts`：96/96、exit 0。
- `pnpm -C frontend --filter @nerv-iip/playground typecheck`：exit 0。
- `pnpm -C frontend --filter @nerv-iip/playground build`：exit 0；vendor pure annotation 提示保留，不代表 vendor 验收。
- scoped `exec vp lint` / `exec vp fmt --check`：exit 0；10 个变更前端文件格式检查，无全局 fmt。Markdown 相对链接第一次在证据 README 尚未生成时失败，生成后重新检查；记录该准备失败。
- 所有测试有 jsdom CSS parse 提示，原样保留；不是浏览器渲染证据。

没有继承 PASS 被记为 fresh。历史 globalfmt/docsalias/timeout/rawFAIL 不修复、不复跑、不抹除；它们是历史事实，不是本轮 fresh 结果。policy skip、vendor lane、零执行均不算 PASS。

## 归档与未运行

仓内最小原始证据置于本目录；外部保留全部尝试日志。`archive-sha256.json` 记录最小文件集，commit 后通过 `git show HEAD:<path>` 读取原字节核对；完整回读结果在外部 handoff。

浏览器/宽窄视觉/真实键盘/辅助技术/真实设备、docs live、HTTP/真实认证、旧消费者、vendor、CI、packed/发布、生产全部 UNRUN。来源许可 UNKNOWN；不声称它们通过。父独立运行席继续验收视觉和真实交互，本席仅交付实施候选，不发验收评论。
