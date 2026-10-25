# T05/A06 F1：显式空 slot 接管

仅修 #63 / [PR70](https://github.com/Mang-X/nerv-ui/pull/70) 独立 R1 的 F1（P2，new，owner `AlarmTable`）。原交付与历史 FAIL 见 [A06 原证据](../README.md)，本页增量不覆盖原记录。O1（P3）仅补 `alarm-table.md` / `screen-table.md` 的 `String(key)` 后唯一责任说明，没有 typed-key 算法变更。

## 对象与原因

- 工作树 `/Users/mang/Project/nerv-ui-worktrees/t05-a06-screen-tables`，分支 `feat/t05-a06-screen-tables`。
- integration base `f9ff36d2a9331328070dbb15e46c5c40e17aed13` / tree `8579125f8a6812fdab5843afee70cf26d2e288c5`。
- R1 受拒 head `877f8c787785203538c2ad9e9b9deff03f2d94a0` / tree `6ee463b4ae5bc4cae315d91ab148fd2fd86a4451`；原报告 `r1/review-receipt.md` 与 `slot-probe-exact.json` / 两份 DOM 已完整保留，未把 2 FAIL 改为 PASS。
- 反例是合法唯一 `wo: 'E1'` 的六字段行，`level: 'sev'`、`status: '已恢复'`。Vue 将 comment-only slot 判空并调用 `<slot>` 内 fallback，导致显式接管失效。现在按 `$slots` 中对应 slot 是否存在分支；fallback 在 `v-else`，没有输出真值判断、props/default/API 改动或新框架。
- 新 head/tree、最新 fetch/merge、公开 PR readback 在持久 `handoff.md` 与 `raw/final-pin.json`；本页随同源码提交，避免自引用 SHA。

## Requirement | Evidence

以下精确名称来自 `frontend/packages/ui/src/components/screen/ScreenTables.test.ts` 的公开主桶 mount；不使用 private vm。

| Requirement                                                   | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 显式 v-if false 与 comment slot 为空，不启用严重/已恢复旧呈现 | `Alarm explicit empty level and status slots suppress legacy rendering: <span v-if="false" />`；`Alarm explicit empty level and status slots suppress legacy rendering: <!-- intentionally empty -->`。`raw/public-red.json`：2 FAIL / 8 PASS；最小修复后 `public-green-initial.json`：10 PASS；最终 `public-green.json`：15 PASS。                                                                                                                      |
| 外部原断言不变                                                | `explicit v-if false state slot must not reactivate legacy Chinese status rendering`、`explicit v-if false level slot must not reactivate legacy severity rendering`、`unprovided slot continues legacy status fallback`。`external-red.json`：2 FAIL / 1 PASS → `external-green.json`：3 PASS。probe 仅重定位 root/DOM 输出路径；断言及测试输入与 R1 原文相同。                                                                                         |
| 条件内容 true→false→true，含 row/value identity               | `Alarm conditional slot content stays host owned through true false true`，两个单元格三态逐一断言，始终无旧 class。                                                                                                                                                                                                                                                                                                                                      |
| 合法 0 / 空文本                                               | `Alarm explicit slot text preserves value 0`、`Alarm explicit slot text preserves value ""`，分别断言 level/status 文本与无旧 class。                                                                                                                                                                                                                                                                                                                    |
| undefined / 未提供仍兼容                                      | `Alarm undefined slots retain legacy fallback`；原 `legacy Alarm defaults remain six columns five rows and restored state while more is plain text`、`Alarm accepts existing named six field row interfaces without requiring an index signature`，随新 UI 和 vue-tsc fresh 通过。                                                                                                                                                                       |
| slot 动态添加/移除遵循 Vue 语义                               | `Alarm dynamically added and removed slots switch between empty host output and legacy fallback`：false→true→false→true，两个单元格及 class 对照。slot 内 v-if 与 template 上 v-if 分开验证。                                                                                                                                                                                                                                                            |
| 原 labels/空值/重排/事件回调兼容                              | 原 `Alarm neutral headers level text and explicit state slot preserve distinct event identity across reorder replacement and empty`、`Alarm level and state slots own explicit tones regardless of Chinese words and update with input`、`Alarm explicit empty labels level text and status stay empty rather than falling back`、`Table preserves zero empty dash and cell callback identity through keyed reorder replacement and empty`；全部 fresh。 |
| 实际浏览器 F1 / default 对照                                  | `browser/01-f1.mjs`、`f1-states.json`：8 态，真实中性 consumer 使用主桶、旧中文状态输入；显式空、条件内容、0/空文本、slot 移除/添加、正常恢复；同时对照未提供 slot 与旧 5 行 default。`f1-initial.png` / `f1-empty.png` / `f1-zero.png` 已查看。scratch 是公开 consumer，不是完整 docs #10。                                                                                                                                                             |
| 新 production 页回归                                          | `browser/03-production-matrix.mjs` / `viewport-matrix.json`：1920×1080、1366×768、960×621 fit0.5；真实双向 wheel、键盘 Enter 分页/焦点、首末 rows/range、事件一次、opaque sticky。`05-production-events.mjs` / `production-events.json`：同 REF-7 两 ID、显式状态色与默认 levelLabels、重排/替换/恢复、unknown/empty/恢复/刷新。                                                                                                                         |
| 新 dist 资源身份                                              | `browser/04-resources.mjs` / `final-dist-resources.json`：实际请求 HTML 427B、JS 620818B、CSS 293269B、Inter Latin woff2 48256B，4 份 200 响应体逐字节/SHA256 等于本轮 dist；未请求 MiSans 不认证。                                                                                                                                                                                                                                                      |
| 全部本地门禁                                                  | `gates.mjs` / `raw/validation.json`：UI **759**、mobile **144**、host **119**、静态 docs-source **6+2**；所有 exit0 / success=true、failed/pending/todo/suite/assertion 无失败，日志无 unhandled 标记。runner 的 numUnhandledErrors 字段缺席，不冒称字段0。`raw/build.exit.json` exit0，含三个活动包 vue-tsc 与 production build。                                                                                                                       |
| 维护与依赖                                                    | `audit.mjs` / `raw/audit.json`：维护范围精确文件、fmt/lint/diffcheck；16 份完整依赖输入与 base 逐字节相同，实际 Vue realpath 唯一；冻结、导出、tokens/globalCSS 不变，未重装。                                                                                                                                                                                                                                                                           |

## 可重放命令

每个命令 cwd 固定为上述目标工作树。`run.mjs` 固定 cwd、task-local PATH shim，并分别保存 stdout/stderr 与 exit。pnpm 版本固定 corepack **11.22.0**。

```sh
PATH=/tmp/nerv-ui-t05-a06/bin:$PATH pnpm -C frontend --filter @nerv-iip/ui exec vp test run src/components/screen/ScreenTables.test.ts --reporter=json --outputFile=/tmp/nerv-ui-t05-a06-f1/handoff/raw/public-green.json
PATH=/tmp/nerv-ui-t05-a06/bin:$PATH pnpm -C frontend exec vp test run --config /private/tmp/nerv-ui-t05-a06-f1/handoff/probe/probe.config.mts --reporter=json --outputFile=/tmp/nerv-ui-t05-a06-f1/handoff/raw/external-green.json
node /tmp/nerv-ui-t05-a06-f1/handoff/gates.mjs
node /tmp/nerv-ui-t05-a06-f1/handoff/validate.mjs
node /tmp/nerv-ui-t05-a06-f1/handoff/audit.mjs
```

`gates.mjs` 串行运行 UI/mobile/host `test`、UI/mobile `test:docs`（各带 JSON reporter/outputFile）与 `pnpm -C frontend build`。重型席独占，不同时运行其它测试/构建。

## Fresh / inherited / FAIL / UNRUN

本轮 fresh 范围为上述测试、类型构建、维护、F1 公开 consumer、production 三视口与事件回归和新 4 份响应。原全浏览器 matrix 中未重跑的四外层主题/品牌、12 路由、低动效与原生125%继承于原 `t05-a06-final`：这些 owner/宿主源码及 CSS 未改，`raw/inherited-coverage.json` 列出相关文件字节边界。新 JS 与旧 JS 不同；旧截图/125%只作为前一 head 的历史证据，不能冒称本轮 fresh 或同 bundle。

原三件 4 FAIL / 4 PASS、旧具名 interface 类型 RED、R1 外部 2 FAIL / 1 PASS 均保留。历史 host-red 实际 PASS、missing-import 0tests、RAW2/冻结fmt1、CSS/PURE 警告均回到原 handoff/raw，不以新 PASS 抹除；原 R1 准备失败另保留于 `r1/`。本轮 CSS parser、PURE/chunk 警告仍保留于新原日志。维护首轮两文件格式 FAIL 保存在 `raw/fmt-first-fail.log`，修正后范围检查通过；最终格式化后的公开回归另为 `raw/public-final.json` 15 PASS。

本轮工具失败见 `tool-errors.md`：初次 about:blank URL 不被 T3 接受；临时 consumer 的 Vue 路径与 CSS 别名准备失败；修正 HTTP 页后同一步两次 snapshot 均原文 `Preview snapshot failed: Preview automation snapshot timed out after 15000ms.`，按约定切 ego-browser TaskSpace22。未创建新浏览器测试框架。

**UNRUN fresh**：原生125%、四外层主题/12路由/低动效完整矩阵、A05完整 browser matrix；**UNRUN**：CI、packed #11、完整 docs站 #10、物理设备、旧消费者/旧库接入、父 #6 组合验收、独立 R2。不合并 PR、不关闭 #63/#6/#1、不改变 PR18 ready、不监控。#64、T08 #40、PC #43/#51 与其它 owner 不扩。

## 保存与清理

临时目录 `/tmp/nerv-ui-t05-a06-f1/handoff/{raw,r1,probe,browser}`；持久副本 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t05-a06-f1`，包含最终 handoff、命令、JSON、DOM、截图与响应字节。过滤 `node_modules`、clean checkout、`.vite`、cache，仓库只提交本索引。自有浏览器/服务清理与 final clean readback 见持久 handoff；工作树保留待独立 R2。
