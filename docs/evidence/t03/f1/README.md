# T03 F1：动态 options 的键盘焦点修复

仅修 [PR #44](https://github.com/Mang-X/nerv-ui/pull/44) 独立审核新增的 F1/P2。审核固定 head `a7dfc8c07ef99e2f72fe1b90759cb835dc744c10`、tree `4ccb18d06fc8c563eb544e4a2e3cf977f8c16f8e`；base/integration `a482af3826f611bab11f608139860b7f9a29891a`。工作树起点 clean。fetch 后 merge integration 返回 `Already up to date.`。本轮验证输入和最终产物身份见 [audit.json](audit.json)，交付提交由 PR head 固定。

[原审回执](review-r1.md) 保留 material 1 / 拒绝集成的历史结论；上级目录的旧矩阵、截图、RED 与 validation 未修改，不将旧 JS 的浏览器结果冒充新产物。原始日志及脚本保留于 `/tmp/nerv-ui-t03-f1`，原审反例仍在 `/tmp/nerv-ui-t03-merger-20261024`。

## 原因与最窄改动

初始 Read/read、Listen/listen、Rest/rest，受控值 read；宿主重排为 Rest、Read、Listen 后，Read 上 ArrowRight 正确请求 listen，焦点却落在 Rest。带 key 的 DOM 移动不会保证 `v-for` ref 数组同步排序，原实现将 options 索引直接用于该 ref 数组。

修复仅将 ref 移到组件根节点，在导航时读取其直接 button 子节点的当前 DOM 顺序。没有引入焦点框架、watcher、自动回传或新公共 API。选中态和单一 Tab 入口仍由宿主回传的 modelValue 决定。组件样式字节不变，模板除 ref 外完全相同；源码身份变化仍使 scoped 标识及 JS/CSS hash 变化，故重新构建、核对资源并运行真实浏览器。

## 正式回归与外部反例

公共接缝：从 `@nerv-iip/ui` 主桶挂载组件，通过 options/modelValue 输入、键盘、公开 DOM/ARIA、焦点和 update:modelValue 事件观察。无组件内部 refs、私有状态或结构快照断言。

| Requirement | Evidence |
| --- | --- |
| 重排后焦点、请求值、回传选中值一致，回传前仍保持旧选中态 | `aligns focus requests and controlled selection after options reorder`；[formal-red.log](formal-red.log) 为 1 FAIL / 3 PASS，实际焦点“休息”而预期“聆听”；最窄修复后初轮 4 PASS，最终 [formal-final.log](formal-final.log) 为 5 PASS |
| 删除/插入后按当前顺序处理 ArrowRight、ArrowLeft、Home、End，每步核对 pending 与回传后的单一 tabindex=0 | `uses updated options for Arrow Home and End after removal and insertion`；最终 5 PASS 中的必要同机制边界。此补充用例在修复后加入，不伪称另有 RED |
| 静态循环、受控点击及 empty/unmatched/single 不回归 | 既有 `moves focus and requests a controlled selection with horizontal navigation keys`、`requests a pointer selection and waits for the controlled value`、`provides an entry for an unmatched value and handles empty or single options`；同一最终 5 PASS |

命令：`PATH=/tmp/nerv-ui-t03-f1/bin:$PATH pnpm -C frontend --filter @nerv-iip/ui exec vp test run src/components/touch/TouchSegmented.test.ts`。

未经改动的原审外部 probe fresh 重跑：[external-red.log](external-red.log) 为 11 PASS / 1 FAIL；[external-green.log](external-green.log) 为 12 PASS / 0 FAIL，重排/未重排两条分段 probe 均通过。其余 10 条 button probe 中两条故意确认已知 #43 仍存在，不能将这两条描述为正确性认证或 #43 已修复。

## Fresh 本地门禁

[validation.json](validation.json) 记录出口、数量与日志路径。所有重型命令串行执行，PATH 首位 shim 仅转发 `corepack pnpm@11.22.0`，嵌套 pnpm 也固定 11.22.0；Node v24.18.0。

- `pnpm -C frontend test`：UI 43 文件 / **643 PASS**，playground 3 文件 / **17 PASS**，无 skip。
- `pnpm -C frontend --filter @nerv-iip/ui test:docs`：3 文件 / **6 PASS**，仅文档源码契约。
- `pnpm -C frontend build`：两份 `vue-tsc --noEmit` 与 production build PASS。首次 build 的新增测试 DOM 类型错误保留于 `build-initial.log`；补 `findAll<HTMLButtonElement>` 类型后窄测试及完整 build 重跑通过。没有改测试行为断言。
- `pnpm -C frontend exec vp fmt --check …` / `vp lint …`：仅本次两个组件/测试文件和对应文档站 Markdown，均 exit 0；不是全仓 lint。`git diff --check` PASS。证据 JSON 另行解析，截图另行目视。
- [audit.json](audit.json)：全部 16 份跟踪的 package.json / pnpm-lock.yaml / pnpm-workspace.yaml 与 base 全字节相同，实际安装锁与提交锁相同。锁 SHA-256 仍为 `b4bc0d1992a19af9978dd14ccd7a6f5e92bda1d91cd8f9080f2bd9215d1fe85d`；冻结 shadcn diff 0。未重新安装，沿用已核验安装环境。
- 既有 jsdom CSS parse / VueUse INVALID_ANNOTATION 输出保留，不据此扩大成运行失败或静默抹除。

## Fresh 真实浏览器

T3 页面加载成功后，同一步 snapshot 连续两次返回 `Preview automation snapshot timed out after 15000ms.`，按规则回退 ego-browser；[完整尝试边界](preview-errors.txt) 区分服务未就绪和无效 about:blank 等先前工具错误，均不计为 PASS。

1. **动态公开宿主**：[browser-host](browser-host/main.ts) 是 `/tmp` 内临时 production-built Vue 宿主，通过主桶消费当前组件；[构建配置](browser-host/build.config.mjs) 显式指向当前独立库及同一 Vue，无原库依赖，也不是 #11 的版本化安装验收。[browser-focus.mjs](browser-focus.mjs) 用真实键盘执行重排、左右循环、Home/End、删除/插入共 **9 步**；每步检查事件请求、回传前旧选中态、焦点、回传后选中态及唯一 tabindex=0。宿主“Apply request”用 DOM click 回传事件请求以保留键盘焦点，没有读取组件内部状态。[结果及资源字节身份](browser-focus.json) 全 PASS。临时宿主无主题样式验收职责。
2. **真实 playground**：固定新 `index-CoupmcNx.js` 与 `index-uOnjaWII.css`。实际 `/#touch` 的 End/Home/ArrowRight/ArrowLeft **4 步**均核对选中/焦点/Tab 入口；JS、CSS、实际加载字体共 **3 个资源响应**均 200，响应 SHA-256 与新 dist 文件相同，见 [browser-responses.json](browser-responses.json)。不是仅检查资源名称。
3. **布局/主题**：[browser-matrix.json](browser-matrix.json) 为本轮 fresh **8/8**，横/竖 × 明/暗 × neutral/blue；viewport 768×1024 或 1024×768，每组 28 目标，最小宽 56px / 高 44px，无横向溢出，启用项逐项滚动后中心 hit-test 通过，五种指标 tone 未塌缩。脚本见 [browser-matrix.mjs](browser-matrix.mjs)。这不扩大为全像素无遮挡或物理触控。
4. **截图**：[竖屏浅色](portrait-light.png)、[横屏深色](landscape-dark.png) 均已目视，无重叠/裁切异常；[screenshots.json](screenshots.json) 记录 CSS viewport、PNG 像素尺寸、主题与新 JS 身份。PNG 为 753×2114、1009×1766；15px 差来自截图工具，viewport 结论取页面实测。最终脚本见 [browser-final.mjs](browser-final.mjs)。

工具失败保留：临时 harness 首次因 `/tmp` 与 `/private/tmp` canonical root 不一致构建失败，修正为 canonical root 后 PASS；浏览器首轮资源核对误将 ego 注入的 `fetch-interceptor.js` 当作产物，触发 ENOENT，该轮未记 PASS，限定实际宿主 `/f1/assets/` 后整轮重新通过。原日志 `harness-build-initial.log` / `browser-focus-initial.log` 均在 `/tmp/nerv-ui-t03-f1`，没有借失败掩盖产品反例。

## 继承与 UNRUN

原 8 组 browser 矩阵继续保留为旧 head 历史，本次另有新产物 fresh 8 组。旧非 F1 的 stepper/loading/slot/pulse/锚点完整浏览器交互只按未变实现范围继承；没有声称本轮全部重新交互。#43 未修，原版冻结、公共名称、依赖图和业务 SDK 边界未变。无其他待解决的 F1 技术异议；仍需父代理独立复审。

UNRUN：fresh frozen install、CI、物理触屏/手套、其他浏览器、完整文档站运行、版本化产物 #11、旧库业务接入/全栈、部署。未合并 PR、未关闭 #4/#1/#43，未轮询或启动 watcher。

证据文件收尾检查：首次暂存检查发现两份复制日志末尾多余空行；提交副本仅去掉末尾空行，原始 `/tmp` 日志字节保留。修正后 `git diff --check` / 暂存检查通过；该检查失败保留于 `evidence-diff-check-initial.log`。
