# T08R10 / #28 实施候选

scope:M，一份独立 Draft PR，只提供中性大屏详情与参数取值接缝。#28 保持 Open，不代表 #9 组合验收。无委派、独立审核、server 或浏览器。旧应用接入/旧库退出按用户持续授权取消：NOT_PLANNED。

## 身份与来源

- 实际 cwd `/Users/mang/Project/nerv-ui-worktrees/t07-p12-snapshot-compare`，branch `feat/t08-r10-parameter-detail`。
- 初始 clean，base/head（实施前）`0072c1cec946b05a5744ae95f54097d608c12ef9`，tree `7dcc5dd72a51f6e96b55964f5ddd2ce14c6551d9`。
- 交付前 fetch `origin integration/nerv-ui-extraction`，仍为同一 SHA；未 reset、切 checkout 或覆盖其它分支。
- T01 固定来源 `79b1578f2b75f55709765b5e7882aaf33146c603`。读取 DeviceDetailModal 全 script/template/CSS、设备参数 contracts、paramColors、equipment.vue 直接引用/传参段；来源原字节未改。SHA-256 与 base 字节回读见 [source-provenance.json](source-provenance.json)。最终提交 head/tree/clean 以外部 handoff 的提交后回读为准。
- 保留：三段资料结构、深色边界/布局、参数卡、虚线缺测、最近样本竖线/读数。移除：Device 模型、ParamKind→颜色/图标、percent、SDK/fetch、3000ms polling、全局 Esc listener。复用真实 Reka Dialog 与现有 NvSparkline，不复制 PC 样式与折线实现。
- 已完整读取 NvSparkline 与直接消费者 ScreenIndicatorsDemo、SummaryCard 的对应输入调用，并执行既有 ScreenIndicators 测试；保留默认装饰 series、area/color、空/单点虚线与有限极值保护。

## Requirement coverage

| 要求                                                    | 精确测试名 / 证据                                                                                                 | 车道                          |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| info/parameter/history、pending/error/empty             | `Dialog_RealPortalSlotsStatesAndControlledRefusal`                                                                | RED→GREEN                     |
| nearest、光标、读数、单位、范围、键盘首尾               | `Parameter_NearestUsesViewportRatio_EndpointsAndKeyboard`                                                         | RED→GREEN                     |
| 数组替换、同 key 新内容、缺测、零、单点、非有限值不残留 | `Parameter_ReplacementSameKeyMutationAndMissing_ClearOldReadout`                                                  | RED→GREEN                     |
| 原地数组变更、实例隔离                                  | `Parameter_InPlaceMutationAndIndependentInstances`                                                                | GREEN-only                    |
| viewport 比例、首尾夹取、零宽                           | `Parameter_ClampsViewportEndpointsAndRejectsZeroWidth`                                                            | GREEN-only，受控 rect         |
| portal/受控拒绝关闭                                     | `Dialog_RealPortalSlotsStatesAndControlledRefusal`                                                                | RED→GREEN                     |
| mask/Esc、焦点进入/返回、卸载                           | `Dialog_TriggerFocusEscapeReturnAndMask_CloseAccepted`                                                            | GREEN-only，真实 Reka / jsdom |
| 双实例只关顶部、卸载恢复 body                           | `Dialog_TwoInstancesOnlyTopLayerEscapesAndUnmountCleans`                                                          | GREEN-only                    |
| 双中性宿主、替换/缺测/等待/失败/恢复/返回               | `Host_library_DeepLinkDataReplacementMissingAndRecovery`、`Host_studio_DeepLinkDataReplacementMissingAndRecovery` | GREEN-only                    |
| 无轮询、SDK/auth/私有路径、无延迟提交                   | 新组件/host 源码；同步内存替换，无 timer/fetch 服务                                                               | 静态有界检查                  |
| 命名、barrel、coverage、API live、导航、README          | naming / docs / primitive / foundation / imports 精确文件门禁；真实 screen 具名组件导出 43                        | fresh                         |

## Fresh 门禁与失败保留

精确 argv/cwd/各自 exit 见 [commands.json](commands.json)，结果见 [results-summary.json](results-summary.json)。正式入口为 `node /Users/mang/.cache/node/corepack/v1/pnpm/11.22.0/bin/pnpm.cjs`，没有 package test 路径透传或 vendor 大桶。

- UI 精确 9 文件：357/357，exit 0；host 精确 2 文件：94/94，exit 0。包含新公开组件 7、新宿主 2，其余为本次 fresh 契约与既有行为测试。
- ui/host `vue-tsc --noEmit -p tsconfig.json`，host `vp build`、scoped fmt/lint 各 exit 0。
- JSON `success=true`、失败数 0；报告没有 unhandled/runtime 字段，分别标 UNKNOWN，不能记 0。jsdom 的 `Could not parse CSS stylesheet` 原文保留，DOM 通过不证明 CSS 解析、布局或视觉。
- 首次写测试使用了相对真实包 cwd 不匹配的路径，shell exit 1；当次 vp 无匹配测试 exit 1（red.log），不是行为 RED。随后正确包 cwd 的 red-behavior.log：3 项因公开导出不存在失败，exit 1。green-initial.log：2 failed / 1 passed（VTU pointer clientX 构造与 Reka 异步卸载），exit 1；修正平台事件与 flushPromises 后通过。green-second.log 是误在 repo root 执行 pnpm 的 exit 1，保留为入口失败，不能算测试结果。
- 不顺修 globalfmt3、docsaliasENOTDIR、mainRAW2 或历史 timeout。policy4vendor0 不作为 PASS。没有全局安装/升级。

## 有界处置与未读边界

原 tests 盘点：设备 wall layout 为虚拟行几何；mock equipment 的 buildDeviceDetail 验证领域画像/12 点/断线；real equipment 的 fetchRealDeviceDetail 验证 facade/维修/OEE 等。保留原 tests 原字节，不迁入新库执行，不把它们当详情浮层交互证据。设备参数契约有关字段已读取；源业务 fetcher/adapter/算法的其它实现未读，不声称迁移了它们。

继承：只有来源固定身份和历史设计契约；没有继承 runtime PASS。浏览器真实缩放/portal/焦点/命中/视觉、CI、packed、device、旧 consumer、production、许可发行均 UNRUN（许可状态未重新判定）。body portal 明确采用 viewport CSS px，screen tokens 在 :root；测试中 stub rect 只是比例计算平台输入，绝不称真实缩放证明。焦点 DOM 测试与真实浏览器车道分开。

最小外部归档：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-28/t08-r10-implementation-r1/handoff.md`，含各次原始结果、完整 argv、最终 head/tree/clean 与 SHA-256 回读。没有复制 dist/node_modules/cache/checkout。Draft 需要后续独立审核，未自行签整票。

## R1 返修

多实例 Dialog 以实例成组层叠；打开/关闭/重开顺序的 RED→GREEN、宿主文案 optional 与未运行边界见 [F1 记录](f1/README.md)。原 R1 诊断与失败保留，不覆盖旧归档。
