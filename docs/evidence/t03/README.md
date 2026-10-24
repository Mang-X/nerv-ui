# T03：触屏独立演示与验证

范围为 [#4](https://github.com/Mang-X/nerv-ui/issues/4)，按批准的 [spec #1](https://github.com/Mang-X/nerv-ui/issues/1) 公开组件 / 真实独立宿主接缝实施。起点与最终同步的 integration 均为 `a482af3826f611bab11f608139860b7f9a29891a`，tree `a9de6d1ed13a20b905c2ce54814a810d18cef822`；开工 clean。交付 head 由子 PR 固定，实际验证源码和产物 SHA-256 见 [文件身份](validated-files.json)，避免把随后新增的证据文档描述为构建输入。

## 演示入口与边界

```sh
corepack pnpm@11.22.0 -C frontend install --frozen-lockfile
corepack pnpm@11.22.0 -C frontend dev
# 浏览器访问终端输出地址的 /#touch；桌面页也有“触屏演示”链接。
```

独立模块为 `frontend/apps/playground/src/TouchDemo.vue`，仅从 `@nerv-iip/ui` 主桶消费五个既有公开件；继续使用 T02 的 workspace 与 `styles.css`，没有新增依赖、workspace、registry、token 或框架。中性身份 `R-01 / 共享阅读角`；阅读本数初始 2、范围 0–5；时长初始 10、范围 5–18、步长 5；选择为阅读/聆听/休息。数据只在内存中；刷新重置数据，主题沿用库原有 localStorage。

- NvTouchButton：七种语义、44/56/72px 三尺寸、整宽、leading/default slot、显式 disabled、可手动结束的 loading，以及普通 `as="a"` / `asChild` 链接。
- NvQtyStepper：受控回显、上下限禁用、默认与自定义步长及触界 clamp。
- NvTouchSegmented：受控选择、单一 Tab 入口、左右循环、Home/End，以及对应内容。
- NvStatTile：五种 tone、数字/字符串、unit 和 default slot；NvStationBar：五种状态 tone、文字、pulse 和 right slot 内主题控制。

只改演示涉及的实际缺陷：默认按钮 loading 现在禁用原生激活，`as="a"` 的 loading/disabled 阻止激活；分段补键盘与 roving tabindex，整体仍为 48px，内部 padding 从 4px 改为 2px，让实际目标由 40px 增至 44px。公开名称/导出不变，原版 shadcn、CSS 层序与来源材料未改。新库修复尚未回传 Nerv-IIP；回传评估由后续原库接入票承担。

`asChild + loading` 的既有属性落点缺陷已另建 [#43](https://github.com/Mang-X/nerv-ui/issues/43)，未借本票改渲染机制；本演示不使用该组合。T03 不覆盖其他表面、完整文档站运行或版本化包安装 #11。

## RED → GREEN

每轮先运行失败接缝，再补该轮实现。原始日志均在 `/tmp/nerv-ui-t03`，未覆盖 T02/F1 或 migration 来源。

| 接缝 | 实际 RED | GREEN |
| --- | --- | --- |
| 默认按钮 loading | `button-red.log`：原生 `disabled` 为 false | `button-green.log`；后续整套回归 |
| 普通 anchor loading | `link-native-red.log`：实际 anchor 缺少 `aria-disabled` | `link-green.log`，恢复后可激活 |
| 分段键盘 | `segmented-red.log`：tabindex 全部缺失 | `segmented-green.log`，焦点/事件/受控值 |
| 宿主入口、本数/时长、选择/重置、加载、状态 gallery、主题 | 各 `*-host-red.log` / `entry-red.log`：缺少真实 DOM 或回显 | 对应 `*-green.log`，最终 17 项宿主测试通过 |
| 内部锚点保留触屏表面 | `hash-red.log`：跳回桌面 | `hash-green.log` |
| 分段实际触控布局 | [竖屏 RED 数据](layout-red-portrait.json)：768×1024，三个目标均 72×40px；[RED 截图](layout-red.png) | 最终 [8 组真实布局数据](browser-matrix.json)，单段 72×44px |

补已有五件的公开行为回归不伪造 RED；那些能力原先已存在。范围外 `asChild + loading` 的 RED 留于 `link-red.log` / #43，不计为本票已修复。

## Fresh 验证

[结构化回执](validation.json) 记录门禁和锁身份；[资源响应](browser-responses.json) 与 [交互回显](browser-interactions.json) 分别记录产物和数据状态。

| Requirement | Evidence |
| --- | --- |
| 独立入口、返回桌面及内部锚点 | `opens the standalone touch demo from its direct entry and returns to desktop`；原桌面 `adds a named project from the form to the searchable table` 继续通过 |
| 控制值、事件、stepper 上下限/步长 | `requests bounded changes without mutating the controlled value`、`defaults to zero and increments by one with no finite upper bound`、`disables both directions when the range is a single value`、`keeps reading counts and duration in sync with bounded stepper events` |
| 分段点击与键盘 | `requests a pointer selection and waits for the controlled value`、`moves focus and requests a controlled selection with horizontal navigation keys`、`provides an entry for an unmatched value and handles empty or single options`、`selects a reading mode and resets both controlled steppers` |
| 按钮 disabled/loading、slot 与变体 | `blocks native activation while loading and resumes when ready`、`prevents loading link activation when rendering as an anchor`、`keeps explicit disabled state after loading finishes`、`activates and renders the leading slot for variant default`（另覆盖 brand/success/warning/destructive/outline/ghost）、`forwards a link destination when rendering as a child`、`shows local loading completion and keeps disabled actions inactive` |
| 指标与站点 slot/状态 | `renders values units and supporting slot for tone neutral`（另覆盖 brand/success/warning/danger）、`renders identity status and interactive right slot for tone success`（另覆盖 warning/danger/info/neutral）、`updates the station status and exposes the complete tone and button examples` |
| 主题 | `changes color mode and accent through the station right slot`，加实际 CSS 的 8 组主题矩阵 |
| 真实布局、点击、键盘、状态色 | `browser-matrix-final.mjs`：横/竖 × 明/暗 × neutral/blue 共 8/8；每组 28 目标，最小 44px，无横向溢出，启用项中心 hit-test 通过；`browser-interactions.mjs`：两视口的点击、原生 Enter/Space/Tab/方向键、上下限与 pulse/五种站点 tone 通过 |

实际串行门禁（Node 24.18.0 / pnpm 11.22.0）：

- `pnpm -C frontend install --frozen-lockfile`：PASS，新工作树安装；`tests-final.log`：UI **641/641**、宿主 **17/17**，无 skip。
- `pnpm -C frontend --filter @nerv-iip/ui test:docs`：**6/6**，仅文档源码契约，不是文档站运行。
- `pnpm -C frontend build`：两份 `vue-tsc` + production build PASS。最终 JS `index-mQWV6kKP.js`、CSS `index-CEZD6G1i.css`；浏览器请求二者均 200，加载资源列表只有本地脚本/样式/字体，没有业务 API。
- `vp fmt --check` / `vp lint` 仅限定本票源码及修改的说明文件；具体命令和出口见原始日志。`git diff --check` PASS。
- 为防嵌套脚本误用全局 pnpm 12，原始命令经 `/tmp/nerv-ui-t03/bin/pnpm`（仅转发 `corepack pnpm@11.22.0`）放在 PATH 前执行；未改仓库版本或配置。初次未固定嵌套 PATH 的 build 被版本检查拒绝，该失败保留在 `build-initial.log`。
- 提交锁与 T02 基线整个 Git blob 均为 `28c9958dee245741c0db1e6fab9dec33ca4894c1`。提交锁、实际安装锁的完整文件 SHA-256 均为 `b4bc0d1992a19af9978dd14ccd7a6f5e92bda1d91cd8f9080f2bd9215d1fe85d`；因此全部保留 snapshot/resolution/依赖边均未变化，不是 keys-only 比较。根/包版本和依赖声明也未改。

### 浏览器与截图

优先使用 T3 自有 tab。服务就绪后仍连续两次 `Preview automation snapshot timed out after 15000ms.`，按规则回退 ego-browser；[原错](preview-errors.txt) 保留。T3 的未生效视口返回值不算布局证据。ego 窗口最小化曾阻止截图；恢复窗口后保存。一次等待后台 rAF 的脚本超时、一次同 URL 导航读到旧 bundle、一次并发截图尝试造成 viewport mismatch；这些轮次均作废，日志保留。最终矩阵与交互以独占串行脚本重跑、核对 viewport 和最终 bundle 后的结果为准。

- [竖屏浅色](portrait-light.png) / [竖屏深色](portrait-dark.png)
- [横屏浅色](landscape-light.png) / [横屏深色](landscape-dark.png)
- [截图视口/主题/资源身份](screenshots.json)

所有截图均为完整页面，视口分别为 768×1024 和 1024×768 CSS px，截图高度包含滚动内容；工具输出 PNG 的实际宽度为 753 / 1009px（与记录的 CSS innerWidth 相差 15px），逐张像素尺寸也写入截图身份 JSON；视口结论来自页面内实测，而非从 PNG 反推。检查了重叠、目标命中与主题实色；这是 Chromium 鼠标/键盘与 CSS 视口验证，**不是物理触屏或手套触控验证**。

## 继承、UNRUN 与交付状态

继承 T02 的 stable workspace/CSS 入口、原版冻结、T01 provenance 与 F1 历史；没有重写它们，也不把 T02 浏览器历史算本轮 fresh。测试中的既有 jsdom `Could not parse CSS stylesheet`、构建中的 VueUse `INVALID_ANNOTATION` 仍有输出，命令 exit 0；真实布局由上述浏览器单独证明。

UNRUN：CI、物理触屏、其他浏览器、移动/大屏/其他 UI 表面、完整文档站独立运行、仓库外安装产物 #11、旧仓业务接入与全栈。未部署、未合并、未关 #4 或母票 #1，也未将总 draft #18 置 ready。最新 integration fetch + merge 返回 `Already up to date.`，不会替代后续独立 merger 的审核与合入。
