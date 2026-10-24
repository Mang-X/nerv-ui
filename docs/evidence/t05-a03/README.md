# T05/A03 指标与基础状态验证

本票 [#60](https://github.com/Mang-X/nerv-ui/issues/60) 交付七件既有公开组件的独立中性演示，入口 `/#screen/indicators`。数据来自宿主内存中的阅读、到访、预订样例；组件不接入业务 SDK 或服务。父 [#6](https://github.com/Mang-X/nerv-ui/issues/6) 的组合验收、完整文档站 #10、packed 安装 #11 与旧消费者接入分别验收。

## 固定对象与范围

- 任务工作树 `/Users/mang/Project/nerv-ui-worktrees/t05-a03-screen-indicators`，分支 `feat/t05-a03-screen-indicators`；全部 shell 显式 workdir 指向该目录。
- integration base `9f53a679b2854a34d661a17c70ac530cc57a4826`，tree `b1fd21648cd03a424977c0a46be6a1ee5623f603`。交付前 fresh fetch/merge 返回 `Already up to date.`，没有合入 main 或修改 integration。最终提交的 head/tree/clean/PR 见外部 `handoff.md` 与 `raw/final-receipt.json`，避免在提交内自引用 tree。
- 原库只读：`/Users/mang/.t3/worktrees/Nerv-IIP/t3-5c5dc61d`，HEAD `79b1578f2b75f55709765b5e7882aaf33146c603`，核验 clean。七件 source 与 base 全字节相同。本轮仅改 CapsuleBar（长数值列）、DigitalFlop（RAF/低动效）、Sparkline（实例 ID）；RingGauge/KpiBar/StatusLight/StatusTag 实现不改。
- 16 份 manifest/workspace/lock 输入与 base **完整字节相同**；活动 UI/mobile/playground 的 Vue `3.5.39` 同 realpath、同模块对象。`handoff/audit.mjs` 与 `raw/dependencies-final.json` 记录逐件 source blob/SHA256。没有依赖升级，不以 keys-only 比较推断锁图结论。
- 保留包名、Nv 名、props/default、主桶与公共 CSS。未知数字由宿主文字说明，既有数字 API 不硬传 null/NaN。Ring 的几何/格式化、Sparkline 的通用归一化继续由组件拥有。
- A01/A02 的组件与组页面、Scaler/scale、tokens、原版 shadcn 与 migration 均字节不变。共享 ScreenDemo 只串行增加已完成 indicators 入口，保留 stage/controls、全部既有表面与返回深链。A01 P3 类名前缀、A02 P3 焦点逻辑建议、#43/#51 继续独立跟踪，不在本票扩修；不包含 #61/#62/#64 或 T08 卡片、主灯、墙、hover 能力。

## Requirement | Evidence

公共测试由 `@nerv-iip/ui` 主桶 mount/setProps，观察文本、aria、实际图标输入与可见 SVG 引用，不读取 private vm，不逐行镜像几何算法。RAF 桩只推进已经注册的回调边沿；CSS/布局由真实浏览器另验。

| Requirement                               | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ring 的钳制、原值、小数、零与单位         | `ring clamps only its arc and keeps zero negative overflow and decimal readings in text and aria`：100/125 同满弧，负数/零无弧但读数分别保留，45.67 显示45.7，更新 label/suffix/size/valueSize；baseline PASS，无伪造 RED。                                                                                                                                                                                                                                                     |
| Capsule 的逐行身份、精度、替换与清空      | `capsule preserves each raw reading and caption while clamping fills and replacing rows`：0/-5/125.25/12.5 与原标签对应，填充0/0/100/12.5%，3.14159原样、title全文和空数组不回退。行为 baseline PASS。真实布局 `browser-04-red-capsule.log`：52px列容不下63/54/72px文字，RED；改为内容列后 `browser/geometry-partial-final.json` 三视口各行 scrollWidth<=clientWidth，GREEN。                                                                                                   |
| 数字到字符串、再恢复数字                  | `digital flop cancels numeric motion when a literal replaces it and resumes without stale content`：在途数字切字符串立即显示文字且 pending RAF=0，再变0收敛，无旧文字。`red-digital-string.json` 1 FAIL → `green-digital-string.json` 1 PASS。                                                                                                                                                                                                                                  |
| 动态低动效与最终读数                      | `digital flop settles an in-flight reading when reduced motion changes and never schedules reduced updates`：在途400.25切低动效立即到目标，再传-12.5不注册RAF。有效 `red-digital-reduce-valid.json` 1 FAIL（其它按名称过滤）→ `green-digital-spark.json` 5 PASS；早期错误媒体事件桩的失败单列保留。                                                                                                                                                                             |
| 快速第二值、减少、卸载、格式              | `digital flop replaces a fast second target decreases to the final decimal and cancels on unmount`：9876.5被12.25替换、最终文本精度与aria一致、卸载无pending RAF；`digital flop preserves long strings and initial reduced numbers through type changes`：长字符串、初始低动效、0与12345.67切换。baseline PASS。                                                                                                                                                                |
| Sparkline 空/单点/常量/变点数、area/color | `sparkline renders explicit empty and single data as a dash then constant and changing point identities`：空/单点虚线、常量水平线、三点中峰和两点下降的独立字面几何、颜色及面积开关、清空不残留；baseline PASS。                                                                                                                                                                                                                                                                |
| 多实例 SVG 引用                           | `sparkline keeps each area reference local even when the random source repeats`：两份area输入/颜色，强制系统随机源重复仍必须各引本实例defs。`red-spark-identity.json` 重复ID实际FAIL（同轮另有媒体桩FAIL，未隐藏）→ `green-digital-spark.json` PASS。改用Vue useId；browser三视口验证双area本地fragment，双Ring读数独立且没有fragment引用。                                                                                                                                     |
| KPI icon/ring 各自真实输入                | `kpi accepts the actual icon component and independent zero and clamped ring inputs with host text`：实际传入图标组件接收size19并渲染标题；ring=0仍进环分支，125满环但显示原文，替换长文字和清空。baseline PASS。真实长横条由键盘 ArrowRight 滚动，见 `browser/overflow-half.json`。                                                                                                                                                                                            |
| 两种状态件全部 tone 与动态 label          | `status light and tag keep every tone alias equivalent while labels change independently`：每件遍历run/idle/alarm/cyan/green/amber/red并再次改label。baseline PASS；`browser/motion-themes.json` 验证各别名与palette的实际计算颜色同义，文字分别来自host。StatusTag文档明确label prop，没有用于替换标签的slot。                                                                                                                                                                 |
| 旧默认兼容与显式空值                      | `retains legacy defaults without treating explicitly empty arrays as example data`：Capsule/Kpi/Tag/Spark既有默认；前述空数组测试保持空。新宿主显式提供中性数据，不把默认工业示例当事实。                                                                                                                                                                                                                                                                                       |
| 宿主 source、真实0、未知与长文字          | `host switches each source identity and keeps real zero distinct from unknown without invalid numeric props`：五种读数组中0有效、未知不挂数字环，恢复当前序列；`host updates long text all status labels and trend area without replacing them with component defaults`：边界原值/长说明/label切换/area；`browser/source-identities-final.json` 逐组读数、环、胶囊、序列与实际fixture核对，路径含当前点数，CSS d过渡排空后记录。                                                |
| timer、section与重挂                      | `host continuous readings stop on source change and unmount without timers updating another group`；`opens the completed indicators deep link and stops its continuous readings before stage or controls`：宿主连续更新、切source停、卸载清timer；返回stage/controls和重挂复位。`browser/routes-lifecycle.json` 九个实际路由往返：本组在途RAF/interval=0，MediaQueryList监听=0，旧组DOM与旧焦点=0；保留共享壳/其它表面自身监听，DOM监听记录因审计持有旧节点而不作全局泄漏结论。 |

最终代码测试：UI `47文件/684 PASS`、mobile `27文件/144 PASS`、host `12文件/101 PASS`；无失败、无skip。精确结果来自 JSON，不按历史673/144/95推断数量；本票没有为追数量补空断言。包级命名、导入、token与静态合同随各自完整套件执行。

## Fresh 命令与结果

pnpm 固定11.22.0，嵌套脚本也通过 task-local PATH；Python仅用uv。node_modules原先缺失，实际成功 frozen install 一次；最初未显式指定Corepack版本落到12的前置拒绝保留在 `install.log`，更正后 `install-corrected.log` exit0。

```sh
PATH="/tmp/nerv-ui-t05-a03/bin:$PATH" pnpm -C frontend install --frozen-lockfile
PATH="/tmp/nerv-ui-t05-a03/bin:$PATH" pnpm -C frontend --filter @nerv-iip/ui test --reporter=json --outputFile=/tmp/nerv-ui-t05-a03/handoff/raw/ui-post-layout.json
PATH="/tmp/nerv-ui-t05-a03/bin:$PATH" pnpm -C frontend --filter @nerv-iip/ui-mobile test --reporter=json --outputFile=/tmp/nerv-ui-t05-a03/handoff/raw/mobile-post-layout.json
PATH="/tmp/nerv-ui-t05-a03/bin:$PATH" pnpm -C frontend --filter @nerv-iip/playground test --reporter=json --outputFile=/tmp/nerv-ui-t05-a03/handoff/raw/host-post-layout.json
PATH="/tmp/nerv-ui-t05-a03/bin:$PATH" pnpm -C frontend --filter @nerv-iip/ui test:docs --reporter=json --outputFile=/tmp/nerv-ui-t05-a03/handoff/raw/docs-ui-final.json
PATH="/tmp/nerv-ui-t05-a03/bin:$PATH" pnpm -C frontend --filter @nerv-iip/ui-mobile test:docs --reporter=json --outputFile=/tmp/nerv-ui-t05-a03/handoff/raw/docs-mobile.json
PATH="/tmp/nerv-ui-t05-a03/bin:$PATH" pnpm -C frontend build
node /tmp/nerv-ui-t05-a03/handoff/audit.mjs
```

- 上述最终测试命令均exit0；静态文档UI 6、mobile 2 PASS。仅检查docs source，不宣称完整文档站运行。
- `build-final.log` exit0：三个活动包vue-tsc与playground生产build。VueUse两处PURE/INVALID_ANNOTATION与大chunk警告保留；jsdom CSS parse提示保留。
- `vp fmt --check`、`vp lint`、本票维护范围 `git diff --check` 的精确文件列表与结果在 `raw/maintenance-files.json`、最终maintenance日志。只维护本票源码/七页文档/证据，不格式化冻结素材或历史raw。旧raw diffcheck2、冻结fmt1仍是历史FAIL，不被本票scoped检查覆盖。
- fetch/merge 最新integration已执行，结果仍为上述base；最终回执另记提交、push、PR链接和clean状态。本票不merge PR、不关闭#60/#6/#1、不ready#18、不监控。

## Fresh browser 与最终产物

T3 preview status/open后，服务ready之前的open为chrome-error页；ready后navigate成功。snapshot同一步两次原文均为 `Preview snapshot failed: Preview automation snapshot timed out after 15000ms.`，按规则改用ego-browser，TaskSpace11/p1，所有round在同一空间。这里是桌面鼠标、键盘和wheel自动化，不能称物理触控设备。

| 实际对象                       | Evidence                                                                                                                                                                                                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1920×1080 / 1366×768 / 960×540 | `browser/geometry-partial-final.json` 三组已完成的几何/滚动/点击断言和图像：scale分别0.925 / 0.636111 / 0.425，main/footer在viewport内；父区真实wheel滚到全部七色状态，不遮footer；缩放下实际增减读数到100再0。所在round09最终因另一个错误的“必须溢出”等待exit1，未把整轮冒称PASS；该独立边界由round12 clean exit0闭合。 |
| 精确0.5与真实横向滚动          | `browser/overflow-half.json`、round12 exit0：960×621扣81px工具栏，实际main=960×540、scale(0.5,0.5)；切1600×900设计，KPI client1526/scroll2572，原生ArrowRight使scrollLeft>0。Digital长字符串在其488px区域完整容纳，正确断言“有溢出才须滚动”，不强造滚动来装绿。                                                          |
| 所有读数与多实例               | round13 exit0，`browser/source-identities-final.json`：五组fixture原值、标签、两环与两spark，空/单点虚线、常量/变点数、area颜色与本实例引用。新bundle已记录在每组assets字段。                                                                                                                                            |
| 正常/低动效、四主题            | round16 exit0，`browser/motion-themes.json`：正常最终2,474.5与host相同，177次真实RAF注册后pending0；切低动效增加到2,574.5立即一致且pending0。五类相关CSS过渡均0s，小灯animation:none。外层light/dark×neutral/blue下screen token与dark color-scheme固定，仍实际更新数字。所有tone实际颜色和动态label均可达。              |
| 卸载、深链与旧入口             | round10 exit0，`browser/routes-lifecycle.json`：indicators→stage/controls及七个旧表面，timer/在途RAF与本组MediaQueryList清理，外层dark/brand保留；重挂初始1284、running=false，深链reload仍在indicators。既有表面完整业务链与父#6组合另验。                                                                              |
| HTML/JS/CSS/font               | round14 exit0，`browser/resources/final-responses.json`：实际四个响应HTTP200，原字节逐一等于当前dist；全部请求本地4192，无旧服务/API/CDN。中文h1实测系统PingFang SC，数字实测自托管Inter；不宣称MiSans或其它切片已加载。                                                                                                 |

实际查看了 [1920边界读数](indicators-1920.png)、[960缩小舞台](indicators-960.png)、[低动效七态文字](reduced-status.png) 与 [浅色外壳蓝品牌](light-blue.png)。screen自身保持深色；长KPI按原合同横向滚动，父内容区按原生纵向滚动，不用全页overflow掩盖内容。

| 最终响应                               |  Bytes | SHA256                                                             |
| -------------------------------------- | -----: | ------------------------------------------------------------------ |
| HTML                                   |    427 | `2c8f2fff54ce4c428c00b51d58a77734d1f9d9857da3df5a3b150f1a97da09bc` |
| index-nEeNSBBy.js                      | 562604 | `85ad744bfbc24145e3660c64900ab5d189147e4ed8629575ec5c293254fee2a0` |
| index-BGH-g6CR.css                     | 271654 | `fcd8dabc97382720cfeb32107a41fbee25a3e0403e928137d262f16f59722309` |
| inter-latin-wght-normal-Dx4kXJAl.woff2 |  48256 | `3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62` |

## 保留的 FAIL、继承与 UNRUN

- 产品RED：Digital字符串替换未取消RAF；动态低动效不收敛；随机ID碰撞；Capsule固定52px列。全部按上述接缝窄修，保留原失败。Ring/Kpi/状态件等已有PASS不伪造RED。
- 新宿主缺失与section未挂载的RED：`red-host-missing.json` 是新SFC不存在的导入失败，`red-shell-section.json` 是实际旧stage断言失败。它们不冒称线上缺陷。
- 测试harness FAIL：最初媒体事件缺 `matches` 字段，`red-digital-reduce.json` / `green-digital-reduce.json` 失败；更正事件后暂退watch修复，重得有效RED `red-digital-reduce-valid.json`，再恢复GREEN。`green-host-first.json` 误把动画中间值当最终0、误期待环显示全部125.25小数，按公开合同修正为低动效确定性宿主接缝和125.3读数，无削弱组件RAF测试。
- 构建FAIL：`build-browser.log` 记录formatter把内联多语句事件移除分号后的Vue语法错误；将两句移入宿主showLiteral函数后后续构建exit0。
- browser harness FAIL：round05/06在内容中心发送wheel未滚动而等待超时；改从实测父区边沿输入，round09/16的同场景完成。round07早期长KPI实际尚未溢出，错误等待超时；按AC补足host长说明后真实溢出。round09后段要求原本完整容纳的Digital文字一定溢出而超时；round12改为核真实宽度后条件性滚动并exit0。ego跨round恢复原窗口，早期round02数据身份有效但不能当1920几何证据；最终相关round均重新设置并实测viewport。全部旧失败和早期产物图像留在外部，不换名冒称最终fresh。
- 继承：A01/A02历史FAIL及其已合入修复、旧raw格式失败与PURE/CSS警告各保留原身份；本票不回写原库，后续消费者接入需按固定版本另验。独立merger结论本票尚未取得。
- UNRUN：CI（未取得）、packed/versioned #11、完整文档站 #10、物理设备/扫码枪/软键盘/模拟器、旧库消费者接入/发布、父#6最终跨组组合、native zoom125%（本票未改变原生缩放，不以CSS/pageScale冒充）。

完整脚本、每轮stdout/JSON、RED/GREEN、原始响应与SHA256、依赖审计、最终回执保留于 `/tmp/nerv-ui-t05-a03/handoff`，持久副本 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t05-a03/handoff`。归档过滤node_modules/cleancheckout/.vite/cache。自有ego TaskSpace11已finish keep[]，T3 preview已关闭，4192服务SIGINT退出130且无LISTEN；nativezoom未更改。工作树保留供独立merger。
