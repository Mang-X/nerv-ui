# T08/R05 实施候选证据

范围 M，目标 `integration/nerv-ui-extraction`，独立 draft PR。旧应用接入 NOT_PLANNED；本记录不签整票、不代表真实认证、视觉验收或 #43/PR122 keyboard 验收。

## 对象与来源

- 唯一实现 checkout：`/Users/mang/Project/nerv-ui-worktrees/t08-r08-status-hero`；branch `feat/t08-r05-login-stage`。
- base `1c04eeef33dad322df5b337cbb49ccd4b8edc654` / tree `245d422983f51db85dc0feee9a3a6d579bd21ba9`；开工 clean。结束 fetch integration 无 delta。
- 来源固定 `79b1578f2b75f55709765b5e7882aaf33146c603`。本次只读原始 login.vue、插画路径及 router/auth API/store/main direct consumers；未改 migration 原字节，未读取无关业务全域。
- login.vue SHA256 `cd0309208c764a08918e156e2ea7221f72606f1f8d663294cc61cfd6e0a53425`；login-hero.webp SHA256 `272962c778b1fc555653d46a3a97195abe52c96da0eace8990b446d9050afb42`；来源许可 UNKNOWN。
- 两个中性 SVG 为本次手写几何，不生成或替换原品牌资产。reading SHA256 `3b437fb64c361bc18c6f27d6224c6c71d57010a4c487f288e597db956cd7d5d6`；garden SHA256 `0db7c015d1ce13877a360269665365bbe0b4e4854be98aab9ba065329b3c4072`。
- 来源能力、事件/slot、消费者退出和布局变换取舍见[设计决策](../../../frontend/DESIGN/components/screen-login-stage.md)；[API/live 源码](../../../frontend/apps/design-system/docs/components/screen/login-stage.md)。

## RequirementEvidence

| 要求                                            | 精确测试与结果                                                                                                                                              | 边界                                                  |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 插画替换、光点坐标、contain/cover               | `projects artwork and glow points through the same viewBox for contain and cover`：RED→GREEN，断言实际 SVG viewBox/meet/slice、cx/cy、load/error 与替换清空 | DOM+数学合同；真实裁剪/resize视觉 UNRUN               |
| slot 输入、submit、pending/disabled、安全 error | `keeps interactive form slots, host controlled pending and disabled, and escaped errors`：RED→GREEN，断言输入与单次 submit、两类阻断及转义                  | 真浏览器 Enter/焦点 UNRUN                             |
| 多实例、迟到加载、卸载                          | `ignores replaced and unmounted image callbacks and keeps independent roots ID free`：fresh GREEN；无 SVG IDs，不依赖 useId，不增加 SSR idPrefix 边界       | 本项未独立 RED；SSR hydration UNRUN                   |
| 两个中性 host                                   | `lets both neutral hosts own waiting and error without claiming authentication`：fresh GREEN；书房/花园独立输入、等待、失败、不宣称认证成功                 | 本项未独立 RED；真实键盘 UNRUN                        |
| 粒子/streak/HUD/reveal、宽窄、低动效            | 保留来源固定 14 粒子、2 streak、4 HUD 位置与 CSS 降级；静态插画/HUD 保留                                                                                    | 实际宽窄、reduced-motion、构图等价均 UNRUN，不能签 AC |
| Nv 导出、冻结 primitive                         | 两个 focused contract 文件 255/255 PASS                                                                                                                     | 非 vendor/真实运行证据                                |

没有随机生成器、SVG IDs、observer、RAF 或 timer；图片事件只接受当前 ref/href，卸载后拒绝。host 以显式 pending 阻断重复提交，不在组件中猜测认证结果。无 KPI/数量单位输出；HUD mono-xs/弱色，标题 tracking-tight。

## fresh 命令与日志

执行 cwd 均为上述 checkout；Node `v24.18.0`、frontend pnpm `11.22.0`，未安装升级依赖。

- RED：`pnpm -C frontend --filter @nerv-iip/playground test src/screen/ScreenLoginStage.test.ts`，实际脚本扩大为 src 全桶，exit 1；2 failed / 431 passed，保留 `red-01.log`，不重跑全桶。
- GREEN：`pnpm -C frontend --filter @nerv-iip/playground exec vp test run src/screen/ScreenLoginStage.test.ts`，2/2 然后 3/3；`green-01.log`、`green-02.log`。均含 jsdom CSS parse 提示，不当真实渲染证据。
- 最终 affected：`pnpm -C frontend --filter @nerv-iip/playground exec vp test run src/screen/ScreenLoginStage.test.ts src/ScreenDemo.test.ts --reporter=json --outputFile=../../../docs/evidence/t08-r05/affected-05.json`，18/18，exit 0。前轮 `affected-03.json` 曾误写 checkout 父目录，已移动归档，只清理自有文件；保留该事实。
- `pnpm -C frontend --filter @nerv-iip/ui exec vp test run src/nvui-naming.contract.test.ts src/ui-primitives.contract.test.ts`：255/255，exit 0，`contracts-01.log`。
- UI types / host types：各自 `pnpm -C frontend --filter <包> typecheck`，exit 0，见 `ui-types-01.log`、`types-04.log`。
- `pnpm -C frontend --filter @nerv-iip/playground build`：exit 0，`build-03.log`，保留 vendor pure annotation 提示。
- scoped fmt/lint：`fmt-*.log`、`lint-03.log`；仅改变文件，不触冻结区。根 README 使用非空 stdin 输出再 cmp；人工 Markdown 链接与 diff 检查另记 final-check 日志。

测试 JSON success=true，runtime/unhandled 专用字段缺失，数量 UNKNOWN。无继承 PASS 被记为 fresh；历史 global fmt 3/main RAW 2/docs alias ENOTDIR/parallel timeout 未修复、未复跑。vendor policy 不作为真实 vendor 证据。

## 未运行

browser / 宽窄视觉 / 真实 Enter 与辅助技术 / HTTP / docs live / CI / packed / device / vendor / APS production 全部 UNRUN。许可 UNKNOWN。#43/PR122 不在本票。交父独立审核；尚不能签整票。

## 同轮次重复提交修复

`coalesces same turn submit before the host pending prop reaches the child`：`red-submit-01.log` 实际 1 failed / 4 passed；局部 nextTick 锁后 GREEN，最终 affected 18/18。组件卸载后 nextTick 不改状态；不引入 timer 或认证状态。
