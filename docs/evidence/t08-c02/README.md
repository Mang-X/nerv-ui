# T08/C02 实施矩阵

唯一 checkout `/Users/mang/Project/nerv-ui-worktrees/t08-r16-action-summary`，branch `feat/t08-c02-directory-detail`。本轮输入 head `87b6bca5cc2112fc6c79ead5f779832b66151103` / tree `7bba423ec2f693360ae2a1cd5d8fed69ba44a4ab`。base `1c04eeef33dad322df5b337cbb49ccd4b8edc654` / tree `245d422983f51db85dc0feee9a3a6d579bd21ba9`。fetch 最新 integration 无 delta。

scope:M，一个工作台和详情组合；四个既有文件保留并最窄修复，增加矩阵测试与 App 路由断言。没有修改冻结原语、依赖、原始素材、#23 PR128、#43 PR122 或 P15/newmain。原应用接入 NOT_PLANNED。

## RequirementEvidence

所有下列测试来自 `DirectoryRecipe.test.ts` / `DirectoryMatrix.test.ts`，final-02.json 40 PASS/0 FAIL，exit 0。表中 GREEN-only 不声称回归 RED；原翻页创建 RED 位于 resume-r2/red-01.json。

| Requirement                                        | Evidence                                                                                       | 阶段       |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------- |
| A 单选 / 级联 / 外部清空 / controlled拒绝 / 自由词 | `controls single selection cascade external clear rejection and free query snapshots` — PASS   | GREEN-only |
| B 当前身份 / 详情 / 0 / 空项                       | `keeps stable detail and action identity through reorder replacement and deletion` — PASS      | RED→GREEN  |
| C 查询归属 / 实际分页                              | `ignores old query 'success' and finally on 'source' while current request is pending` — PASS  | GREEN-only |
| C 查询归属 / 实际分页                              | `ignores old query 'failure' and finally on 'source' while current request is pending` — PASS  | GREEN-only |
| C 查询归属 / 实际分页                              | `ignores old query 'success' and finally on 'filter' while current request is pending` — PASS  | GREEN-only |
| C 查询归属 / 实际分页                              | `ignores old query 'failure' and finally on 'filter' while current request is pending` — PASS  | GREEN-only |
| C 生命周期                                         | `invalidates timeline 'success' and finally on 'record'` — PASS                                | GREEN-only |
| C 生命周期                                         | `invalidates timeline 'failure' and finally on 'record'` — PASS                                | GREEN-only |
| C 生命周期                                         | `invalidates timeline 'success' and finally on 'close'` — PASS                                 | GREEN-only |
| C 生命周期                                         | `invalidates timeline 'failure' and finally on 'close'` — PASS                                 | GREEN-only |
| C 生命周期                                         | `invalidates timeline 'success' and finally on 'readonly'` — PASS                              | GREEN-only |
| C 生命周期                                         | `invalidates timeline 'failure' and finally on 'readonly'` — PASS                              | GREEN-only |
| C 生命周期                                         | `invalidates timeline 'success' and finally on 'unmount'` — PASS                               | GREEN-only |
| C 生命周期                                         | `invalidates timeline 'failure' and finally on 'unmount'` — PASS                               | GREEN-only |
| D 单源状态 / 重试                                  | `renders single-source timeline ready without fallback queries` — PASS                         | GREEN-only |
| D 单源状态 / 重试                                  | `renders single-source timeline empty without fallback queries` — PASS                         | GREEN-only |
| D 单源状态 / 重试                                  | `renders single-source timeline forbidden without fallback queries` — PASS                     | GREEN-only |
| D 单源状态 / 重试                                  | `renders single-source timeline unlinked without fallback queries` — PASS                      | GREEN-only |
| C 生命周期                                         | `invalidates creation receipt and finally on source` — PASS                                    | GREEN-only |
| C 生命周期                                         | `invalidates creation receipt and finally on filter` — PASS                                    | GREEN-only |
| C 查询归属 / 实际分页                              | `invalidates creation receipt and finally on page` — PASS                                      | GREEN-only |
| C 生命周期                                         | `invalidates creation receipt and finally on readonly` — PASS                                  | GREEN-only |
| C 生命周期                                         | `invalidates creation receipt and finally on unmount` — PASS                                   | GREEN-only |
| C 生命周期                                         | `retries failed creation and confirms only a valid receipt; no callback has no success` — PASS | GREEN-only |
| B 当前身份 / 详情 / 0 / 空项                       | `does not reset open detail when host options change in place` — PASS                          | RED→GREEN  |
| E 两宿主 / 深链 / 创建隔离                         | `uses library host deep link real page identity range and legal creation` — PASS               | RED→GREEN  |
| E 两宿主 / 深链 / 创建隔离                         | `uses studio host deep link real page identity range and legal creation` — PASS                | RED→GREEN  |
| C 生命周期                                         | `keeps current creation pending after old success and finally` — PASS                          | GREEN-only |
| C 生命周期                                         | `keeps current creation pending after old failure and finally` — PASS                          | GREEN-only |
| C 查询归属 / 实际分页                              | `aborts query on unmount and ignores its late failure` — PASS                                  | GREEN-only |
| D 单源状态 / 重试                                  | `retries only the failed directory and prevents duplicate timeline retries` — PASS             | GREEN-only |
| C 查询归属 / 实际分页                              | `ignores old page query success and finally during a newer page` — PASS                        | GREEN-only |
| C 查询归属 / 实际分页                              | `ignores old page query failure and finally during a newer page` — PASS                        | GREEN-only |
| E 两宿主 / 深链 / 创建隔离                         | `refreshes created picker options and isolates the two neutral sources` — PASS                 | GREEN-only |
| C 查询归属 / 实际分页                              | `retains actual page identity after a failed request` — PASS                                   | GREEN-only |
| C 查询归属 / 实际分页                              | `invalidates an in-flight creation when page changes and retains the draft` — PASS             | GREEN-only |
| C 查询归属 / 实际分页                              | `ignores query success from a previous source` — PASS                                          | GREEN-only |
| C 生命周期                                         | `retains the creation draft on failure and requires a receipt` — PASS                          | GREEN-only |
| D 单源状态 / 重试                                  | `shows zero in details and retries only the selected timeline source` — PASS                   | GREEN-only |
| A 单选 / 级联 / 外部清空 / controlled拒绝 / 自由词 | `does not invent accepted filter state when the host rejects a keyword update` — PASS          | GREEN-only |

## 来源对照

九个指定文件与固定 SHA `79b1578f2b75f55709765b5e7882aaf33146c603` 的 Git blob 逐字节一致，逐文件 SHA-256 见外部 source-bytes.log。input/event/slot/default 与两个直接消费者必要模板/CSS处置见 [设计合同](../../../frontend/DESIGN/components/directory-detail.md#来源与处置)。读取范围为两个目录组件全文、searchable composable全文、Sheet/Body/Node全文、时间线合同/来源入口/状态映射/重试及领域函数索引，sales/orders表格/行操作/Sheet和MES表格/急单目录字段。领域多跳查询算法实现细节、无关弹窗/后端未通读，亦不迁移。

## 执行与原始证据

原始 JSON/log 保留于 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-28/t08-c02-matrix-completion/`。Node v24.18.0，frontend pnpm 11.22.0；root pnpm12 非正式入口。

- 精确 cwd `frontend/apps/playground`：`TZ=Asia/Shanghai ../../node_modules/.bin/vp test run src/directory-detail --reporter=json --outputFile=<上述绝对目录>/final-02.json`，40 PASS。
- 同 cwd 受影响 `src/App.test.ts src/nvui-imports.contract.test.ts` 单独执行，navigation-02.json：99 PASS/0 FAIL（含 `routes both directory deep links and preserves the return link`）；不走包 test 脚本。
- frontend cwd：`pnpm exec vue-tsc --noEmit -p apps/playground/tsconfig.json`，exit 0；playground cwd `../../node_modules/.bin/vp build`，exit 0（chunk/PURE warnings保留）。
- frontend cwd：`vp lint` / `vp fmt --check` 指定 directory-detail、App 与受影响 frontend 文档，exit 0。根及仓内 Markdown 单独 stdin 格式化、非空输出 cmp，受影响本地链接/包含/source import与diff检查另存 logs。
- red-02.json 24 PASS/3 FAIL：重排时间线重复、候选更新关闭详情、studio深链。green-03.json 32 PASS/2 FAIL：新增候选误使创建回执失效。green-04.json 34 PASS；final-01.json 37 PASS；final-02.json 40 PASS。
- 本轮首次测试文件写入路径多加frontend前缀，写失败后 red-01.json 实际只跑旧六项（6 PASS），不是行为RED；green-01命令cwd错误exit127，不是PASS。修正后使用唯一新报告。链接检查首次正则误吃 include 注释尾，修正检查器后全部本地目标存在，不修改文档迁就检查器。
- 继承 resume-r2 的6 PASS/types/build不作本轮fresh；原实施误触vendor全桶432 PASS/1timeout，缺完整原日志，保留事实且未重跑。旧globalfmt3/mainRAW2/docsaliasENOTDIR/parallel timeout不顺修。
- JSON success=true且40个assertion逐项passed；独立runtime/unhandled字段缺失，UNKNOWN，不填0。DOM只作本地行为证据。

Browser/视觉/reduced-motion/键盘实测/HTTP/docsLive/CI/packed/device/vendor APS/production UNRUN；许可 UNKNOWN。#23 PR128视觉reducedEnter、#43 PR122 keyboard未验，保持draft/open，#37不解锁。本PR保持draft，不自审/ready/merge/close/watch，不安排独立审核或后继代理。
