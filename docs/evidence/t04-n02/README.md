# T04/N02 输入、扫码与数字键盘证据

R1 material F1 的后续修复与最终增量验证见 [F1 记录](f1/README.md)。本页保留原实施证据与当时边界，旧 JS 交互不计作修复 head 的 fresh。

对应 [#46](https://github.com/Mang-X/nerv-ui/issues/46)，只覆盖父 [#5](https://github.com/Mang-X/nerv-ui/issues/5) 的 N02 12 件。直接入口 `/#mobile-input`，`/#mobile` 点击“随心记录”也可进入。桌面、`/#touch`、`/#mobile` 保留。PR 目标为 `integration/nerv-ui-extraction`；本实施席不合并、不关票、不轮询。

工作树 `/Users/mang/Project/nerv-ui-worktrees/t04-n02-mobile-input`，分支 `feat/t04-n02-mobile-input`。开工 clean，基线 `a20825e0477f446737a6bfc07d84b8ec20a143b6`，tree `b5878a6c46faac1384ec15bc5de3a5dea0908cfc`；提交前重新 fetch 后 integration 仍为该 tip。原始记录 `/tmp/nerv-ui-t04-n02`。最终 head/tree 以提交和 PR 为准；[运行身份](runtime-identity.json) 固定实际验证源码 SHA256，[资源身份](artifact-identity.json) 固定实际 HTTP 响应与本地 dist。

## 实现与来源

`MobileInputDemo` 负责入口、主题与焦点所有权；`mobile-input/MobileInputFields` 负责中性表单，`MobileCaptureInput` 负责扫码、readonly 数值输入与键盘/宿主浮层生命周期。使用公共裸包和 N01 样式入口，无服务端、业务模型、SDK、新依赖或 importer。

T01 原始来源仍为 Nerv-IIP `79b1578f2b75f55709765b5e7882aaf33146c603`，原路径 `frontend/packages/ui-mobile`，逐文件来源仍见 [T01 provenance](../../../migration/t01/README.md)。N01 包/CSS/页壳及 FAB 适配是已集成基线。除 `MobileSlider.vue` 的一行 disabled 守卫，其余 67 个已跟踪移动源码/测试/样式文件与开工基线完整字节相同；不改写 migration 原始材料。本票未回传旧仓，滑块修复由 #14 消费者接入时评估同步。

滑块新公开回归先观察 `disabled=true` 后 pointermove 仍把 30 改为 90 的 RED，再添加最窄守卫，2/2 GREEN。扫码原有 100ms/300ms、最短捕获突发、原生 input 接管、残片清理及手工草稿保留逻辑没有修改。

## RED→GREEN 与行为接缝

| Requirement                                                            | Evidence                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 独立入口并保留旧入口                                                   | `opens mobile inputs directly and keeps the shell, desktop and touch routes reachable`；[入口 RED](red-entry.log) → [GREEN](green-entry.log)，最终 host 套件重跑                                                                                                                |
| 文本 attrs/slots、搜索 Enter/清除/取消 → DOM                           | `reflects native text and search events in the host, including clear and cancel`；[RED](red-text-search.log) → [GREEN](green-text-search.log)                                                                                                                                   |
| 动态单选重排、焦点与外部值重置；开关/复选                              | `keeps selection identity through option reordering and external value changes`；[RED](red-selection.log) → [GREEN](green-selection.log)；快速 keyup 残留见 #51                                                                                                                 |
| 步进编辑/blur 上下界、半星清零、滑块键盘/锁定、按钮事件                | `edits steps, half ratings and slider values, locks them and receives button actions`；[RED](red-adjustments.log) → [GREEN](green-adjustments.log)                                                                                                                              |
| 手工/捕获扫码与缓冲清空，普通编辑/表单按钮焦点让出并恢复，手工草稿保留 | `submits manual and captured scans, yields to ordinary fields and resumes without losing manual drafts`；[初始 RED](red-scan-focus.log)、[单选焦点失败](green-scan-focus.log)、[后补星形/保存按钮 RED](red-form-control-focus.log) → [最终 host GREEN](host-behavior-final.log) |
| readonly 字符串键盘、前导零/小数/长度/删除/sign/extra/confirm          | `edits keypad strings with decimal, sign, limit, delete and alternate extra keys then confirms`；[RED](red-keyboard.log) → [GREEN](green-keyboard.log)                                                                                                                          |
| Sheet/Dialog 期间不夺焦；键盘确认保留抽屉；宿主关闭同步关闭键盘        | `yields scan focus to sheets and dialogs, keeps keypad confirmation inside the sheet and closes nested input with its host`；[RED](red-overlay-focus.log) → [GREEN](green-overlay-focus.log)                                                                                    |
| 滑块指针步长/双端夹取、动态范围与外部值                                | `quantizes pointer drags, clamps both edges and uses updated range and controlled value`；首次就是既有能力 GREEN，不伪造 RED                                                                                                                                                    |
| 拖动中禁用阻止后续发值、再启用接受新手势                               | `stops an in-flight pointer edit when the host disables the slider and accepts a later re-enabled gesture`；[真实 RED](slider-public-red.log) → [GREEN](slider-public-green.log)。另保留 [VTU/jsdom 事件构造错误](slider-harness-error.log)，它不是产品 RED                     |

宿主焦点回归控制 RAF；公开滑块只控制 jsdom 几何，以原生 PointerEvent 分发到公开 DOM。没有组件 stub、私有 vm 方法断言或逐 prop 镜像。测试依赖沿用现有 Vitest/VTU，未配置额外报告器。code-testing-extensions 与 named test-engineer 在本运行时不可用；Research/Plan/最终审查保存在该 worktree Git metadata 的 `testagent/`，不进版本库。

## fresh 门禁

全部重型命令串行；PATH 前置 `/tmp/nerv-ui-t04-n02/bin`，shim 转发 `corepack pnpm@11.22.0`，nested 实测同版。开工没有 node_modules，首次 frozen install 成功。

| 命令（均 `pnpm -C frontend` 前缀）                                               | fresh 结果                                           | 记录                                  |
| -------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------- |
| `--filter @nerv-iip/ui test`                                                     | 43 files / 644 tests PASS                            | [UI](ui-behavior.log)                 |
| `--filter @nerv-iip/ui-mobile exec vp test run src/components`                   | 13 files / 75 tests PASS，原有 11 组、N01 FAB 均执行 | [mobile 行为](mobile-behavior.log)    |
| `--filter @nerv-iip/playground test`                                             | 最后宿主焦点修复后 5 files / 32 tests PASS           | [host](host-behavior-final.log)       |
| `--filter @nerv-iip/ui-mobile exec vp test run src/nvui-naming.contract.test.ts` | 6 PASS                                               | [命名](mobile-naming.log)             |
| `--filter @nerv-iip/ui-mobile test:docs`                                         | 静态 2 PASS                                          | [mobile docs](mobile-static-docs.log) |
| `--filter @nerv-iip/ui test:docs`                                                | 静态 6 PASS                                          | [UI docs](ui-static-docs.log)         |
| `build`                                                                          | 最后宿主修复后三包 vue-tsc + build PASS              | [build](build.log)                    |
| `exec vp fmt --check <9 个受影响源码>` / `exec vp lint <同批>`                   | PASS                                                 | [fmt](format.log)、[lint](lint.log)   |

UI/mobile 的执行后只改宿主焦点与文档，没有再改库源码；最后 host、三包类型、build、fmt/lint 已重跑。jsdom `Could not parse CSS stylesheet` 和构建第三方 pure annotation 警告保留，命令均 exit 0；不把 jsdom 当作 CSS 布局验证。格式化一度把模板内多语句事件折行导致解析失败，已改为具名函数；[该失败](host-format-expression-failure.log) 保留。入口顺序调整后的测试误取第一个输入也保留于 [选择器失败](host-reordered-input-selector-failure.log)，最终按标题输入身份定位。

原始 `.log` 保留 ANSI、行尾空白和末尾空行，未为 Git whitespace 检查改写证据。[全量 diff 检查](diff-check-raw.log) 因这些原始日志返回 2；排除该证据目录的 `.log` 后，代码、文档和其它数据的 staged diff 检查通过。源码 fmt/lint 与三份人工 Markdown 格式检查独立通过。

[依赖与源码审计](dependency-source-audit.json) 比较 **16 份全部保留 manifest/lock/workspace 文件完整原始字节及 SHA256**，全部不变，含 inactive 素材；本票无需新增图或升级解析。[实际解析](runtime-identity.json) 证明 UI/mobile/host 共用一个物理 Vue 3.5.39，两个包从本工作树公共入口解析。不是 keys-only 检查。

## fresh 浏览器

T3 自有 tab 的同一步快照连续两次 `Preview automation snapshot timed out after 15000ms.`，且 resize 实际读回 1280×800，见 [错误记录](preview-errors.txt)。按授权回退 ego TaskSpace 31 / p1；完成后已 `finish({keep:[]})`。Chromium desktop UA，使用 CDP 设置 CSS viewport、分发真实鼠标/文本/键盘输入及截屏；不能等同手机或物理扫码设备。

[四态矩阵](browser-matrix.json) 与 [执行日志](browser-12.log) 每行均读取实际尺寸并完成：原生编码输入/Enter、普通标题焦点、抽屉文字输入、readonly 键盘编辑、confirm 保留抽屉、关闭后扫码恢复、键盘 z=70 > Sheet z=50、按键中心 hit-test、文档和实际 main 滚动容器无横溢出。四态各 33 个宿主控件完成几何/hit 检查；折叠搜索操作按钮不在该遍历内，其真实搜索/清除/取消由独立交互证明。既有 Stepper/sm Button/Switch 不都达到 44px，不声称全库触点达标；键盘按键均 ≥44px 且命中自身。

| CSS 视口 | 主题 / 模式             | 数值确认 | 截图                                    |
| -------- | ----------------------- | -------- | --------------------------------------- |
| 390×844  | 浅 / decimal+sign       | `-05.2`  | [竖屏浅色](portrait-light-overlay.png)  |
| 390×844  | 深 / digits，extra 隐藏 | `05`     | [竖屏深色](portrait-dark-overlay.png)   |
| 844×390  | 浅 / X                  | `0X`     | [横屏浅色](landscape-light-overlay.png) |
| 844×390  | 深 / decimal+sign       | `-0.5`   | [横屏深色](landscape-dark-overlay.png)  |

[表单 native 交互](browser-input-form-final.json) 保存 title=`海边来信`、扫码=`WEDGE`、步进 5、评分 3.5、进度 90、选择 pocket 和保存回显；trusted input/key/click 事件单独记录。只有 blur→RAF 窗口中的 document 突发使用合成 KeyboardEvent，逐项 `isTrusted=false` 已明确记录；不是硬件认证。[键盘/浮层](browser-keyboard-overlay.json) 与 [层级数据](browser-keyboard-layers.json) 记录实际 readonly/inputmode/autocomplete、13 键 hit、字符串 `-01.2` / `0X2` / `0X27`、抽屉草稿保留、Escape 联合关闭、Dialog 输入与扫码恢复。[四个入口](browser-routes.json) 也 fresh 读回。

[资源响应](browser-responses.json) 中产品 HTML/JS/CSS/Inter font 共 4 项均 HTTP 200，SHA256 与本地 dist 全字节一致；运行数据身份为 title/scan=`landscape-dark`、number/confirm=`-0.5`。另一个 chrome-extension fetch-interceptor 响应单列为浏览器 instrumentation，不计入产品资源。[资源/PNG 身份](artifact-identity.json) 记录 URL、类型、长度、SHA256 和 9 张截图的实际 PNG 尺寸。图片已实际查看。

所有未成功尝试和边界说明见 [浏览器失败保留](browser-validation-notes.md)。首张错误桌面尺寸图片只在 raw `/tmp/nerv-ui-t04-n02/invalid-desktop-portrait-attempt.png`，不计入手机证据。动画期间误点、原生 select 弹出后 RAF 等待停滞、后续 cleanup 重开目标缺失均未覆盖为产品 PASS；之后独立完成指定接缝，完整四态结果才记 PASS。

## 继承、残留与 UNRUN

继承仅指 T01 provenance、N01 已集成来源及既有组件能力，不把旧执行结果当 fresh。新的宿主接缝有实际 RED→GREEN；公开滑块实际缺陷已窄修。

**残留：[#51](https://github.com/Mang-X/nerv-ui/issues/51)**，Reka 单选方向键快速 keyup 可能早于其 `setTimeout(0)` 检查，导致 focus=pocket、selected=desk。[原始失败](browser-05.log) 保留，[等待异步焦点再 keyup](browser-06.log) 的成功也保留，不相互覆盖。本票没有升级或重写依赖，也没有宣称该边界通过；由父代理裁决后续门禁关系。

UNRUN：CI、物理 PDA/扫码枪、系统软键盘不弹认证、非零硬件安全区、#11 版本化产物安装、完整文档站 #10、N03–N05 整组验收、旧消费者/旧全栈 #14、#43。父 #5 保持 open，其余子项不提前完成。本票提供独立实现 PR，独立 merger 仍由父代理安排。
