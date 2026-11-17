# T04/N03 / #47 实施证据

范围仅 [#47](https://github.com/Mang-X/nerv-ui/issues/47) 的 8 件移动选择/浮层。入口 `/#mobile-overlays`，`/#mobile` 内“片刻安排”可达；四个既有入口保留。没有业务接口、认证、路由复制、新依赖或万能浮层框架。

- 基线：`0e487bdbb51c9d041b71576f41585ac80244f2c1`，tree `546ba2ca4f38c3bd0b60d9d00482cb918270e57e`，初始 clean，分支 `feat/t04-n03-mobile-overlays`。
- 真实工作树：`/Users/mang/Project/nerv-ui-worktrees/t04-n03-mobile-overlays`；原 Nerv-IIP 未写入。
- 最终源码候选对象：tree `7c5417353c00bef64d0f2ffdaf68de45d6657dd1`（归档前的候选；最终提交还加入本目录和文档文字）。最终 head/tree 回到 PR 和实施交付回执，避免文档自引用本提交 SHA。
- 原始记录与操作脚本：`/tmp/nerv-ui-t04-n03`。本目录日志是原字节副本；没有覆盖旧失败。中间研究/计划/状态留在 worktree Git metadata 的 `testagent`，不纳入提交。

## 实现与来源

`MobileOverlayDemo.vue` 仅组合入口；`mobile-overlays/OverlaySelections.vue` 持有去处/日期，`OverlayPanels.vue` 持有草稿和浮层/键盘生命周期，`OverlayDetails.vue` 持有动作/下拉/折叠状态。宿主从公共裸包导入并复用现有 CSS。

组件实现仅改 `NvPicker`、`NvMobileDatePicker`：修复受控初始打开/外部更新的滚轮同步，按 value 保留重排草稿、删除草稿项后回退，以及年界和合法月末夹取。未改 BottomSheet 的手势、层级、焦点实现，也未改 Dialog/Reka 或 NumberKeyboard。来源为 T01 基线上的活动源码；没有回写迁移 provenance 或旧仓，由 #14 接入时评估同步。

八件实际 API 没有 loading/disabled 选项能力，因此没有虚构这些属性；Picker 空项不发值，日期边界是 minYear/maxYear（不是日期级 min/max）。Collapse 的标题和内容通过 slots 提供；Dropdown 是组内面板，不冒充 Teleport。

## Requirement | Evidence

下表用例均经真实组件/宿主 DOM 和公开事件验证；不访问私有 vm、不用源码快照。测试源码保留在对应包和宿主，日志见下文。

| Requirement                                                       | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BottomSheet 的关闭、焦点、手势与键盘优先层                        | `sheet restores focus to the actual opener after Escape and leaves no modal`；`sheet retains small drag snapback and downward dismissal through public pointer events`；宿主 `keeps sheet edits as drafts, gives the numeric layer priority and removes it with the host sheet`                                                                                                                                                                                                                                                             |
| ActionSheet select 的稳定身份、重排与取消不选择                   | `action cancellation never selects and reordered actions emit their stable value once`；宿主 `receives action identity after cancellation and keyed reordering without guessing from labels`（公共件以同名 label/不同 value 防止猜标签）                                                                                                                                                                                                                                                                                                    |
| Picker 初始/外部 value、keyed options、删除、空态与取消           | `initializes an already open picker from the public value and commits it on confirm`；`resynchronizes external value and keyed option order while open without emitting a commit`；`preserves a scrolled draft by value across keyed reordering and falls back after its removal`；`discards a scrolled draft on cancel and confirms empty options without a value event`；宿主 `commits the picked identity only on confirmation and leaves empty choices unsubmitted`                                                                     |
| DatePicker 真实 YYYY-MM-DD、年界、闰年/月末与取消                 | `initializes an already open date and keeps a shorter month valid before confirming`；`clamps the day when changing from a leap year and resynchronizes external dates and year bounds`；`keeps an out of range external year inside the advertised bounds on confirmation`；`cancel emits only close after wheel changes and reopening restores the external date`；`leaves an in-progress day wheel position to native scroll snap until the gesture settles`；宿主 `keeps date drafts separate and commits a real bounded calendar date` |
| Dialog confirm/cancel/close 分离、默认遮罩守卫、opt-in、焦点/键盘 | `dialog emits confirm, cancel and close as distinct public events`；`dialog keeps its default overlay guard and closes only on an opted-in outside pointer`；`dialog restores focus to the actual opener after Escape and leaves no modal`；宿主 `submits dialog content only on confirm and distinguishes cancel from Escape dismissal`                                                                                                                                                                                                    |
| DropdownMenu/Item 组内单开、遮罩、数字身份及 keyed 重排           | `dropdown keeps group ownership across keyed reordering and preserves number identity on change`；宿主 `keeps one dropdown open, receives the typed value and controls collapse slots from the host`                                                                                                                                                                                                                                                                                                                                        |
| Collapse 受控状态、外部更新、title/default slots                  | `collapse renders both slots and follows external open changes and its public toggle`；同一宿主下拉/折叠测试断言外部“收起提示”回传到 aria-expanded                                                                                                                                                                                                                                                                                                                                                                                          |
| 公开 MOBILE_OVERLAY_TARGET 和宿主卸载                             | `sheet uses body by default and accepts selector and element overlay targets`；`dialog uses body by default and accepts selector and element overlay targets`；宿主 `removes all teleported layers when the overlay page is unmounted`；浏览器在 Sheet+Keyboard 打开时导航离页检查无遗留层/背景锁                                                                                                                                                                                                                                           |
| 直接入口与既有四入口                                              | `opens the standalone overlay page directly and preserves all four existing entries`；原 App 四入口测试保留，浏览器逐入口核对实际 heading                                                                                                                                                                                                                                                                                                                                                                                                   |
| 依赖/公共导出/样式边界                                            | 16 份 manifest/lock/workspace 全文件字节 SHA256 相等，`dependency-runtime-audit.json`；实际 Vue 身份单一；host import contract、命名6及静态 docs2+6；`artifact-identity.json` 对应最终构建和实际浏览器资源响应                                                                                                                                                                                                                                                                                                                              |

## RED、失败历史与修复

- `entry-red.log` → `entry-green.log`：新 hash 原先落入通用 mobile 分支，新入口独立接入。
- `host-selection-red.log`、`host-panels-red.log`、`host-details-red.log` → 对应 GREEN；新宿主行为缺失时先失败，再实现各模块。后续完整 host 52 PASS。
- `picker-red.log`、`date-red.log`：各 2 FAIL/1 PASS；最终测试套件对原始组件重新验证，`selection-final-tests-original-source-red.log` 为 6 FAIL/2 PASS。恢复本票窄修后 mobile 全部通过。取消/空态等原本已通过行为按 baseline 记录，不伪造 RED。
- 测试写法修正原记录保留：`picker-green.log` 错误要求未变化的 defineModel 值重复 emit；`picker-green-corrected.log`/`date-green.log` 的无监听 model 在 confirm 后已本地关闭，测试补显式 reopen；`host-panels-green.log` 的 VTU pointerdown 只读 button 属性改用原生 MouseEvent dispatch；`build.log` 的 `get().exists()` 类型错误改为 `find().exists()`；末次类型/build 通过。
- [提交前窄审](local-readonly-review.md) 对 tree `ab29e5054b74f5179748d5115573e38a3db3701d` 提出 P2 **1**、optional **1**、Critical **0**。P2 为本票新增的日列提前回写，`review-day-wheel-red.log` 公开 DOM 复现 58→40（1 FAIL/4 PASS）；窄修为年月滚动才校正日列，`review-day-wheel-green.log` 5 PASS。原报告和 [响应](review-response.md) 保留；optional 的证据入口在本次归档补齐。没有将 R1 报告改成 0，也未宣称独立 merger/R2 已通过。
- Browser 原始失败见 `browser-*.log` 与 `preview-errors.txt`。T3 snapshot 同一步两次 `Preview automation snapshot timed out after 15000ms.` 后切换 ego。早期高层动作重设视口，记录实际 2320×1245，不计手机验收；后改为每步断言实际视口的 CDP 输入。另保留坐标误点键盘、选全文快捷键无效、重复按钮定位、窗口最小化/targetId 缺失、等待无限动画等 harness 失败；均未为此修改产品或延迟输入。

## Fresh 门禁

Node / pnpm 以日志为准；task-local `bin/pnpm` 转发 `corepack pnpm@11.22.0`，nested scripts 继承同一 PATH。无新 manifest/lock，frozen 安装成功。

| Lane                                                   | 实际结果            | 原始记录                                                                                                                 |
| ------------------------------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| UI 行为                                                | 43 files / 644 PASS | `ui.log`（之后仅 mobile 日期一行窄修，UI 源码字节未变，未无意义重跑 UI）                                                 |
| Mobile 行为（最终窄修后）                              | 17 files / 94 PASS  | `mobile-post-review.log`，旧92/93及失败保留                                                                              |
| Host 行为（最终窄修后）                                | 6 files / 52 PASS   | `host-post-review.log`                                                                                                   |
| Mobile 命名/runtime                                    | 1 file / 6 PASS     | `naming-post-review.log`                                                                                                 |
| Mobile static docs                                     | 1 file / 2 PASS     | `mobile-docs-post-review.log`，仅静态可发现性                                                                            |
| UI static docs                                         | 3 files / 6 PASS    | `ui-docs-post-review.log`，没有运行完整文档站                                                                            |
| 三包 vue-tsc + playground build（最终）                | exit 0              | `build-post-review.log`；保留第三方 PURE annotation 警告                                                                 |
| scoped 源码 fmt/lint、文档格式、完整/scoped diff-check | 以最终检查摘要为准  | `verification-summary.json`；raw ANSI 尾空白及浏览器日志 EOF 空行导致 full diff-check 非零时单独报告，绝不覆盖成源码全绿 |

## 最终产物真实浏览器

最终四态结果为 `browser-matrix-post-review.json` 和 `browser-19-final.log`；该轮重新加载最终构建后执行，不沿用修复前 bundle 的四态结果。实际脚本、动作历史和历史中断均在 raw 目录保留。

- 四态：390×844 / 844×390，各浅色与深色。每步及截图前断言 `innerWidth/innerHeight`，最终文档无横向溢出，Dialog/Keyboard 实际中心点 hit-test 成功。
- 每态均用真实浏览器鼠标、键盘与滚轮完成：Picker 草稿取消/确认/空选项；日期 `2024-01-31 → 2024-02-29 → 2025-02-28`；Sheet+Keyboard 输入、键盘背板只关闭键盘、Escape 同步移除高层输入、安排取消/提交；Dialog 遮罩保留、Tab 圈定、取消/提交/Escape 不提交与恢复实际 opener；动作取消/重排后 select 身份；Dropdown 单开/数字值/真实遮罩 hit；Collapse 展开和内容按钮收起。
- BottomSheet 鼠标拖动把手的小幅 snapback/大幅关闭另见 `browser-portrait-details-final.json` / `browser-07.log`；此源码及 CSS 在最终修复前后逐字节未变，作为明确继承的 native mouse drag 记录。公开合成 pointer 测试在最终 mobile94 内 fresh，通过不等于实体触摸验证。
- `browser-routes-final.json` 记录原四入口及新增入口；Sheet+Keyboard 打开时由浏览器导航离页后无遗留 dialog/layer 和背景 pointer-events 锁。
- `browser-responses-final.json`/`artifact-identity.json` 保存真实本地构建资源响应与 SHA256/内容字节比对；fixture 为内存 lake/woods/garden、2023–2025 年、save/archive，无后端或业务数据。当前是 workspace 源码构建，不能替代 #11 安装产物。

浏览器使用桌面 Chromium 的 CSS 视口和 CDP trusted mouse/key/wheel 输入，启用浏览器焦点模拟以稳定采样；没有调用 HTMLElement.focus 或 DOM scroll。临时 DOM data 属性仅用于定位已观察到的按钮，未访问组件私有状态。测试里的 scrollTop 赋值/合成 pointer 是 JSDOM 接缝，不能当作物理手机滚轮/触摸认证。无物理 PDA、扫码枪、系统软键盘、非零安全区或触摸惯性/滑动认证。

## 未运行与待下游

CI、产物 #11、旧仓接入 #14、旧栈/设备、完整 docs、独立 merger/R2、合并和 tracker 完成均 **UNRUN**。父 #5 保持 open；N04 #48/N05 #49 与 T08 上层组合没有提前验收。继承问题 #51（Reka 快速 keyup）与 #43 保持独立，不升级 Reka、不掩盖历史失败。没有发现本组外需新增票的产品缺陷。

最终 frontend 子树：`b2c22df3e379bfdca0a572b92d027b251f9fa71a`；实际响应 index HTML、新 JS、新 CSS 与字体共 4 份，均 HTTP 200 且逐字节等于最终构建。其余 10 个构建文件的 SHA256 记录于 artifact identity，不把未加载资源称为浏览器已请求。
