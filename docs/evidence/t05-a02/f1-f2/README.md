# T05/A02：独立 R1 的 F1/F2 最窄修复

关联 [#59](https://github.com/Mang-X/nerv-ui/issues/59)、[PR #66](https://github.com/Mang-X/nerv-ui/pull/66)。仅处理两个 P2；新 head 留给独立 R2，本回执不是 merger 通过结论。父 #6/#1、A03–A07、T08、#43/#51 不扩修。

## 固定对象与原拒绝

- 唯一 worktree `/Users/mang/Project/nerv-ui-worktrees/t05-a02-screen-controls`，分支 `feat/t05-a02-screen-controls`，起始 clean。所有 shell 显式该 workdir；未向自动 Nerv-IIP worktree 写实现。
- integration base `36c55468157f4f0edd84f7fa1b382c29c87c1894` / tree `2f4053aa0eb18845e88e106ea8a3d0e8273f6300`；fresh fetch 仍为该对象。根 integration checkout 保持 clean。
- R1 拒绝 head `1b42b31ebfb9ef29287e4d18cd561defc0a7e73d` / tree `e4653bd926b4d180779667c8e1180a9ab6e41299`。原回执、public probe、JSON、截图不改写，持久目录 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t05-a02-review-r1`。本轮另存原件摘要和原始字节于 `raw/r1`。
- tested frontend tree `f8f2fea89354dcc23e7c34d9eb4ebc61dca527f3`；测试、types/build、浏览器后无运行源码变动。最终 root head/tree 在外部 handoff 精确记录，避免提交自引用。
- F1 为**继承 AC 缺口**：base 源码同样未滚活动项；base browser 没跑，不称 fresh base FAIL。F2 为**新增 disabled 接缝缺口**：初始化逻辑继承，但 disabled 本票新增，true 时原本仍发 update。

## 实现与兼容边界

Select 在打开、方向键、公开模型更新、选项重排/移除和尺寸变化后测量 listbox 的 client 可视区域，仅调整其 scrollTop。定位更新后等 DOM patch 再测量；scroll 只重锚，hover 不触发追随，避免抢手势。保留 body fixed portal、触发器焦点、typed value、viewport clamp、原 scroll/resize 监听生命周期。

Tabs/Segmented 各只给 setup 初始化加 `!props.disabled`。未禁用（false 或省略）且 undefined 的挂载仍初始化数字 0、恰一次 update；禁用 undefined 不初始化；禁用已定义字符串 '0' 不改值/不发事件。之后启用、重排、空 options 恢复不引入新的自动默认值；用户选择继续正常更新。三个 API 页同步说明。

只改三个运行组件、既有控件组测试与三个 API 页；Button/Input、A01 Scaler/scale/布局、主桶、公开 CSS、token、依赖与冻结区不变。16 份依赖输入相对 base 全字节相同，Vue 3.5.39 三包同模块对象，未重装依赖。旧源 `79b1578f2b75f55709765b5e7882aaf33146c603` 零写，来源素材/provenance 保留。

## Requirement | Evidence

公开测试从主桶挂载受控宿主，观察模型、事件、角色、焦点。单测系统几何桩仅证明逻辑，以下真实浏览器没有几何 mock 或 private VM。

| Requirement                        | Evidence                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 原反例保持同断言复现               | `raw/red-original-probes.mjs/log`：原 7 case 原样断言，受拒 head fresh **3 FAIL / 4 PASS**；原30项 model29，open/ArrowUp 均 scroll0、不可见。`green-original-probes.mjs/log` 同断言 **7 PASS**，open scroll366，29 top311/bottom332 在 panel68–332内；↑28 top290–311可见，Enter提交28并回焦                                                                                                                          |
| F1 打开、键盘与动态列表可见        | `select reveals selected and keyboard active rows inside only its listbox after open and option changes`：`red-f1.log` **1 FAIL / 668 PASS**（底部789 >189）→ `green-f1.log` **1 PASS /12 filtered**；最终控件组17 PASS。正式几何边界不冒称浏览器                                                                                                                                                                    |
| F1 真正长列表与输入                | `Long list open arrows endpoints reopen typed values reorder removal empty recovery hover wheel nested anchor`：`browser/long-dark.json` 和 `long-native125.json` 各71个实测状态，31项（0..29及字符串'0'），选中29打开、上下往返首末、Enter提交两种0、重开、reorder/remove/empty/recovery、外部model更新、hover/wheel不回吸、嵌套wheel、稳定定位；活动行可见、焦点trigger、页面scroll0，键盘滚列表期间祖先scroll不变 |
| F1 选中项重排及移除                | `browser/selected-removal.json`：29选中/活动可见，重排后身份仍29；删除29后保留父29且无update，placeholder、活动字符串0可见。只证明存在的活动项，不要求不存在的已选项可见                                                                                                                                                                                                                                             |
| F1 fit0.5/浅色/open resize         | `browser/long-fit05-light-resize.json`：真实 `scale(0.5, 0.5)`，浅色宿主下screen深色；1366→960×540保持open，panel完整viewport内、active可见、trigger焦点。见[截图](long-fit05-light-resize.png)                                                                                                                                                                                                                      |
| F2 禁用挂载及启用兼容              | `'tabs' preserves disabled undefined mount and initializes enabled mounts only once`、`'segmented' preserves disabled undefined mount and initializes enabled mounts only once`：`red-f2.log` **2 FAIL /15 filtered**（actual0/expectedundefined）→ `green-controls.log` **17 PASS**；false/undefined初始化0一次，true不改；启用、清空恢复不补默认；用户选择字符串0后再次禁用不改                                    |
| F2 defined/空恢复                  | `'tabs' preserves defined string zero and empty undefined disabled mounts without emissions`、`'segmented' preserves defined string zero and empty undefined disabled mounts without emissions`：禁用字符串0与空undefined，两者恢复options并启用仍无事件，17件控件组全部PASS                                                                                                                                         |
| F2 真浏览器对照                    | `Disabled mount and enabled compatibility through public controlled hosts`：`browser/groups-native100.json`、`groups-native125.json`，每轮两个组件×disabled/enabled/omitted/defined/empty共10个挂载；false/省略各恰一次0，true undefined和string0无emit；启用+空恢复不改，真实鼠标选string0只一次。见[原生125%对照最终截图](groups-native125.png)                                                                    |
| 新 production Select/键盘/disabled | `browser/interaction1920.json`、`tab-disabled.json`：当前production真实鼠标、Tab/箭头/Space/Enter、Select两种0、Esc/外点焦点、Search/Input/Switch与两组禁用、一次键一次变更、两种指示器/长短标签，均fresh                                                                                                                                                                                                            |
| 新 production 坐标与原生125%       | `browser/geometry-scroll-resize.json`：1920/1366/960、精确fit0.5、open resize、form真实wheel、width/stretch锚定与命中；`native125.json/native125-layout.json`：Chrome设置网页缩放125%，DPR2→2.5、visualScale1、CSSzoom1，原生未仿真，最终100%/DPR2。见[production原图](native125-production.png)                                                                                                                     |
| 新 production 主题/资源/清理       | `browser/themes/themes-resources.json` 四主题16份实际HTML/JS/CSS/Inter响应均HTTP200且bytes=新dist；低动效交互可用。`routes-lifecycle.json` 8路由逐次打开后离开，owned listener/observer均0、portal0、焦点不归旧controls，深链刷新成功                                                                                                                                                                                |

## Fresh 门禁与资源身份

使用现有 task-local `/tmp/nerv-ui-t05-a02/bin/pnpm` → `corepack pnpm@11.22.0`，嵌套 PATH 同版本；不使用全局 pnpm，不安装依赖。实际退出码均保存在 raw 日志与外部 handoff。

```sh
PATH="/tmp/nerv-ui-t05-a02/bin:$PATH" pnpm -C frontend test
PATH="/tmp/nerv-ui-t05-a02/bin:$PATH" pnpm -C frontend --filter @nerv-iip/ui test:docs
PATH="/tmp/nerv-ui-t05-a02/bin:$PATH" pnpm -C frontend --filter @nerv-iip/ui-mobile test:docs
PATH="/tmp/nerv-ui-t05-a02/bin:$PATH" pnpm -C frontend build
```

- `test-all.log` exit0：UI46文件/673 PASS、mobile27文件/144 PASS、host11文件/95 PASS，无skip/fail；控件组17 PASS。
- `docs-ui.log/docs-mobile.log` exit0：6+2；三包types + production build exit0。CSS parse、两处PURE/INVALID_ANNOTATION和chunk警告保留。
- 本次维护7个frontend文件fmt/lint exit0；两个证据Markdown另单列检查；scoped diffcheck0。未格式化历史raw/冻结附件；旧raw2/冻fmt1保留原身份。
- `identity.json`：16依赖全字节、Vue唯一、三个运行owner之外的frontend无改，A01/Button/Input与base同字节；`resource-inheritance.json`：新HTML/JS/CSS不同于原响应，不能把原browser称新bundle fresh；字体同字节，CSS仅scope ID归一后声明全同。其它未重跑历史情形只继承其固定来源结论。
- 当前新production：HTML427B sha256 `79fc176085d30c042ef1c745797737b8170af01e65a32ec58e9eeafb1fc7f6d2`；JS `index-C8CN2vZ-.js` 544517B `045c5a01018ef9b35c22c71388bb8aad80a5bd22bcdd8ee8966f9d586466f67b`；CSS `index-D9WSzwj5.css` 261529B `d678e74f125d7a588c5c093380f297bd73782233da3d5b427845dad058d16b40`。字体48256B sha256 `3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62`。
- scratch单独构建公共主桶宿主并记录4份实际响应与scratch-dist全字节相等，`browser/scratch-resources.json`。它用于长列表/禁用挂载，不能代替production原AC。实际查看[深色长列表](long-dark.png)、浅色fit0.5、原生125%生产与挂载对照最终截图。

## 保留的失败、继承、延后与 UNRUN

原独立R1拒绝与3FAIL不撤销。新修复的GREEN不把base源码推断改成basebrowser fresh；原handoff所有产品RED、harness/type/旧raw与冻结格式失败保持原身份。

本轮工具/harness失败单列：T3 open about:blank解析失败，改实际URL成功后snapshot连续两次原文均 `Preview snapshot failed: Preview automation snapshot timed out after 15000ms.`，之后ego同一TaskSpace9；scratch首次build因/tmp→/private/tmp实体路径不一致报非法HTML emit name，改realpath后通过；长列表首次wheel未命中listbox而等待超时，明确移动到panel内部后实际wheel通过；额外selected-removal首次将Vue代理数组直接跨browser序列化为{}而断言失败，改为公开数组展开后无事件断言通过。原文件/log保留，无生产修复伪装harness错误。证据Markdown初次fmt用`..`路径被工具拒绝，改绝对路径后检出新README排版，格式化并复查通过；两份失败日志亦保留。F1首轮测试命令的`-- -t`没有过滤而实际跑全UI，记录完整1FAIL/668PASS，之后改明确file/-t入口；未把filtered计作全量PASS。

技术异议：无需要扩大范围的异议。R1 optional P3 Tabs/Segmented同形键盘/焦点逻辑留后续共享；本轮不抽象。A01既有P3类名前缀建议另延后，A01已验收布局不回退。

UNRUN：CI、packed #11、完整docs站 #10、物理/模拟设备、旧库消费者接入/发布、父 #6 最终组合、独立R2与合并。未merge/close59/6/1/ready18，不watch/poll PR。

原始脚本/JSON/响应/RED/GREEN/provenance位于 `/tmp/nerv-ui-t05-a02-fix/handoff/raw`；持久副本 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t05-a02-fix/handoff`。归档过滤node_modules、cleancheckout、cache、.vite，不将缓存或安装树提交。自有browser/service关闭、zoom100和最终clean由外部handoff记录；worktree保留供独立R2。
