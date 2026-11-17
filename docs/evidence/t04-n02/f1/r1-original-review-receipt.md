# T04/N02 独立 merger R1：拒绝集成

日期：2026-10-24。PR https://github.com/Mang-X/nerv-ui/pull/52 已 link 到本线程；未监控、未轮询。仅审核/验证，不修改任何仓库代码，不写旧仓。

固定 base `a20825e0477f446737a6bfc07d84b8ec20a143b6` / tree `b5878a6c46faac1384ec15bc5de3a5dea0908cfc`；head `3781ae845ec7e2d676b6e4a8f56d7a3552b8396e` / tree `33bf4bbde5f185f1dd25ae3964f35e22a8f6c41b`。final fetch/PR readback 均未漂移，只有一个提交。实际 root `/Users/mang/Project/nerv-ui` / `integration/nerv-ui-extraction`，任务树 `/Users/mang/Project/nerv-ui-worktrees/t04-n02-mobile-input`。

## Material F1 / P2：新宿主遗漏扫码区动作按钮的焦点所有权

位置 `frontend/apps/playground/src/MobileInputDemo.vue:10–17,52–53`；动作位于 `mobile-input/MobileCaptureInput.vue:91,99–111`。

`trackEditor` 仅把 `[data-form-region]` 内的普通按钮当作暂停扫码目标，但 MobileCaptureInput 是该区域的兄弟节点。因此“清空数值”“打开数值抽屉”“打开记录提示”聚焦后，editing 从 true 回到 false，active 恢复，ScanBar 在下一 RAF 抢回焦点。键盘用户无法稳定停在这三个动作按钮上并正常激活。它属于本票新宿主的焦点协调缺口；ScanBar 基线行为本身未改，不属于 #51。

最小公开复现：mount 真实 MobileInputDemo；保持持续扫码开启；让 `#note-number` 原生 `.focus()`，确认其保持焦点；再让上述按钮原生 `.focus()`（对应键盘导航落点）；等待 Vue 更新并执行已排队的真实 ScanBar RAF 回调。预期焦点保持按钮且“扫码已让出焦点”；实际三者均回到 `[data-scan-region] input` 且“扫码接收中”。位于 data-form-region 内的“保存记录”同路径对照 PASS。

外部探针 `/tmp/nerv-ui-t04-n02-merger-20261024/capture-focus.test.ts`，配置 `probe.config.mts`，未修改/替换组件、没有组件 stub/private vm 断言，只控制 RAF 调度。命令（任务树显式 workdir、PATH 前置本目录 bin）：

```sh
pnpm -C frontend exec vp test run --config /private/tmp/nerv-ui-t04-n02-merger-20261024/probe.config.mts
```

Fresh 结果 exit 1：3 FAIL / 1 PASS；日志 `capture-focus.log`。

| Requirement | Evidence |
| --- | --- |
| 清空数值按钮应保持键盘焦点 | `keeps 清空数值 keyboard focus while scanner is enabled` FAIL，实际 focus=扫码框 |
| 抽屉入口应保持键盘焦点 | `keeps 打开数值抽屉 keyboard focus while scanner is enabled` FAIL，实际 focus=扫码框 |
| 提示入口应保持键盘焦点 | `keeps 打开记录提示 keyboard focus while scanner is enabled` FAIL，实际 focus=扫码框 |
| 已保护动作对照 | `keeps 保存记录 keyboard focus while scanner is enabled` PASS |

需由实施者把这些新宿主动作纳入焦点让出范围并补公开回归；本席不修代码，不通过延迟输入绕过。

## 复核意见

Standards 硬违规 0、smell optional 0；该只读席发现上述需求接缝，merger 已 fresh 复现。Spec 静态席 material 0、optional 1：键盘测试未覆盖满长字符串后独立 sign 切换，例如 `123456 → ± → -123456`；当前实现本身允许，属于测试增强建议，非阻塞。最终集成判断 material 1 / optional 1，完整子席原文另存 `standards-review.json`、`spec-review.json`。两个子席均只读，无重型执行；全部执行由 merger 串行完成。

## Fresh 门禁

task-local pnpm shim 转发 `corepack pnpm@11.22.0`；顶层及 nested 实读均 11.22.0。现有安装上 fresh frozen install PASS（Already up to date），不是新建空 node_modules 的 clean-install 声明。

- mobile 行为 13 files / 75 PASS；host 5 / 32 PASS；UI 43 / 644 PASS。
- mobile 命名 6 PASS；静态 docs mobile 2、UI 6 PASS。
- 三包 vue-tsc 与 production build PASS；9 个受影响源码 fmt/lint PASS。
- 全量 `git diff --check` exit 2，保留 raw logs 的 ANSI/空白事实；排除本票 raw `.log` 后 scoped check exit 0。未正常化原始日志。
- jsdom CSS parse 与第三方 pure annotation 警告保留于日志；命令 exit 0，不当 CSS 动态布局证据。
- 新独立公开焦点探针 3 FAIL / 1 PASS，覆盖上述遗漏，因此已有全绿门禁不能抵消 F1。

## 完整依赖/来源核验

16 份保留 manifest/lock/workspace 的 base/head/工作区完整字节一致，包含 inactive 材料；完整 lock SHA256 `ea746bfedf77603fc582e97d95b9a97a2548349736f66e46e7ec8b3a8a4d476c`。不是 keys-only。

安装锁原始字节不同（installed `fd6618acfa445a3b56e2447752d6c5ffb12c999d2a5bfd4bba7b33406392eb48`），解析后所有顶层完整对象均相同；4 importers、973 packages、973 snapshots 逐完整值比较，changed/unknown 均 0。实际包 symlink/版本已核对，UI/mobile/host 共用一个物理 Vue 3.5.39，Reka 2.10.1。T02 wrap-ansi 隐式边变化不能重现，完整锁相同支持图继承。

base 原有 68 个移动 Vue/TS/CSS 文件，本票 67 个完整 blob 不变，仅 Slider 由 `8f2ed1e651a95c821f34759df1331c984b37008b` 变为 `59f409935609f6b972f8cd5a39688dadf2284ae1`，一行 disabled 守卫；新增公开 Slider test 单独计入。T01 provenance 的 Slider 原 blob 与 base 相同；其余 T01→base 的 Fab/mobile.css 差异属于 N01 已集成来源。Radio wrappers 与 ScanBar 源 blob保持原始来源。Slider 原 RED 30→90、GREEN 2/2已审阅，merger fresh mobile75含该公开测试；没有改代码重演 RED。

审计脚本自身曾遇到 motion-v CJS exports 与 provenance target=null，修正外部审计方式后通过；前者为脚本选择不当，后者原始错误日志 `lock-source-provenance-null-error.log` 保留。外部测试首次 /tmp 与 /private/tmp 入口解析失败是 harness error（0 test），保留 `capture-focus-harness-fs-error.log`；纠正临时 config root/allow 后才记录产品 3 FAIL。

## 浏览器：继承可核验，fresh browser UNRUN

Fresh build 的 HTML/JS/CSS/Inter font 4 项完整字节/长度/SHA256与实施者 HTTP200证据全部相同；5份运行源码哈希吻合。JS SHA256 `35cb4008721faee7ab49d6ed46862f2dfca6949e7b35716c7cc99c8b6c65c945`，CSS `6e3b9322f55869f0708cb40dcbc07e1f57498448e46c4a3f3b30704167910193`；详见 `artifacts.json`。9 张 PNG 身份/尺寸全部核对，实际查看四态 overlay 和嵌套 sheet-keyboard 截图。

已审核最终脚本/JSON与失败保留：390×844 / 844×390 × 明暗，readonly/inputmode/autocomplete、普通字段/overlay让出与恢复、确认保留sheet/草稿、Escape联合关闭、z70>50、按键中心命中、main/document无横溢出；每态33个宿主触点有限矩阵，Stepper/sm Button/Switch有小于44者，不是全库密度认证。trusted input/key/click 与 document blur→RAF burst 的 `isTrusted=false` 分列；Reka程序触发的非trusted click也保留。资源响应runtime为title/scan landscape-dark，number/confirm=-0.5。扩展资源单独分类。

实施者 preview 两次原始 `Preview automation snapshot timed out after 15000ms.` 和实际尺寸1280×800失败已保留；错误尺寸图不计移动证据。radio快速keyup、动画期间误点、select popup停滞、cleanup重开失败等历史失败没有被后续成功覆盖。这里只继承所证明接缝，不能覆盖本席新发现的按钮键盘焦点反例；本席没有操作浏览器，fresh browser=UNRUN。

#51 仍 OPEN，实读原生图 #46→#51→#11；wrappers/Reka与base相同，rawKeyDown立即keyUp产生focus=pocket/selected=desk的原始失败和等两帧后释放成功均保留，不作为本票新回归，不允许最终产物带已知失同步发布。#43独立。

其它 UNRUN：CI、物理 PDA/扫码枪、系统软键盘不弹设备认证、非零safe-area、#11版本化产物、完整文档站、旧消费者/旧全栈、N03–N05整组与#43。

## 最终状态与前沿

未执行 merge、ff-only、代码修改、push、关票或GitHub评论。PR52 OPEN、mergeCommit=null；root/integration仍为 `a20825e0477f446737a6bfc07d84b8ec20a143b6` / tree `b5878a6c46faac1384ec15bc5de3a5dea0908cfc`，root与任务树均clean。任务树head/tree保持固定对象。#46/#5/#1/#51 OPEN，#18 OPEN且draft不变。

#47/#48/#49均OPEN，原生blocked-by只有已closed #45，仍为已解锁前沿；本席未启动它们。#51仍被#46阻塞并阻塞#11。工作树留父代理归档清理；下一轮须新head/tree独立delta复审。
