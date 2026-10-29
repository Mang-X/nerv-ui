# T09/F8 实施证据

范围：#167 / Parent #10，scope:M；仅现有 AlertDialog 页、公开消费示例与局部测试。旧四应用接入/退出 NOT_PLANNED。其余 F/G/H 返父，不改 producer。

## 来源与裁决

起点 head `31469317e05c5ce9d825125be5a67a353097278f`，tree `e974b573db7161a1ae55591e086c4b4af0c9e54f`，clean。公开入口为 `frontend/packages/ui/src/index.ts`，品牌经 pc barrel，基础由主桶直接导出 ui/alert-dialog barrel。

已完整核对 `components/pc/alert-dialog/` 与 `components/ui/alert-dialog/` 的十个 SFC 及 index.ts：Root 转发 Reka props/emits 和 scoped slot；Trigger 转发 props/default slot。Content 转发 Reka props/emits、attrs/default slot，基础另有 size=default（可 sm），品牌无此 size。Title/Description 转发 Reka props/default slot；Header/Footer/Media 只有 class 与 default slot，无自有事件。Action/Cancel 转发 Reka props，品牌包 NvButton，基础用 buttonVariants；variant 默认 default/outline，size 默认 default，点击即关闭。基础八件不是品牌的 barrel 别名，不以共享 Reka 内核抹掉独立样式职责。

| 原未决基础项 | 本票证明 |
| --- | --- |
| Action | 基础组合实际 render；点击关闭并更新本页 receipt |
| Cancel | 基础组合实际 render；取消关闭不更新 receipt |
| Content | 基础组合实际 render；真实 portal alertdialog |
| Description | 基础组合实际 render；aria-describedby 对应实际文本 |
| Footer | 基础组合实际 render；容纳两个可换行按钮 |
| Header | 基础组合实际 render；组合媒体、标题、说明 |
| Media | 基础组合实际 render；装饰图标 aria-hidden |
| Title | 基础组合实际 render；aria-labelledby 对应实际文本 |

品牌 NvAlertDialogMedia 在另一品牌组合实际 render，未用基础 Media 冒充。完整学习源码由 Markdown include 同一 SFC；原例与异步 Action 警告保留。无永久 registry。

## AC 与实际验证

`alert-dialog-host.test.ts` 两个精确测试名：

- `renders nv-alert-dialog media and all structure with linked modal text and synchronous receipt`
- `renders alert-dialog media and all structure with linked modal text and synchronous receipt`

两项均使用真实公开组件和 modal，无全 stub：检验八项实际 data-slot、媒体隐藏、真实标题说明关联、取消不变、确认关闭/更新、两套 receipt 独立。没有合成 keyboard 充当浏览器证据。先缺 consumer 准备 FAIL，再无 modal 行为 RED（2 FAIL），实现后 GREEN；错误 aria-modal 假设另保留 FAIL，当前 Reka 未输出该属性，不修改 producer。

design-system 局部 14 文件 76/76（原 74 保留）；完整 docs types/build、scoped lint/fmt、Markdown 非空二次 bytecmp、178 页保留与 links/diffcheck 见外部 raw。保留 jsdom CSS parse/build 警告及历史 RED、准备失败、global fmt RAW2/TZ timeout，不以新 PASS 覆盖。

浏览器 HTTP、1440/390 亮暗、真实 Escape/键盘焦点与最终 dist 验收交父独立席 UNRUN；missing runtime/unhandled UNKNOWN。CI/packed/device/production UNRUN；授权 UNKNOWN；vendor policy skip，0 执行，非 PASS。不签父 #10，不 ready/merge/close/watch。

外部交接：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f8-implementation-r1/handoff.md`，保留 source、patch、raw 和逐文件 SHA 回读，不含 dist/deps。
