# #51 R2 返修：由 producer 证明移焦来源

仅 PR133，base `0072c1cec946b05a5744ae95f54097d608c12ef9`；R2 被拒候选 `eca603d7e9191c3d66c9abeb053db81246f3fbc8`。Standards material 0、Spec P2 1：Item capture 的 nextTick 先聚焦同一目的项，可落进 Group 的观察窗口。仅凭首次 DOM 转换无法识别调用者，原 R2 FAIL 保留。

## 变更与范围

取消“排他 nextTick 窗口”的假设。固定 Reka 2.10.1 局部补丁在真实 `focusFirst` 完成本次候选移焦后提供内部信号；已先聚焦或被宿主重定向时不发。Group 必须同时持有原 KeyboardEvent、配对目标及该信号才能补偿，并保留 R1 模型更新／转焦／新交互／卸载取消。不会复制候选/方向/循环导航算法或直接写选中值。

补丁只影响 ESM/CJS 的 RovingFocusItem/utils 四份 runtime 文件，保持其它消费者默认返回与行为；仅移动 Group 消费新增内部事件。无 Nv 公开 props/事件变更，Item 未改。安装、分发限制和移除条件见[补丁说明](../../../../frontend/patches/README.md)。#11 产物消费者未验收，不能据 workspace 修复声称外部安装可用。

## Requirement coverage

| Requirement                          | Evidence                                                                                                                             |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Item capture 排队主动 focus 不被补选 | `does not adopt host focus queued by the item capture handler before vendor navigation`；新例旧候选 RED 16 PASS/1 FAIL，修后 17 PASS |
| R1/R2 独立原字节反例                 | R1 `control.probe.test.ts` 4/4、R2 `queued-focus.probe.test.ts` 4/4 PASS，真实/fake timer和直接Reka对照；原断言不改，临时文件已删除  |
| CJS 确实完成目标聚焦才回调           | `CJS provenance reports only the candidate whose focus actually completed`                                                           |
| CJS 宿主已聚焦不回调                 | `CJS provenance is absent when the host already focused the intended candidate`                                                      |
| CJS focus 回调重定向不回调           | `CJS provenance is absent when a focus handler redirects to another element`                                                         |
| CJS 禁用候选失败后仍按原逻辑继续     | `CJS navigation retains its fallback after a disabled candidate cannot take focus`                                                   |

CJS 四例为 GREEN-only producer 合同，不冒称 RED。ESM 通过公开 Group/Item 测试；两份原 probe 含真实 timer 的原 30ms 等待，仅作原件复跑，不等于真实浏览器或新的确定性正式回归。

## 依赖与失败保留

使用 pnpm 11.22.0 的 patch/patch-commit。工具初次生成锁文件顺带删去四个历史对象并改 wrap-ansi 边，已保存原件／diff，拒绝纳入候选；从旧锁字节只加入 patch 登记与 hash 引用，保留全量对象和旧边，再 `install --frozen-lockfile --offline --ignore-scripts` exit0。最终移除 patch 元数据后的锁文件与旧锁完整字节一致；5 importers / 973 packages / 973 snapshots，版本与实际边无升级，UI/mobile 的 Vue 和 Reka 均同一实体。原始材料与上游许可证不改。

本轮更改了共享 Reka 安装，因此重跑 UI 与 mobile 行为桶、移动宿主、三处 types/build、scoped lint/fmt；完整命令／独立 exit／报告位于 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-28/mobile-radio-quick-keyup-provenance-fix/`。最终 fresh：UI 行为 865 PASS、mobile 行为 183 PASS、移动宿主 16 PASS，三处 types、build、源码 scoped lint/fmt 通过。报告缺失 runtime/unhandled 数字字段仍 UNKNOWN，CSS 解析和上游 build warning 保留。

继承初版与 R1 的来源/设计审查；原 RED、R1/R2 拒绝、probe FAIL、中间失败、历史 browser-05、globalfmt/docsalias/mainRAW 全部保留。新 PASS 不抹除旧失败。

UNRUN：浏览器、物理键盘、device、HTTP、CI、packed/旧消费者、production、大桶业务 vendor；policy skip 为零执行。旧应用接入/旧库退出 NOT_PLANNED，排程继续最后。PR 保持 Draft、#51 Open，交独立 R3；不 ready/merge/close/watch，不签整票。

默认 raw diff-check 仍 exit2：标准 unified patch 的上下文前缀空格紧接上游 tab，触发 `space before tab`。原补丁字节不清洗；源码/文档范围默认检查 exit0，补丁单文件按 diff 语法关闭该一项误判后的检查 exit0。命令与原诊断分列保存，没有更改仓库 whitespace 规则或用限定结果覆盖 raw FAIL。
