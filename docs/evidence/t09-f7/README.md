# T09/F7 Card 头部操作区实施证据

#165 / 父 #10，scope S，一个 integration draft PR。仅 docs consumer、局部测试与证据；不改 producer、全站 theme/Demo、业务 SDK、后端、依赖锁或 vendor。旧四应用接入与退出 NOT_PLANNED，其它 F/G/H 另验。

基线 head `8815f4324c56319271b3d034c999aa4b86a3a077`，tree `00b42e5ba2c16e4c7baf64d4b1824fdb557d2eb3`。fetch 实际 `integration/nerv-ui-extraction` 并正常 merge，Already up to date；未 reset/rebase。首次误用简写 integration 的 fetch/merge FAIL 保留在外部报告。

| AC                                             | 证据与边界                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 品牌 Action 与现 Header/Title/Description 组合 | `frontend/apps/design-system/card-structure-host.test.ts`：`renders the branded header action and keeps header and footer receipts independent`，真实 public NvCardAction render，原生 button click 更新固定本页提示，保留独立页脚确认；无 generic div aria-label                                          |
| 原合同                                         | 原 73 条不删改，新增 1 条；完整局部 13 文件 74/74                                                                                                                                                                                                                                                          |
| public source                                  | `packages/ui/src/index.ts` → `components/pc/card/index.ts` → NvCardAction/Header/Title/Description；均 class + default slot。品牌 Action 输出 nv-card-action，基础 Action 输出 card-action，Header 自动选择器匹配后者；consumer 显式 class 协同 grid，窄屏按钮另行、文字列 minmax(0,1fr)，无 producer 修改 |
| live 与学习源码                                | 原 Card 页保留所有示例，学习代码同步同一 consumer；原页脚动作保留。NvButton 默认原生 button，真实 Tab/Enter 留 browser                                                                                                                                                                                     |
| 门禁                                           | 完整 docs types/build、scoped lint/fmt、Markdown 非空二次 bytecmp、links/178 页保留与 diffcheck 的 raw 见外部交接                                                                                                                                                                                          |
| 独立验收                                       | 最终 dist/HTTP 1440/390 亮暗、真实字体/几何/Tab/Enter UNRUN；runtime unhandled 数字 UNKNOWN；CI/packed/device/production UNRUN，授权 UNKNOWN；vendor policy skip，0 执行，非 PASS                                                                                                                          |

RED：原例未 render NvCardAction，新增测试 1 FAIL、原测试 1 PASS；实现后 GREEN。保留 jsdom CSS parse、Rollup annotation 警告及历史 global fmt RAW2/TZ timeout/准备 RED，不以新 PASS 覆盖。未启动委派、review/runtime/merger、ready/merge/close/watch。

外部最小 source patch、raw、固定 SHA/tree、PR 正文 GET UTF-8 bytecmp 和 SHA-256 回读清单：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f7-implementation-r1/`，不包含 dist/deps。
