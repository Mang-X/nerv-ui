# T08/R04 PR116 R1 返修

对象：[#22](https://github.com/Mang-X/nerv-ui/issues/22)、[draft PR116](https://github.com/Mang-X/nerv-ui/pull/116)。本页只记录首轮审查后的修正；首轮原始记录保留在[上级证据](../README.md)。起点 `ee0d87d8d7f4b45d4c39c5ea8350d2304e6ff6d6`，base `9bd4621cea462a9799d51a0d1db089d123a257be`；最终 head/tree 与远端状态见交接文件，不把首轮结论改写成当前结果。

## 审查点与来源取舍

| R1 发现                                                                                                                     | 修正与边界                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Spec P2：两个独立 `createApp` 根的 Vue `useId()` 都从 `v-0` 开始，第二根的同名渐变/轨道引用命中第一根                       | 保留 `useId()` 作为 SSR 初始标识；挂载后给每个实例追加模块内递增序号。四个 ID 与 `stroke`/`mpath href` 同步使用该稳定前缀；seed 更新不重分配。两个根、固定 `Math.random`、双向 seed 更新和卸载重挂的公开组件回归及浏览器探针均核到 `document.getElementById(id)` 是本 SVG 节点。双独立根 SSR→水合回归未出现警告，水合后前缀分离；多个独立服务端根在水合前的静态 HTML 仍须由宿主协调 `app.config.idPrefix`，本票保证挂载后的浏览器引用。没有引入全局注册表或新公开 prop。 |
| Standards P2：来源与首轮候选的点阵层均为 `background: transparent` 加 mask，浏览器 `background-image: none`，不产生可见点阵 | 固定来源 Git blob `7474f858771dc91957d544bc5a658cbc994894f4` 保持原样。来源只注释“1px 光点阵、顶部渐隐”，未给实际间距；本件用 28px 周期、1px 淡点与原径向 mask 补绘，颜色仅取既有 `--nv-scr-line-2`，无新 token。它修补来源的可观察氛围缺口，不宣称来源本来可见。真实浏览器 computed 为非透明 `radial-gradient`、`28px 28px`，宽屏和文档页截图可见淡点阵。                                                                                                               |
| Standards P3：`screen/product.md` 写 36，实际 `screen/index.ts` 具名导出 37，漏列新布局                                     | 导航清单改为 37；舞台/容器/外壳从 8 改 9 并列入 `NvScreenLayout`。文档站 screen 索引原为 37，保持一致；冻结历史未动。                                                                                                                                                                                                                                                                                                                                                    |
| 根证据 Markdown 格式 FAIL                                                                                                   | 用根目录 oxfmt 默认规则修正 `docs/evidence/t08-r04/README.md` 表格；首轮 FAIL 保留在 R1 收据。上级证据增加本页入口并标明首轮 `useId()`/点阵声明已被反例推翻。                                                                                                                                                                                                                                                                                                            |

点阵补绘的周期是最窄 CSS 表达；来源只给出“1px 光点阵、顶部渐隐”的注释，没有实际背景图或间距。未改双曲线、7×4 星点、彗星、宿主时钟、slots、Scaler、菜单、业务图或排程。

## RED → GREEN 与本地证据

- `frontend/packages/ui` 下 `../../node_modules/.bin/vp test run src/components/screen/ScreenLayout.test.ts`：跨根新回归 RED exit 1，5 tests 中 1 failed，第二根 `document.getElementById` 命中第一根。首次断言把 `mpath` 漏数成 2/4，是断言错误，不计行为 RED；修正 selector 后上述 ID 命中失败才是有效 RED。GREEN exit 0，6/6；含 `vue/server-renderer` 水合回归。固定 `Math.random=0.5` 下仍保持 ID 分离。
- ui 聚焦命令：`../../node_modules/.bin/vp test run src/components/screen/ScreenLayout.test.ts src/nvui-naming.contract.test.ts src/nvui-doc-coverage.contract.test.ts src/docs-layout.contract.test.ts src/design-docs.contract.test.ts`，exit 0，5 files / 260 tests。首轮同组 258/258 是继承结果，不能写成本轮数量。
- `frontend/apps/playground` 下 `../../node_modules/.bin/vp test run src/ScreenDemo.test.ts src/App.test.ts`，exit 0，2 files / 19 tests。两组 jsdom 均打印 `Could not parse CSS stylesheet`，不充当 CSS PASS；JSON test report 字段**缺失**。
- ui 与 playground 各自运行 `../../node_modules/.bin/vue-tsc --noEmit -p tsconfig.json`，均 exit 0；playground `../../node_modules/.bin/vp build` exit 0。保留已有 `crypto` browser externalization、`@vueuse/core` pure annotation 与大 chunk 警告。manifest/lock 未改，未升级依赖。
- fresh dist 的 HTTP `index.html`、主 JS、主 CSS 与磁盘 Buffer 逐字节相同，均 200、`true`；SHA-256 依次为 `8c49880e53cc368c48a6d152f19fa935f4d9700b5b4a76d6f8edd9f02a4ac86d`、`257103bfff71e4ada866306197c83813adca0de429d7bf9ab31a6253be726ac4`、`8e0316f56a4da1a031e2eb31c83fdaeca25008a4a9337efe4134e48316af17cb`。

- `frontend/` 下 `./node_modules/.bin/vp fmt --check` 覆盖本 PR 16 份前端变更文件及本次新增的 `product.md`，共 17 份，exit 0；`./node_modules/.bin/vp lint` 覆盖本 PR 11 份前端源码与测试，exit 0。仓库根使用真实 oxfmt CLI `node frontend/node_modules/.pnpm/node_modules/oxfmt/bin/oxfmt --check` 核四份本票根 Markdown，exit 0；原首轮根证据表格 FAIL 已修正，但原 FAIL 记录保留。
- 本票受影响十份活动 Markdown 的本地链接/include 独立检查为 68/68 存在、exit 0；screen 具名导出与 `product.md` 清单逐项比较为 37/37、缺失与多列均为 0、exit 0。`git diff --check` exit 0。最终命令与当前 head/tree 另见交接文件。

## 真实浏览器

- T3 preview status 显示无本线程 tab；`preview_open` 两次原始错误均为 `Too many server browser tabs are open. Close one with t3_preview_close, or reuse a tabId from preview_status tabs.`，状态接口没有可复用 tab。随后用 ego-browser TaskSpace 52 与补充主题截图的 TaskSpace 53；均已 `finish({keep:[]})`。工具提示 Ego Lite 0.6.1.11 更新，未升级。
- playground fresh dist：1440×900 正常动效时彗星 `inline`、星点 animation 有名，点阵 computed `radial-gradient`；slot 心愿点击、宿主时钟 10:30→10:31、换 seed 仅改主实例，装饰不截获指针。浅色外壳切换后 screen 根背景仍为 `rgb(3, 5, 11)`，点阵仍可见；390×844 reduced 时彗星 `none`、星点 animation `none`，页面 `scrollWidth=390`，键盘 Enter 取消心愿；1024×768 主壳宽 1024、无横向溢出。固定大屏缩到 390px 时物理字号很小，未据此声称移动可读。
- 临时 Vite 页的两个真实独立 `createApp` 根：同 seed 双路径相等、四个 ID 集合不交；每根各四条引用均解析到自己的 SVG；第一根、第二根分别换 seed 时另一根路径与 ID 不动，卸载第一根后重挂得到新前缀，第二根不动。此页仅作探针，已删除，不进入包。
- VitePress 目标页 `/components/screen/screen-layout` live：标题、侧栏、API、预览及淡点阵可见，点击“加入心愿”后显示“已加入心愿”；使用临时外部工具与本票工作树 symlink，均在结束时清理。完整文档站 build 未运行；不覆盖 #10 的 `schedule-model` alias `ENOTDIR`。
- 截图只存独立交接目录 `t08-r04-instance-visual-fix/`；`browser-1440-normal.png`、`browser-1440-light-theme.png`、`browser-390-reduced.png`、`browser-1024-reduced.png`、`browser-two-roots.png`、`docs-live.png`、`docs-live-clicked.png` 均已目视。截图字节 SHA 在最终交接中回读。

## 保留边界

- 本轮临时工具安装 exit 1：`ERR_PNPM_IGNORED_BUILDS`（esbuild 0.21.5/0.28.1），目标 VitePress dev 后续单独启动成功；该安装 FAIL 不抹除。直接从仓库根运行 `vp fmt` 与调用 IDE 专用 `oxfmt` 包装器均失败，改用正确入口；错误命令不计目标格式判断。
- 继承 FAIL 未复跑：global fmt 三个 base 文件、main raw 两个 base 文件、full docs `schedule-model` alias `ENOTDIR`（#10）。本票根 Markdown 与 scoped 格式结论另列，不能覆盖这些历史。
- UNRUN：CI、完整 docs build、全仓测试/全局格式、packed/legacy consumer、旧应用接入、设备、生产、真实 vendor 四条 policy 车道（0 次）、16 输入/973 对象完整 lock 图。UNKNOWN：八个旧来源消费者逐页业务语义、其它 screen 组合与后续独立 R2 结论。
