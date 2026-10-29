# T09-F15 实施记录

scope:S；#181，父 #10。仅文档宿主，基础 Popover / Trigger / Content / Header / Title / Description 均从公开主桶组合；后三件此前没有站内 render。新增 desktop/popover.md、固定导航、同源学习源码与行为测试，不改基础/API/锁/治理。

基线 `614f41992ddd5c3ae29ad65b6cb00d4168d086e2`，tree `176ce1819befe01ad439e390bed1d97d5657bfb2`；PR #180 已合并，开工 checkout clean。181 旧 Markdown 页和全部既有 docs 源码逐字节保留，config.mts 仅追加导航；原 86 测试不变。

## Fresh 本地门禁

固定命令前缀 `node /Users/mang/.cache/node/corepack/v1/pnpm/11.22.0/bin/pnpm.cjs`；docs cwd `frontend/apps/design-system`。

- `exec vitest run --config vitest.config.ts`：20 文件、87 测试 PASS，退出 0。新增 `opens the public portal structure, closes and reopens, then returns focus on unit Escape`，断言真实主桶 portal DOM、标题/描述、默认触发入口命名、关闭反馈、再开、模拟 Esc 后关闭与回焦；未 stub overlay。jsdom 键盘不等于浏览器键盘。
- `run typecheck`、`run build` PASS，退出 0；VitePress 既有链接检查完成。
- frontend cwd 范围 `vp lint`、`vp fmt --check` PASS；旧页/原例字节保留及 `git diff --check` PASS。根 Markdown 使用非空格式化输出后二次 cmp。

## 原始记录与边界

外部最小 raw/source/SHA 回读入口：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f15-implementation-r1/handoff.md`，不复制 dist/deps。

保留缺 Example 的原始 RED、错误 cwd 的 ENOENT 准备 FAIL、无效 aria-labelledby 预期失败及完整套件 86 PASS / 1 FAIL。Reka 当前默认命名关联触发入口，宿主遵循原合同，没有覆盖库机制。最终 PASS 不抹除这些记录；CSS stylesheet 和 Rollup annotation 警告保留。历史并行 81/82 FAIL 原因 UNKNOWN，不以本轮结果覆盖。

browser / HTTP / 1440与390亮暗 / 真实鼠标与 Tab、Enter、Esc 焦点：UNRUN，待父独立验收；runtime 数字 UNKNOWN。CI 空非 PASS；packed/device/prod 独立且 UNRUN。旧应用接入退出 NOT_PLANNED。仅中文 draft，不自审/runtime签署/ready/merge/close/watch，不启动后继、不修改父票。
