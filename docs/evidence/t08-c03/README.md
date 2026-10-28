# T08/C03 实施记录

scope:M；只新增一个示例局部移动 recipe，不新增公共导出、不修改来源素材或旧应用，不扩展为流程框架。目标 `integration/nerv-ui-extraction`，base `98878c3b96616efa7d06550d1b579a9646c75325`，tree `5e4c12b61e8cb5e6078c2b90059e2d22fa04f62a`。完成前 fetch 的目标仍为相同 SHA；最终 head/tree/clean 在持久 handoff 中记录，避免提交自引用。

## Requirement | Evidence

测试在 `frontend/apps/playground/src/mobile-flow/MobileFlowRecipe.test.ts`，宿主测试为同目录 `MobileFlowDemo.test.ts`。原始日志及 JSON 保存在 [raw](raw/summary.json)。

| Requirement                                 | Evidence                                                                                                                                                                                                                          |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 输入、外部清空一致                          | `scan and external clear reset controls detail and quantity`；有效行为探针 red-behavior-01 → final-01                                                                                                                             |
| 候选稳定 key、重排、同 key 替换、删除与拒绝 | `stable key reorder replacement rejection and deletion use current authority`；red-03 与 red-behavior-01 → final-01                                                                                                               |
| 未知/零、失败保留草稿重试、完成后只读详情   | `zero differs from unknown and failed draft retries with explicit receipt`；red-03/green-03 保留实际发现，final-01 PASS                                                                                                           |
| 防重复、迟到成功/失败/finally               | `late completion is isolated after 'source' failure=false/true`，同名参数另含 clear、replace、readonly、back、unmount；red-race-01 禁用失效身份后 10 FAIL → final-01 全部 PASS；unmount 用 abort 与无旧结果断言，未宣称其变异 RED |
| 没回执不成功                                | `missing receipt never becomes success`；red-behavior-01 → final-01                                                                                                                                                               |
| 真键盘按钮、安全区 DOM                      | `public keypad buttons enter zero and shell retains safe area footer`；red-behavior-01 → final-01；DOM 不等于设备安全区                                                                                                           |
| 宿主说明、清除、导航                        | `host declares memory boundary and external clear removes candidates`；final-01 PASS                                                                                                                                              |
| 规则输入、依赖隔离、来源原字节、公开名不变  | [合同与来源消费者处置](../../../frontend/DESIGN/components/mobile-flow-recipe.md)，只消费裸桶，不改包导出或依赖                                                                                                                   |

## Fresh 执行

所有 pnpm 命令 cwd 为实际 checkout 的 `frontend`，显式 `corepack pnpm@11.22.0`，Node v24.18.0；根默认 pnpm 12.15.0 未作为正式入口。命令公共前缀以下省写为 `pnpm`。

- `pnpm --filter @nerv-iip/playground exec vp test run src/mobile-flow --reporter=json --outputFile=<绝对日志目录>/final-01.json`：18/18，0 skip，exit 0。
- `pnpm --filter @nerv-iip/playground exec vp test run src/mobile-flow src/MobileDemo.test.ts src/MobileInputDemo.test.ts --reporter=json --outputFile=<绝对日志目录>/affected-01.json`：35/35，exit 0。
- `pnpm --filter @nerv-iip/ui-mobile test --reporter=json --outputFile=<绝对日志目录>/mobile-01.json`：144/144，0 skip，exit 0。policy4 为执行中的非真实 vendor 条件，不改为 skip；docs 专用桶未运行。
- `pnpm --filter @nerv-iip/playground typecheck`：types-04 exit 0；types-03 测试 wrapper 类型 FAIL 保留。types-01/02 是先前候选，不替代最终证据。
- `pnpm --filter @nerv-iip/playground build`：build-01 exit 0，有既有 pure annotation/chunk 提示。
- `pnpm exec vp lint apps/playground/src/mobile-flow apps/playground/src/App.vue`：lint-02 exit 0。
- scoped `vp fmt --check`：fmt-check-02 exit 0，10 files；根 README/mobile-standalone 使用 frontend oxfmt stdin，非空输出后 cmp exit 0；人工核对新增 Markdown 链接与 include 当前 owner，`git diff --check` exit 0。

JSON 没有 runtime/unhandled 字段，均记 UNKNOWN，不补 0；原始 CSS stylesheet parse 警告保留。red-01 是 cwd 路径准备错误；red-02 误由 script 附加 src 扩为全宿主且以缺实现失败，**不算行为 RED**；有效 RED 为已实现组件的错误状态/输入探针 red-03、red-race-01、red-behavior-01。green-01 在根执行失败不算 PASS。green-03 的一条完成态只读 FAIL 已修复，保留历史。

## 边界

继承基础 SHA 与既有组件合同，不继承未来合并验收。旧 global fmt 3 同 blob/main RAW2、docs alias ENOTDIR、parallel timeout 历史不覆盖、不顺修。来源固定 SHA `79b1578f2b75f55709765b5e7882aaf33146c603`；已读 scan、MES operation/执行分区、WMS pick 和质量扫码/执行/结果及直接页面消费，未深入图库、设备、质量领域算法与后端。当前复制参考只含 scheduling 产品文档，无活动移动 product.md；以当前移动接入、DESIGN governance、公开实现与固定来源为据。

browser/visual/HTTP/docsLive/CI/packed/device/vendor/APS/production：UNRUN；license UNKNOWN。无 preview、server 或硬件权限请求。#43 / PR122 的真实 keyboard AC 未执行，继续 draft open，本票不代签。旧应用接入退出 NOT_PLANNED。只交父级独立审核；不自审、ready、merge、close、watch 或启动后继。
