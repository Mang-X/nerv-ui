# T08/R01 实施候选

scope M，单独 draft PR，目标 integration/nerv-ui-extraction。只读来源设计，复用公共 NvAppShellInset 与菜单原语；未恢复 app-shell workspace。宿主适配与 API 的单一说明见[组件页](../../../frontend/apps/design-system/docs/components/desktop/neutral-shells.md)，直接消费者处置和设计选择由该页 include DESIGN 源。无新导出，命名冻结集合未改。

## 对象

- 开工 base `405fac9a7b4e94d0fd4469d89bb95f6363ec46f4`，tree `2d46cc7bfdbfeaf43494b3c44b4b78e2436a9d16`，clean。
- 实际 checkout `/Users/mang/Project/nerv-ui-worktrees/t08-r08-status-hero`，分支 feat/t08-r01-neutral-shells。
- fetch 最新 integration 后无 delta，merge 返回 Already up to date。最终 head/tree/clean 在持久 handoff，避免在提交内自指 SHA。
- 来源 SHA `79b1578f2b75f55709765b5e7882aaf33146c603`；逐字节来源记录仍在 migration/t01/provenance.jsonl。本票未写 migration、候选 app-shell、shadcn、旧应用、newmain 或 P15。

## Requirement | Evidence

下列精确 test 名位于 playground `NeutralShell.test.ts` / `NeutralShellDemo.test.ts`。

| Requirement                             | Evidence                                                                                                                                                                                                                                                   |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 受控拒绝、替换、重排                    | `keeps controlled selection and current identities after replacement and reorder`；`library preserves controlled refusal and accepts replacement without stale labels`；`studio preserves controlled refusal and accepts replacement without stale labels` |
| Cmd/Ctrl+K 一次、双实例、重复挂载与清理 | `metaKey K fires once across two instances and cleans up repeated mounts`；`ctrlKey K fires once across two instances and cleans up repeated mounts`                                                                                                       |
| 溢出当前动作                            | `selects the current overflow destination`                                                                                                                                                                                                                 |
| 用户替换、退出身份与 header/user slot   | `opens user actions with the replaced identity and preserves slots`                                                                                                                                                                                        |
| 折叠、recent/starred                    | `toggles the existing sidebar and keeps recent and starred actions`                                                                                                                                                                                        |
| 品牌、禁用项、两域深链                  | 两个 host 测试与 App.vue 的 #shell/library、#shell/studio 入口；源码使用可替换 title、原生 disabled                                                                                                                                                        |
| 无 auth/SDK/搜索服务、新导出            | 增量 diff；只消费公开 UI 主桶；搜索只产生请求和提示                                                                                                                                                                                                        |

## Fresh 执行

Node v24.18.0，frontend pnpm 11.22.0。没有安装或升级依赖。原始每轮报告保存在 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-28/t08-r01-implementation-r1/`，不覆盖同名结果。

- playground cwd：`pnpm exec vp test run src/NeutralShell.test.ts src/NeutralShellDemo.test.ts --reporter=json --outputFile=…/green-final.json`，exit 0，8/8。
- ui cwd：`pnpm exec vp test run src/components/blocks/app-shell-inset/AppShellInset.test.ts src/nvui-naming.contract.test.ts src/ui-primitives.contract.test.ts --reporter=json --outputFile=…/ui-final.json`，exit 0，256/256。
- frontend cwd：`pnpm --filter @nerv-iip/playground typecheck`、`pnpm --filter @nerv-iip/playground build`，exit 0。
- scoped vp lint（五个改变的 host 源文件）、vp fmt（改变的 frontend 源码/文档/导航）与增量 `git diff --check`，exit 0。人工检查 Markdown 表格、include 与相对链接；未运行文档站。
- 有效行为 RED：去除 defaultPrevented/repeat 与焦点归属保护后，同名 metaKey/ctrlKey 用例均在首个非归属实例不应发事件的断言失败（red-behavior-01.json，2 FAIL / 1 PASS）；恢复保护后两者 GREEN。其余新增断言为 GREEN-only，不冒称均有有效 RED。

## 原始失败与证据限制

首轮 red-01 扩大执行了既有 src（381 个通过），新组件不存在导致 suite load FAIL，不能算行为 RED。green-01 为错误 cwd/setup 路径 FAIL。green-02/03 的卸载后 emitted 断言受 Vue Test Utils 清理影响；green-04 含 ASI 与模板解析失败；green-06 的 pointerdown 参数不兼容；green-08 为同测试连续切换 portal 的焦点时序失败；均保留原报告，最后精确运行 green-final 才是最终结果。types-02/04 分别暴露 ASI 与宿主未声明 lucide 依赖；最终未加依赖，types-05 通过。早期 types 原始终端输出见交付会话，未伪造日志。

JSON 未提供 runtime/unhandled 字段，均为 UNKNOWN，不按 0 处理。历史 globalfmt3 同 blob/main RAW2/docs alias ENOTDIR/parallel DraftEditingDemo timeout 保持历史 FAIL，不在本票修复，也不继承为本票 PASS。vendor policy skip 0 不作真实 vendor 证据。

browser/visual/HTTP/docs live/CI/packed/device/vendor/APS/生产均 UNRUN；license UNKNOWN。#43/PR122 的真实 browser keyboard AC 未跑，本票保持 draft open。旧应用接入及退出 NOT_PLANNED；没有自审、ready、merge、close、watch、安排审核或启动后继。
