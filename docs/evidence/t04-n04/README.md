# T04/N04 六件手势、列表与轮播

对应 [#48](https://github.com/Mang-X/nerv-ui/issues/48)、父 [#5](https://github.com/Mang-X/nerv-ui/issues/5) 与已批准 [spec #1](https://github.com/Mang-X/nerv-ui/issues/1)。唯一实施工作树 `/Users/mang/Project/nerv-ui-worktrees/t04-n04-mobile-lists`，分支 `feat/t04-n04-mobile-lists`。本票只交付六件公开组件及 `/#mobile-lists` 中性宿主；无业务接口、SDK、新依赖或公共 API。父票、#49、#35、#43/#51 和 #11 不在本票验收结论内。

## 对象与来源

- 开工基线 HEAD `d730e76ac576baa7c1509a50af4857fd9370a5bd`，tree `15e1a96428c55ee33a85331feefef25f247a7d13`，工作区 clean；交付前 fetch 并 merge `origin/integration/nerv-ui-extraction`，仍为同一基线（Already up to date）。最终 head/tree 由 PR 及外部 `handoff.md` 固定，避免文档自引用 SHA。最终 frontend tree `adbb2ef1978322aa863221e5991182f8f7e04096`；响应回执及 `frontend-source.json` 对照实际源码/产物，后续只写根证据文档与原始附件。
- 旧源 `/Users/mang/.t3/worktrees/Nerv-IIP/t3-5c5dc61d` HEAD `79b1578f2b75f55709765b5e7882aaf33146c603`；只读对照，工作区保持零改动。`migration` 素材和 provenance 不改。
- `SwipeCell`、`InfiniteList`、`SwiperItem` 实现与固定旧源逐字节一致。`PullRefresh`、`VirtualList`、`Swiper` 的最窄修复及来源 SHA256 见 `dependencies.json`；未回传旧库，由 #14 评估同步。
- 宿主从裸 `@nerv-iip/ui-mobile` / `@nerv-iip/ui` 导入，沿用公共 CSS。`MobileListDemo` 只组装页壳；五个 `mobile-lists` 分片持有各自状态及定时器生命周期。

## Requirement | Evidence

测试仅访问 props、slots、公开 events 和渲染 DOM，不访问私有 vm。新增宿主逐片先 RED 后 GREEN；已有行为直接 GREEN，不伪造 RED。组件用合成 MouseEvent 命名的 pointer 事件验证状态，滚动指标在 jsdom 明确模拟；实际滚动/几何另由浏览器验证。

| Requirement                                                                        | Evidence                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SwipeCell 左滑展开、右滑关闭，纵向/取消不提交，稳定动作身份并关闭                  | `opens left, closes right and emits the selected stable action value once before closing`                                                                                                                               |
| 宿主接收两个动作的真实 value                                                       | `reports the selected swipe action identity and closes the row`                                                                                                                                                         |
| PullRefresh 阈值以下回弹、以上 refresh/model、loading 期间防重复、宿主清除 loading | `refreshes only beyond the threshold and holds until the controlled loading value clears`                                                                                                                               |
| 取消下拉不刷新                                                                     | `cancels a pull beyond the threshold without requesting refresh`                                                                                                                                                        |
| 非顶端起手，滚回顶部也不刷新                                                       | `does not start a refresh when a gesture began below the scroll top`                                                                                                                                                    |
| 顶端下拉方向由组件处理，离顶恢复原生双向滚动                                       | `keeps downward touch pulls at the top and restores native vertical panning below it`；浏览器 `round-07-red-touch.mjs` 的实际 touch RED 与最终四态场景 GREEN                                                            |
| 刷新完成、失败保留数据、重新下拉恢复与防重复                                       | `finishes or recovers a failed refresh and ignores another pull while loading`                                                                                                                                          |
| 原有 scrollTop、scrollRestoreKey 与滚动回报保留                                    | `恢复内部滚动位置并向外报告滚动`、`回报浏览器实际应用的滚动位置，并在列表高度代次变化时重试`                                                                                                                            |
| InfiniteList 距底部 81px 不触发、80px 触发一次；loading/paused/finished 分离       | `loads at the configured scroll boundary once and respects loading, pause and finished states`                                                                                                                          |
| parentScroll 哨兵、暂停/终页与卸载断开观察                                         | `在父滚动区模式以底部哨兵触发加载且不创建第二个滚动容器`、`父滚动区模式在终页或加载中不重复触发`、`暂停时不触发观察器加载，也不把可重试状态渲染为终页或加载提示`、`disconnects the parent scroll observer when removed` |
| 宿主加载中、防重复、失败暂停、重试、24 封结束后停止                                | `loads one page at a time, pauses after failure, retries and stops at the end`                                                                                                                                          |
| 空信箱、首批加载、重置取消待处理分页                                               | `shows an empty inbox, loads the first batch and cancels pending pagination on reset`                                                                                                                                   |
| 宿主卸载取消刷新/分页请求                                                          | `clears pending refresh and pagination timers when the page is removed`                                                                                                                                                 |
| VirtualList 高度变化更新窗口，卸载断开观察                                         | `updates its finite rendered window when the actual viewport resizes and disconnects on unmount`                                                                                                                        |
| 1000 条只渲染有限窗口、真实 item/index、重排、末项与空数据                         | `renders actual item identities in the scrolled window, updates reordered data and handles empty input`                                                                                                                 |
| 宿主以稳定 id 记住选择、倒序与空态                                                 | `renders a finite virtual window, selects the item identity and reflects host reordering and empty data`                                                                                                                |
| Swiper 外部 index 同步位移、不伪造 change；SwiperItem 真实 slot 文案               | `moves the rendered track when the host changes the controlled index without emitting a user change`                                                                                                                    |
| 手势 update:index/change、端点夹取、loop 双向回绕、纵向不切页                      | `emits controlled page changes for horizontal swipes, clamps the ends and loops only when enabled`                                                                                                                      |
| autoplay 开/关与卸载清理                                                           | `advances autoplay, stops it at zero and clears the timer on unmount`                                                                                                                                                   |
| 空/单页不产生自动轮播定时器或圆点                                                  | `keeps 'empty' slides still without autoplay timers`、`keeps 'singleton' slides still without autoplay timers`                                                                                                          |
| 宿主受控页、端点按钮 disabled、loop 与自动播放回显、卸载清理                       | `controls the carousel page, keeps end buttons disabled and clears autoplay when the host unmounts`；Swiper 本身没有 disabled API                                                                                       |
| 新路由直达、五个旧入口可达且各入口反向导航                                         | `opens mobile lists directly and navigates through all five existing entries`                                                                                                                                           |

## 原始失败与修复

全部 stdout/stderr 保留于 `logs/`，外部原件 `/tmp/nerv-ui-t04-n04`，不删除或清洗 ANSI、CSS/PURE warning。

| 原始 RED / FAIL                                         | 实际观察与处置                                                                                                                                           |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `red-swiper-index.log`                                  | 外部 index=2 时实际 transform 仍为 0px，预期 -600px；index watcher 后 `green-swiper-index.log` PASS                                                      |
| `red-pull-cancel-public.log`                            | pointercancel 后实际发出 refresh；取消路径分离后 `green-pull-cancel.log` PASS                                                                            |
| `red-pull-start-below-top.log`                          | 非顶端起手后回顶误发 refresh；记录起手资格后 `green-pull-start-below-top.log` PASS                                                                       |
| `red-virtual-resize.log`                                | 240→480px 后仍 9 行，预期 14 行；ResizeObserver 后 `green-virtual-resize.log` PASS                                                                       |
| `browser-07-red-touch.log`                              | 实际 Chromium 合成 touch 在顶端下拉由 pan-y 接管，pointercancel，刷新请求数不变；顶端方向性 touch-action 后最终浏览器矩阵验证刷新与原生上划滚动          |
| `red-host-swipe.log`                                    | 新页面模块尚不存在，属于脚手架缺失，不声称既有组件行为失败                                                                                               |
| `red-host-refresh/pagination/window/carousel/route.log` | 每片新增宿主/导航尚不存在时对应公开输出失败；各 `green-host-*` 日志逐片通过                                                                              |
| `red-pull-cancel.log`                                   | VTU trigger 尝试写只读 clientY，属于测试事件构造错误；改为标准 MouseEvent dispatch 后才取得上述产品 RED                                                  |
| `component-direct.log`                                  | 未回灌 v-model、it.each 数组被展开造成测试参数错误；修正测试支撑后 `component-direct-corrected.log` 16 PASS，不作为产品修复证据                          |
| `typecheck-build.log`                                   | 测试 slot 把 unknown 缩为 string，不符合泛型/未声明 slot 类型；修正测试类型后 build 通过                                                                 |
| `host-final-focused.log`                                | mount 后共享主题初始化尚有计时，预期计时数错误；先完成初始化再观察宿主两个待处理请求，`host-final-focused-corrected.log` 13 PASS                         |
| `final-mobile-behavior.log`                             | 新 touch-action 测试未等待 mount 的公开 scroll restore，scrollTop=100 被初始恢复覆盖；等待 mount 恢复后 `final-mobile-behavior-corrected.log` 108 PASS   |
| `browser-02.log`                                        | 新轮未重设 viewport，测到 2320×1245；对应截图保留为 invalid，不计入 390px 验收                                                                           |
| `browser-04.log`                                        | 已展开行的移动内容中心在裁剪区外；改从实际可见 SwipeCell 触点拖动后通过                                                                                  |
| `browser-08-green-touch.log`                            | 刷新成功后回弹动画尚未结束即取第二手势触点，触到外层；`browser-10-touch-diagnostic.log` 等待回弹/核对 hit 后原生内层滚动 153px；最终矩阵重新完整执行     |
| `t3-preview.log`                                        | 本轮 status/open/navigate 后，snapshot 同步连续两次 `Preview automation snapshot timed out after 15000ms.`，按约定转 ego-browser；未把工具超时当产品失败 |

## Fresh 门禁

pnpm 固定 11.22.0，任务局部 `/tmp/nerv-ui-t04-n04/bin/pnpm` 转发 corepack，所有嵌套脚本保留 PATH。安装前本任务树不存在 node_modules，`install --frozen-lockfile` clean 安装成功，未使用全局 pnpm 12、未升级依赖。

| 项目                      | 结果及日志                                                                                                                                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 初始移动组件基线          | 17 文件 / 94 PASS；`baseline-mobile.log`                                                                                                                                                                   |
| 最终移动行为              | 21 文件 / 108 PASS，0 skip/fail；`final-mobile-behavior-corrected.log` 和 JSON                                                                                                                             |
| 移动命名/runtime 契约     | 6 PASS；`mobile-naming.log`                                                                                                                                                                                |
| 移动静态文档              | 2 PASS；`mobile-staticdocs.log`，不替代动态行为                                                                                                                                                            |
| UI 行为/契约              | 43 文件 / 644 PASS；`ui-behavior-contracts.log`                                                                                                                                                            |
| UI 静态文档               | 6 PASS；`ui-staticdocs.log`                                                                                                                                                                                |
| 最终宿主                  | 7 文件 / 66 PASS；`final-host.log` 和 JSON                                                                                                                                                                 |
| 三包 vue-tsc 与生产 build | `final-build.log` exit 0；UI/mobile/playground 的 typecheck 串行，宿主生产构建；ui/mobile 当前是源码 exports，无单独包 bundle，不假称三个包各自产物 build                                                  |
| scoped fmt/lint           | 最终记录见 `checks.json`；早期相对路径含 `..` 被 fmt 拒绝的日志保留，不修改配置绕过                                                                                                                        |
| 依赖与 Vue                | 16 份 manifest/lock/workspace 文件与基线全字节一致，完整保留 973 packages/973 snapshots 及全部边/peer/optional 内容；三包实际 Vue 3.5.39 同 realpath、同模块对象；`dependencies.json`、`lock-objects.json` |

初版行计数脚本漏算 433 个 inline 空 snapshot，曾打印 snapshots=540；没有锁文件变化。随后用已安装的 YAML parser 对完整基线/当前对象 deepEqual，确认 packages=973、snapshots=973；以 `lock-objects.json` 与 16 份全字节比较为准。

全量 `git diff --cached --check` 实际 exit 2，仅原始日志的 EOF 空行/尾空白（`diffchecks.json`、`logs/full-diffcheck.log`）。源码及人工文档 scoped diffcheck exit 0；不删原始日志装绿。

## 浏览器与边界

最终矩阵与产物资源回执在 `browser/`、`resources.json`；实际测量 CSS viewport、深浅主题、scroll parent 的 client/scroll 尺寸、geometry/hit、内部滚动与有限 DOM。鼠标拖动/点击和 wheel 是 Chromium 输入；touch 使用 CDP Input.dispatchTouchEvent，属于浏览器合成 touch，明确不等于物理触摸或设备认证。没有用脚本 scrollTop 赋值替代真实浏览器手势；jsdom 的赋值仅为组件测试输入。

顶端方向性 touch-action 的解释参考 [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action)：pan-down 放行内容向下滚动（手指向上），将向下拉动保留给组件；方向在起手前确定，不能靠手势中更改来夺回已取消的指针。实际 Chromium 结果以保存的事件与输出为准。

最终状态：四态各 6 组交互完整 PASS（390×844 / 844×390，light / dark），共 24 组，24 张最终截图；所有步骤实际 viewport/theme、无横溢出、内层滚动尺寸与输出见 `browser-matrix.json` 和 `browser/final-*.json`。分页未完成与 autoplay 开启时，通过平台 timer 账本和公开 hash 导航验证卸载，1+1 个计时归零且等待 1800ms 无迟到回调；五个旧入口实际点击往返，重入页状态与 scrollTop 均重置。实际加载的 HTML、JS、CSS、Inter 字体共 4 个响应全部 200，并与最终 build 全字节一致；其余未请求的字体仅记录磁盘 SHA256，不假称浏览器加载，见 `resources.json`。physical touch、iOS/Android、PDA、非零硬件安全区、CI、版本化安装产物、发布与旧仓接入均 UNRUN。本轮实现行为/浏览器使用 fresh；无继承 browser PASS。初始来源与既有实现事实注明为继承，对其动态行为的本轮测试是 fresh。

任务资源已清理：ego TaskSpace 9 finish、T3 tab 关闭、4184 预览服务 PID 48436 停止且无监听，见 `cleanup.json`；保留任务 worktree 给独立 merger。本实施者不合并 PR、不关闭 #48/#5/#1、不 ready #18、不监控或轮询。独立审查由父 controller 的下一席负责。
