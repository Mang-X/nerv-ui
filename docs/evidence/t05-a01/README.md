# T05/A01：大屏舞台与七件基础外壳证据

本票 [#58](https://github.com/Mang-X/nerv-ui/issues/58) 只交付 A01。父 #6、母 #1 和 #59–#64 不因本票完成而关闭。实现范围、公共接入和溢出策略见 [独立大屏接入](../../screen-standalone.md)。

## 固定对象与来源

- 开工 clean linked worktree：`/Users/mang/Project/nerv-ui-worktrees/t05-a01-screen-stage`，分支 `feat/t05-a01-screen-stage`；所有 shell 命令显式 workdir 指向这里。
- 开工 integration/base：`d9a5c22390090afce05cc74d731340ed5fe34cc3`；tree `bb0b68d1060b9e4a220c26a3042f8978644a8eb3`。在线 #58/#6/#1 已读取；批准的 spec1/taskgraph 与研究 §2/4A01/5/8 已核对。研究本身是 static UNRUN，未当作通过。
- 本轮 tested **frontend tree**：`9c6149cbbf423e2d04d2b99e1e91cb3a4962e2ba`。最终 root commit/tree、PR 与 fetch/merge 结果记录在外部交接回执，不用文档自引用推造自身 SHA。
- 固定旧源：`79b1578f2b75f55709765b5e7882aaf33146c603`，旧路径 `/Users/mang/.t3/worktrees/Nerv-IIP/t3-5c5dc61d` HEAD/status 只读重核为该 SHA/clean。9 份 owner runtime 文件（7 Vue、scale、tokens）在 base 与旧源逐字节一致；本票仅 Scaler/scale 发生运行实现差异，其余六 Vue 与 tokens 当前仍等同旧源。具体 blob/新 SHA256 在 `raw/dependencies-final.json`。
- 新增 `ScreenDemo.vue` / `screen/ScreenStageDemo.vue` / 公共行为测试；App 仅增 screen 分发与桌面入口；product 改为通用远距显示表面、清单对齐当前 34 件导出。未改主桶、现有 CSS 入口、migration baseline、shadcn、包名、许可、A02–A07 和 T08 owner。独立宿主/尺寸修复属于新库；旧消费者接入前不自动回写。
- 16 份 manifest/workspace/lock 相对 base 全字节相同；三活动包 Vue `3.5.39` 同 realpath、同模块对象。无解析图变动，不用 keys-only 比较替代完整图；本轮无需 973 图语义修复。

## Requirement | Evidence

所有行为测试经公共主桶或真实宿主挂载。jsdom 只证明状态与输出，几何/命中/原生滚动/zoom 单列 browser。

| Requirement                                     | Evidence                                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 保留 computeScale 原 7 例与默认值，非法边界安全 | `scale.test.ts` 原 7 项保留；新增 `returns a safe identity for $name in every mode` 六个稳定 case：nonfinite viewport width/height、nonfinite design width/height、negative viewport/design；三模式均断言身份比例。`red-scale-nonfinite.log` 4 FAIL/9 PASS → `green-public-screen.log` 19 PASS（3 文件合计） |
| 公共 Scaler 设计非法输入、slot 与 transform     | `keeps the public stage finite and its slot usable for invalid design dimensions`：NaN/0 及 Infinity/负值的默认宽高、有限 transform 和按钮内容。`red-scaler-invalid.log` 1 FAIL（宽度为空）→ `green-scaler-invalid.log` 1 PASS                                                                               |
| resize、设计更新与 fit/width/stretch            | `rescales visible content on resize, design changes and all three public modes`：窗口 960→2560、设计 1920→1280，逐步断言可见 slot 与 transform；真实几何另见下表                                                                                                                                             |
| 容器测量、卸载与重挂载                          | `measures an embedded viewport and disconnects observers across unmount and remount`：公开根测量为 800×600 后 transform 更新、observer 清理和重入。`red-scaler-container.log` 1 FAIL/2 PASS → `green-scaler-container.log` 10 PASS（含原 scale7）。observer 是系统边界桩，不冒充浏览器尺寸                   |
| Panel 插槽动作                                  | `preserves public panel extra, title-extra and body slot actions`：三个外部回调各一次；宿主 `changes visible neutral content through panel, border and tech-frame slots` 验证说明与展厅实际文案改变                                                                                                          |
| Border title/default 与 TechFrame 交互          | `preserves border title fallback and title/default slot actions plus tech-frame content`：title 属性回退、title slot 覆盖、嵌套 TechFrame 动作；同名宿主内容测试验证安排与留言可见变化；真实中心命中及浏览器点击已执行                                                                                       |
| Header 显式输入、旧默认与 TitleBar              | `uses explicit host header and title inputs while preserving legacy defaults`：五输入文本、空串隐去、无 button/link、旧 Header/TitleBar 默认值、显式 title/sub；Header 图标仅装饰，时间是 host 固定输入，不声称实时计时                                                                                      |
| 可深链与全部旧表面返回                          | `opens screen stage deep links and returns through every existing surface without a fixed stage`：`#screen/stage`/`#screen`、7 个原入口、卸载无 Scaler、重入只有一份。`red-app-screen.log` 1 FAIL/7 PASS → `green-app-screen.log` 8 PASS。真实刷新/点击返回见 `browser/routes-final-geometry.json`           |
| 宿主设置在舞台外                                | `changes scale and design dimensions with native host controls outside the stage`：native select 更新 mode/design、溢出提示、settings/nav 非 Scaler 后代。真实 width wheel 到底，外层返回不被 fixed 层挡住                                                                                                   |
| 七件可见、flow 和低动效                         | 7 个实际实例的几何和 elementFromPoint；`browser/final-theme/themes-resources.json`：normal CSS 循环、flow=false 停止，reduced-motion 时 divider animation:none/display:none、Header animation:none，内容及留言动作仍可用                                                                                     |

## Fresh 命令和结果

pnpm 经 corepack 固定 `11.22.0`，task-local `/tmp/nerv-ui-t05-a01/bin/pnpm` 进入 PATH 供嵌套脚本使用，未用全局 pnpm12。首次 frozen install exit0；Python 脚本只用 `uv run --python 3.12 -- python`，未全局安装。

```sh
PATH="/tmp/nerv-ui-t05-a01/bin:$PATH" pnpm -C frontend install --frozen-lockfile
PATH="/tmp/nerv-ui-t05-a01/bin:$PATH" pnpm -C frontend test
PATH="/tmp/nerv-ui-t05-a01/bin:$PATH" pnpm -C frontend --filter @nerv-iip/ui test:docs
PATH="/tmp/nerv-ui-t05-a01/bin:$PATH" pnpm -C frontend --filter @nerv-iip/ui-mobile test:docs
PATH="/tmp/nerv-ui-t05-a01/bin:$PATH" pnpm -C frontend build
```

- `test-all.log` exit0：UI **45 文件/656 PASS**；mobile **27 文件/144 PASS**；host **10 文件/89 PASS**，无 skip/fail，包含当前命名与 import 边界检查。
- `docs-ui.log` exit0：3 文件/6 PASS；`docs-mobile.log` exit0：1 文件/2 PASS。均为静态文档/命名覆盖，不是文档站运行。
- `build-formatted.log` exit0：三包 vue-tsc 后 playground production build。VueUse 两处 INVALID_ANNOTATION、chunk >500 kB 警告保留；jsdom `Could not parse CSS stylesheet` 提示保留，未称无警告。
- scoped fmt/lint 对 22 个当时维护文件的绝对路径执行，`fmt-absolute.log`/`lint-absolute.log` exit0；新证据 README 的后续维护检查与完整文件列表见外部最终回执。没有对历史 raw/冻结附件做“洗绿”。本票 `git diff --check` clean 与历史 raw 空白 exit2、冻结附件 fmt1 不是同一范围。

## Fresh browser 与资源

先执行 T3 preview status/open。第一次误用 about:blank 被 URL 校验拒绝后改为空参数打开成功；指定 loopback 导航成功，但同一步 snapshot 两次原文均为 `Preview snapshot failed: Preview automation snapshot timed out after 15000ms.`，随后按约定切换 ego-browser（TaskSpace3/p1），没有新建 Playwright 框架或依赖。

| 实际组合                                               | Evidence                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1920×1080、1366×768、2560×1080、960×540，重复 1920/960 | 最终 `browser/routes-final-geometry.json`：实际 innerWidth/innerHeight、舞台/容器矩形、7 实例、5 交互目标中心 hit、无文档横溢出。fit 相对可用容器居中留边；例如 1920 下设置栏 81px，stage=(72,81,1776,999)，左右各72px；2560 下左右各392px。不是把窗口当成舞台可用高度                                                                                                           |
| width / stretch / 设计尺寸更新                         | `browser/modes.json`：1366×768，1920×1440 的 width native wheel `scrollTop:0→326.5`，底部 footer 进入视口；返回栏始终可达。stretch stage=1366×687，独立轴比；再换1600×900得到实际样式与输出                                                                                                                                                                                      |
| 80% / 100% / 125% **真实 browser zoom**                | 最终 `browser/final-zoom/real-zoom.json`：通过 `chrome://settings/appearance` 的原生“网页缩放”select设定，DPR=1.6/2/2.5、innerWidth=2860/2288/1830；root/body transform:none、CSS zoom=1、visualViewport.scale=1，本轮未设置设备仿真/page scale。三态真实按钮点击、全部命中与边界检查；设置从100%开始并 finally恢复100%。settings snapshot与截图保存，快捷键未生效的探测不算PASS |
| 外层 light/dark × neutral/blue                         | `browser/final-theme/themes-resources.json`：四态 screen bg/text/cyan/panel/ease恒定、根 color-scheme:dark；实际切换展厅。7入口返回保留 dark/brand，desktop 实际新增“舞台返回项目”成功，所有返回后 Scaler=0，重入=1                                                                                                                                                              |
| 正常 / flow关闭 / reduced-motion                       | 同上 motion 数据和截图，原生勾选与留言按钮；scoped CSS animationName 后缀按实际编译结果记录，不当作业务失败                                                                                                                                                                                                                                                                      |
| 字体、图标和 SVG                                       | 实际请求 Inter latin 48,256B/HTTP200；CSS.getPlatformFontsForNode：中文 h1 为系统 PingFang SC，intro 中文亦为 PingFang SC，拉丁22 glyph 为自托管 Inter。6个SVG，defs/id/fragment refs均0，Header无伪button。不宣称未请求的其他Inter字体切片加载                                                                                                                                  |
| 深链刷新 / 返回 / 生命周期                             | 最终 round09 先 `/#screen/stage` reload，再真实点击7返回入口、各自回screen；重复resize阶段只有一份舞台，无残留fixed遮罩。没有设备或长时稳定运行外推                                                                                                                                                                                                                              |

四个主题的 **16 份真实 HTML/JS/CSS/font 响应**均 HTTP200，保存原字节并与最终 dist 比较相同：

| 响应                                     |  Bytes | SHA256                                                             |
| ---------------------------------------- | -----: | ------------------------------------------------------------------ |
| HTML                                     |    427 | `39f233cc79aba89224d5c8d209f6a4525cebceb657a76f64a4016e24b493e68d` |
| `index-R2DAA27h.js`                      | 526932 | `4d1692863e0fc1f0f3b152a27a07f0a9ba7cefb5407418542ad12125861372c2` |
| `index-xal6hYIh.css`                     | 245254 | `d6ba64af6d3bfe50e2ae8d9c3315c2b441ed1e510c4b93d5d757573843d1daa3` |
| `inter-latin-wght-normal-Dx4kXJAl.woff2` |  48256 | `3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62` |

页面资源观测全部为本地4190，无旧服务/路径/运行时CDN请求。其它表面仍在同一宿主 bundle 中，体积不是单独 screen 包大小。早期构建 `index-X86oZ9XL.js` / `index-BsYmWwAt.css` 是格式化前产物，原日志保留；最终几何/zoom/主题/资源均重新以 `R2DAA27h` / `xal6hYIh` 验证，不沿用旧移动 bundle。

[1920舞台](stage-1920.png)、[960舞台](stage-960.png)、[width到底](width-bottom.png)、[外层浅色蓝品牌](light-blue.png)。截图已实际查看；geometry、输入与响应原字节在外部 raw，而非只以图片判断通过。

## 保留的 FAIL、继承和 UNRUN

- RED：公开非法尺寸、嵌入容器测量、非有限公式输入、App深链分别失败后修复；日志未覆盖。
- 本轮 harness/维护 FAIL：首次两次类型检查分别因新增 ResizeObserver 桩断言类型、VTU `get().exists()` 写法失败；修正后build通过。scoped fmt初次使用`..`路径被工具拒绝，改绝对路径后通过。browser round08 的精确 animationName 断言忽略 scoped CSS 后缀而失败，修正观察器后 round10通过；保留原日志，不改生产动画去迎合测试。快捷键zoom无效不计PASS。
- 继承：T01固定来源与原研究、既有迁移/移动交付、历史 raw空白diffcheck2/冻结fmt1及前票异议保持原身份；未重新证明整个历史归档无格式问题。六个复用外壳实现未改，不等于本票交互未跑；本票列出的本地和browser均为fresh。
- UNRUN：CI、packed/versioned #11、完整文档站 #10、物理触控/扫码枪/软键盘/模拟器/设备、旧消费者接入/发布、父 #6 和其余六组组合验收。无独立merger结论，不merge、不close #58/#6/#1、不ready #18、不监控轮询。

原始脚本、逐轮stdout、RED/GREEN、资源响应和维护输出位于 `/tmp/nerv-ui-t05-a01/handoff/raw`；持久归档 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t05-a01`，最终回执为 `handoff/review-receipt.md`。归档只取本任务证据，不带 node_modules、cleancheckout、.vite 或 cache；自有浏览器/服务清理结果单列，任务工作树保留供独立merger。
