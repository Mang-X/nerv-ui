# T09-F16 实施记录

scope:S；#183，父 #10。仅向既有 data-table 页追加基础 Table 组合，学习代码与 live 共用 BaseTableExample.vue。真实主桶 TableCaption / TableFooter / TableEmpty 及三列表格结构，无 producer/API/锁/治理变更。

基线 `bf9b8067a6516d1d81a2c1ee28acdb06eb6fc5ee`，tree `f833858d3313ae8048a6b5f3e204d24c2688bf9f`；PR #182 MERGED，开工 clean。182 旧 Markdown 页保留；data-table 原文去除新增 import 后为原始完整字节前缀，原文 SHA256 `7930c5ddb6e9f04c67dcf25133df5ad9eb46419639816215d2386b23c17611e5`。旧 NvDataTable、工具栏、分页等原例不变，原 87 测试不削弱。

## Fresh 本地证据

固定前缀 `node /Users/mang/.cache/node/corepack/v1/pnpm/11.22.0/bin/pnpm.cjs`，docs cwd `frontend/apps/design-system`。

- `exec vitest run --config vitest.config.ts`：21 文件、88 测试 PASS，退出 0。
- 新增 `renders current totals, exact empty colspan and restores real zero quantities`：真实 DOM 三列表头、0/12.346/2、footer 14.346；清空后 caption 0 条、真实 TableEmpty 的 td colspan 等于表头数、footer 0；恢复三条且保留真实 0 和当前合计。滚动区域 tabindex=0 仅为 DOM 证据。
- `typecheck`、`build` PASS，退出 0；VitePress 链接检查随 build 完成。
- frontend 范围 `vp lint`、`vp fmt --check` PASS；根 Markdown 非空格式化后二次 cmp；旧页/原例字节保留与 `git diff --check` PASS。

## 原始记录及边界

外部最小 raw/source/SHA 回读：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f16-implementation-r1/handoff.md`；不复制 dist/deps。

保留测试未注册的准备 FAIL、错误 cwd 配置准备 FAIL，以及真实 RED（占位内容缺 TableCaption，1 FAIL）；最终 GREEN 不覆盖这些输出。CSS stylesheet 与 Rollup annotation 警告保留。历史并行 81/82 FAIL 原因 UNKNOWN，本轮不重述为 PASS。

browser / HTTP / 1440与390亮暗 / 真实鼠标和键盘 / 末列可达及页面无横溢：独立席 UNRUN，runtime 数字 UNKNOWN。CI 空非 PASS；packed/device/prod 独立 UNRUN；旧应用接入退出 NOT_PLANNED。仅中文 draft，不自审/runtime签署/ready/merge/close/watch，不启动后继，不改父票。

## R1 焦点接缝收尾

R1 真实窄屏发现外层 region 可聚焦但内层 Table 容器实际滚动，原方向键路径失效。仅将 role/名称/tabindex 移到 Table 的根滚动容器，移除外层独立聚焦点；基础 Table 源码不改。

`renders current totals, exact empty colspan and restores real zero quantities` 补断言有名可聚焦区域就是 table-container，且仅一个显式 Tab 入口；旧实现 1 FAIL，修改后完整 docs 88/88 PASS。该 DOM 断言不证明实际键盘滚动，新 dist 留独立复验。历史 FAIL/UNKNOWN 保留。原始日志见 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f16-scroll-focus-fix/`。
