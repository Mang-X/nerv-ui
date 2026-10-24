# T05/A02：七件受控大屏控件证据

> 下文是原实施固定对象的历史证据。独立 R1 拒绝集成：F1 长列表活动项不可见（继承 AC 缺口），F2 新增 disabled 接缝在挂载时改值。原 FAIL 永久保留；本轮最窄修复与新 bundle 的 fresh 证据见 [F1/F2 回执](f1-f2/README.md)。新 head 仍须独立 R2。

[#59](https://github.com/Mang-X/nerv-ui/issues/59) 仅交付 Button / Input / Search / Select / Tabs / Segmented / Switch 及 `/#screen/controls` 中性宿主。父 #6、spec #1、A03–A07、T08 recipe、#43/#51 保持独立。接入说明见 [独立大屏接入](../../screen-standalone.md#a02受控输入与空间安排)。

## 固定对象与来源

- 唯一实施 worktree：`/Users/mang/Project/nerv-ui-worktrees/t05-a02-screen-controls`，分支 `feat/t05-a02-screen-controls`；开工 clean，based-on 为 integration `36c55468157f4f0edd84f7fa1b382c29c87c1894` / tree `2f4053aa0eb18845e88e106ea8a3d0e8273f6300`。
- 最终 frontend tree 与完整单测/浏览器时的 `db8247487412827b2ab6ab205f7c1b848a15ebce` 仅有 Tabs/Segmented 两页 API 表格排版差异，运行文件零差异；两页调整后静态 docs 已重跑，16份响应仍逐字节等于 dist，详见 `raw/final-artifacts.json`。
- 本轮 tested frontend tree：`21a8d652e5b02f3748680628c00d4b175abee534`。最终 root head/tree、PR、fetch/merge 与 clean 回读在外部 `handoff.md` / `raw/final-receipt.json`，避免在提交内自引用根 tree。
- 在线 #59/#6/spec #1、implement-spec/tdd/verification、Vue/测试/文档技能与目标根/包规则、README/DESIGN/governance/product 已核读。原研究 A02/共享壳仅是静态 UNRUN；A01 R2 `2026-10-25/t05-a01-review-r2` 的既有结论不冒充本票运行。
- 旧源固定 `79b1578f2b75f55709765b5e7882aaf33146c603`，只读核验 HEAD/status 为该 SHA/clean。七件在 base 与旧源逐字节一致；本轮只改 Search/Select/Tabs/Segmented/Switch，Button/Input 实现仍与来源逐字节相同。逐件 blob/SHA256 在 `raw/dependencies-final.json`。本轮修复不自动回写旧库。
- 16 份 manifest/workspace/lock 输入相对 base **全字节相同**；三活动包 Vue `3.5.39` 同 realpath、同模块对象。安装仅因本任务 node_modules 缺失执行一次 frozen install；无锁图或依赖升级，不以 keys-only 比较声明无升级。
- 主桶、包名、旧 props/default/Nv 名称、公共 CSS 入口、tokens、冻结 migration/shadcn 保持；Tabs/Segmented 只补可选 `disabled=false`。A01 Scaler/scale/StageDemo 字节不变，保留 mode/design/width scroll 与已修 F1 布局。宿主数据、校验与计数均在内存，无后端/权限/SDK；缺失选择不重写模型，数字 0 与字符串 '0' 严格区分。

## Requirement | Evidence

测试从 `@nerv-iip/ui` 主桶或公开宿主挂载，只观察 props/model/events/slot/DOM。系统几何、observer 桩只证明逻辑，浏览器单列。以下控件测试均在 `ScreenControls.test.ts`。

| Requirement                            | Evidence                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Search 清除一次、禁用 guard            | `clears the controlled search exactly once and guards disabled clear actions`：父模型由“河岸”变空、事件恰好一次、按钮消失；禁用属性与直接 DOM click 均不更新。`red-search.log` 1 FAIL → `green-search.log` 1 PASS                                                                                                                                                                                              |
| Select 类型、重排、删除、空和恢复      | `select keeps typed values and a safe active option after reorder removal empty and recovery`：数字 0 / 字符串 '0' 分别选中；活动项重排后仍对应 aria-activedescendant；删除后占位保留父原值，清空后按键无异常，恢复继续选值。`red-select-dynamic.log` 2 PASS 但 **1 未处理越界错误、exit1** → GREEN，无隐去错误                                                                                                |
| Select viewport 逻辑与内滚重锚         | `select anchors within the viewport above a bottom edge and reanchors on inner scroll`：右下边界固定字面矩形、向上展开、scroll/resize 重锚；`red-select-bounds.log` 1 FAIL/3 PASS → `green-group-focus.log` 含该项 PASS。真实几何由 browser 证明                                                                                                                                                               |
| Select 关闭、焦点、禁用、监听清理      | `select closes on Escape Tab outside and disabling and releases open listeners on unmount`：Esc/Tab/外点/禁用关闭；选值保留触发器焦点，外点保留外部焦点，卸载无 portal 且移除其监听。browser 另做原生 Tab 与路由清理                                                                                                                                                                                           |
| Select 延迟工作卸载取消                | `select cancels pending placement before unmount without creating a late observer`：open 的 nextTick 定位尚未执行即卸载，不新建 observer。`red-select-late-unmount.log` 1 FAIL/11 PASS → `green-controls-lifecycle.log` 12 PASS                                                                                                                                                                                |
| Tabs / Segmented 选择与焦点一致        | 参数例 `'tabs' keeps selection and focus together through arrow click reorder removal and recovery`、`'segmented' keeps selection and focus together through arrow click reorder removal and recovery`：鼠标/箭头、typed value、重排、移除、空恢复、disabled。`red-group-focus.log` 两项实际焦点 FAIL → `green-group-focus.log` 6 PASS；当前最终套件包含更完整断言                                             |
| 两种指示器合同分别保留                 | `tabs keeps equal slot ink and hides it for missing or empty selection while preserving defaults`：三等宽槽位 ink、缺失/空隐藏、旧 defaults；`segmented remeasures changed labels and resize and hides stale thumb when selected option disappears`：系统 offset 字面量、同值标签换宽、observer、空恢复和断开。真实长短标签的等宽 tabs 与不等宽 Segmented 由 browser 实测                                      |
| Switch 一次激活一次、禁用不更新        | `switch ignores disabled key and click and accepts one native activation per key click sequence`：直接禁用 keydown 及原生 click 边界。`red-switch-direct-event.log` 1 FAIL/8 PASS → 最终 PASS；真实鼠标/Space/Enter 得提醒计数 3，无双发。jsdom 不冒称原生键盘                                                                                                                                                 |
| Button slot/type/variant/size/disabled | `button preserves slot variant size native form type and disabled action boundary`：slot、submit、secondary/sm、disabled 原生 click 不调用、启用恰一次。既有实现 baseline PASS，无伪造 RED                                                                                                                                                                                                                     |
| Input 字符串/后缀/error/disabled       | `input exposes string model suffix error and native disabled state without coercing zero`：'0' 保留字符串、'12' 更新、suffix 人、aria-invalid 与原生 disabled。既有实现 baseline PASS                                                                                                                                                                                                                          |
| 中性宿主零/错误/无匹配/缺失/空         | `drives neutral search input error zero empty and restore through the host memory model`（`ScreenControlsDemo.test.ts`）：人数0、非法文案、保存、搜索清除、移除/清空/恢复；`host controls shared typed options and disables all seven actions without losing values`：选择文字零区域与全部禁用、计数不变。`red-host-missing.log` 是新 SFC 尚不存在的导入失败，不是运行产品 FAIL；`green-host-first.log` 2 PASS |
| 已完成 section 与 A01 返回             | `opens only the completed controls section and unmounts its portal when returning to stage`（`ScreenDemo.test.ts`）：controls 深链、aria-current、切 stage 卸载 portal、七旧入口；`red-shell-section.log` 1 FAIL/3 PASS → 最终 host 套件 PASS。App 把 hash 传给共享壳，只挂 stage/controls 两个已交付组                                                                                                        |

## Fresh 命令与退出码

所有 shell 显式 workdir 指向本任务；嵌套 pnpm 使用 task-local PATH，版本固定 `11.22.0`，未使用全局 pnpm12。Python 只走 uv，无全局安装。

```sh
PATH="/tmp/nerv-ui-t05-a02/bin:$PATH" pnpm -C frontend install --frozen-lockfile
PATH="/tmp/nerv-ui-t05-a02/bin:$PATH" pnpm -C frontend test
PATH="/tmp/nerv-ui-t05-a02/bin:$PATH" pnpm -C frontend --filter @nerv-iip/ui test:docs
PATH="/tmp/nerv-ui-t05-a02/bin:$PATH" pnpm -C frontend --filter @nerv-iip/ui-mobile test:docs
PATH="/tmp/nerv-ui-t05-a02/bin:$PATH" pnpm -C frontend build
```

- `install.log` exit0；`test-all-final.log` exit0：UI **46 文件/668 PASS**、mobile **27 文件/144 PASS**、host **11 文件/95 PASS**，无 skip/fail。包含官方 naming/import/static 合同，不能替代 browser。
- `docs-ui.log` exit0：3 文件/6；`docs-mobile.log` exit0：1 文件/2。仅静态文档覆盖，完整文档站 #10 UNRUN。
- `build-final.log` exit0：三活动包 vue-tsc + playground production build。VueUse 两处 PURE/INVALID_ANNOTATION、>500 kB chunk 警告保留。jsdom CSS parse 提示保留。
- 精确维护文件列表 `raw/maintenance-files.json`，`vp fmt --check` / `vp lint` exit0；`git diff --check` 本票维护范围 exit0。未格式化历史 raw 或冻结附件；旧 raw diffcheck2、冻结 fmt1 保持历史身份，不因本轮通过被清洗。
- `audit.mjs` exit0：16 全字节输入、Vue 唯一身份、七件源/base 对照和冻结/A01 owner 无改动。交付前再次 fetch/merge 最新 integration，结果见最终回执。

## Fresh browser 与资源

T3 preview status/open 后，第一次 navigate 早于 preview server ready 得 ERR_CONNECTION_REFUSED，ready 后重试成功；snapshot 两次原文均为 `Preview snapshot failed: Preview automation snapshot timed out after 15000ms.`，随后按规则切换 ego-browser，同一 TaskSpace7/p1、设置 p2。全部是鼠标/键盘/wheel 自动化，不是物理触控设备；未引入 Playwright 框架。

| 实际组合                        | Evidence                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1920×1080 输入与键盘            | `browser/interaction1920.json`：typed Select 两种0、Esc/外点焦点、Search 空结果和清除、Input 错误/零、保存、Switch 鼠标+Space+Enter=3、Tabs/Segmented 方向键焦点、长短标签、重排、清空恢复、disabled 实际点击不改值                                                                                                                                                                               |
| 1366×768、960×540、精确 fit=0.5 | `browser/geometry-scroll-resize.json`：1920/1366/960 的真实矩形、body portal、option center hit、完整视口边界。960×540 因设置栏81px，实际 fit=0.425；额外960×621使可用区域960×540，取得精确 scale(0.5,0.5)，不偷换窗口与舞台尺寸。960×540 dropdown 实际向上展开且四项可点                                                                                                                         |
| 内滚、resize、width/stretch     | 同文件：open 1920→1366 重锚；1600×900 表单 wheel scrollTop 0→100，触发器与浮层同步移动后鼠标选择且回焦；1920×1440 width 和 stretch 下打开、边界/命中/选值均验证。A01布局修复未改动                                                                                                                                                                                                                |
| 真正 native125%                 | `browser/native125.json` / `native125-layout.json`：`chrome://settings/appearance` 原生“网页缩放”设为125%，Emulation metrics 先清除；DPR 2→2.5，innerWidth2288→1830，cssZoom1、visualViewport.scale1、root/body transform:none。当前新 bundle 鼠标选文字0、键盘选数字0、关闭焦点、Switch三次、Tabs/Segmented箭头与长标签重测通过；main/footer/portal 实测均在viewport内。finally 恢复100%，DPR回2 |
| 原生 Tab 与 disabled            | `browser/tab-disabled.json`：Search→Input→Switch→Select，选值后Tab到保存并Enter保存；禁用后Tab从暂停编辑到表单region、空间region、区域安排，跳过所有禁用件；禁用 Search clear/Input 的实际点击和输入不改值                                                                                                                                                                                        |
| 外层四主题与低动效              | `browser/themes/themes-resources.json`：light/dark × neutral/blue，screen 与 body portal 的5项token恒定、panel color-scheme:dark；每态真实Select选值。7个相关元素 normal transition 与 reduced0s；低动效仍实际Switch和方向键/Select可用                                                                                                                                                           |
| 卸载、旧入口、深链              | `browser/routes-lifecycle.json`：controls open后真实点击stage+七旧表面；对本组新增监听和observer记录系统 add/remove/observe/disconnect，离开后 owned active均0、portal0、焦点无旧控件归属，dark/brand保留；回到stage/controls只有1舞台，最后controls reload成功。未把其它表面自己的监听算作A02残留                                                                                                |
| 实际资源与字体                  | 四主题实际16份HTML/JS/CSS/font响应HTTP200，原字节逐一等于最终dist；全部页面请求为本地4191。CSS platform fonts：中文h1为系统PingFang SC，人数'0'为自托管Inter；只请求Inter latin切片48,256B，不宣称其它切片或MiSans已加载                                                                                                                                                                          |

当前实际资源（同四主题）：

| 响应                                   |  Bytes | SHA256                                                             |
| -------------------------------------- | -----: | ------------------------------------------------------------------ |
| HTML                                   |    427 | `6bfba3b177895cfa1aa60d80a93a4fd2ae5af62ed726ce9eb56d635777d75ab8` |
| index-bYekUpXG.js                      | 544137 | `0714f488766ffc2dc4ddebe8f76fb71612119b119538e66933f38e4da30994b4` |
| index-Cc4Y5IdX.css                     | 261529 | `05aef8cf59238e349064db9ecad8b9b313cc45eee4bc252da6dd146c1f0639b0` |
| inter-latin-wght-normal-Dx4kXJAl.woff2 |  48256 | `3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62` |

已实际查看 [1920控件](controls-1920.png)、[960向上浮层](controls-960.png)、[原生125%完整截图](native125.png)、[外层浅色蓝品牌](light-blue.png)。ego默认截图在native125时裁幅不足的原图保留；补用同页原生CDP captureScreenshot取得4576×2426完整画面，并核对DOM边界，未通过图像编辑拼补。最终bundle由全部browser记录中的实际JS/CSS URL和响应原字节锁定，不以新head配旧JS冒充fresh。

## 保留的 FAIL、继承与 UNRUN

- 产品 RED：Search disabled clear；Select empty索引越界、viewport右下边界、延迟卸载observer；Tabs/Segmented焦点；Switch直接禁用keydown；shell section缺失。Button/Input既有PASS，未伪造RED。
- harness/类型 FAIL：`red-switch.log` 实际9 PASS，VTU `.trigger` 自动跳过disabled事件，**它不是RED**；改用公开DOM dispatch后在原Switch上取得真正RED。`green-select-bounds.log` 初次在排空定位后的DOM patch前读取style而exit1；`test-all-initial.log` thumb异步断言1 FAIL/666 PASS，改用flushPromises等公开更新排空，无削弱尺寸断言。`build.log` 两个测试回调类型遗漏undefined，exit2；修正类型后最终构建通过。日志原样保留。另一次维护脚本在 frontend 已暂存后只选到3个Markdown，lint以“No files found to lint”退出1；已将路径选择改为 staged+unstaged+untracked 的完整22文件范围，再次fmt/lint exit0，失败输出保存在 `maintenance-staged-selection-fail.txt`。
- 继承：A01 R1 F1 FAIL、R2通过及其P3私有Scaler类名前缀建议保留；本票不回退/顺修。原研究/复制/旧raw格式失败各自保持来源身份。本票未取得独立merger结论。
- UNRUN：CI（未取得）、packed/versioned #11、完整文档站 #10、物理触控/扫码枪/软键盘/模拟器/设备、旧库消费者接入/发布、父 #6 最终跨组组合。#43/#51独立门禁不变。未merge、close #59/#6/#1、ready #18或监控轮询。

完整脚本、每轮 stdout、RED/GREEN、响应原字节、依赖审计和最终回执留在 `/tmp/nerv-ui-t05-a02/handoff/raw`，持久副本 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t05-a02/handoff`。归档过滤node_modules/cleancheckout/.vite/cache；自有preview/browser/service清理与nativezoom还原另见最终回执。任务工作树保留供独立merger。
