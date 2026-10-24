# T03 / PR #44 独立 merger 回执

结论：material 1，拒绝本轮集成；不改代码、不合并、不关闭 #4。标准轴硬性违规 0；规格/行为轴 1；独立 optional 建议 0。唯一重型席，无委派。所有 shell/Git 命令均显式使用新库 root 或 t03-touch workdir，未写旧仓。

## 固定对象

- PR https://github.com/Mang-X/nerv-ui/pull/44 已 link，结束前 list_thread_pull_requests 确认已关联、watching=false。
- 审核 head a7dfc8c07ef99e2f72fe1b90759cb835dc744c10；tree 4ccb18d06fc8c563eb544e4a2e3cf977f8c16f8e。
- base a482af3826f611bab11f608139860b7f9a29891a；tree a9de6d1ed13a20b905c2ce54814a810d18cef822。
- GitHub head/base、任务树和远端分支一致；实际 diff 28 文件。已读实现上下文、#1/#4/#44/#43、根 AGENTS/README、库内规则、设计治理、T03 evidence 与实际代码/测试 diff。

## F1 / P2：选项重排后分段键盘焦点与受控选择分离（本票新增）

位置：frontend/packages/ui/src/components/touch/TouchSegmented.vue:51；关联 20、63–65 行。

公开 API 复现（只在 /tmp 外部 probe，无仓库修改）：

1. mount 主桶导出的 NvTouchSegmented，modelValue='read'，options=[Read/read, Listen/listen, Rest/rest]。
2. 宿主将 options 改为 [Rest/rest, Read/read, Listen/listen]，保持唯一稳定 value。
3. 聚焦 Read，按 ArrowRight。
4. 组件正确发出 update:modelValue('listen')；宿主回传 modelValue='listen'。
5. 实际选中 Listen、tabindex=0 在 Listen；document.activeElement 却是 Rest（tabindex=-1）。

失败输出：
{"reorder":true,"dom":["Rest","Read","Listen"],"emitted":[["listen"]],"selected":"Listen","focused":"Rest","tabIndices":["-1","-1","0"]}

原因：带 key 的 v-for 移动既有 DOM 时，模板 ref 数组不保证跟随 options 的新索引重排；navigate 使用 options[next] 发事件，却用 buttons.value[next] 定位另一个节点。未重排对照通过，重排用例失败。此导航是本票新增；基线没有这一键盘实现，不能归入 #43。现有分段测试覆盖静态数组、controlled 回传、循环/Home/End、empty/unmatched/single，但没有覆盖更新后的 options 顺序；静态演示也未触发此缺陷。

外部脚本：segmented-probe.test.ts；配置 probe.config.mjs。重现命令（workdir=/Users/mang/Project/nerv-ui-worktrees/t03-touch）：
PATH=/tmp/nerv-ui-t03-merger-20261024/bin:$PATH pnpm -C frontend --filter @nerv-iip/ui exec vp test run --config /private/tmp/nerv-ui-t03-merger-20261024/probe.config.mjs

最终 public-probes-final.log：12 tests，11 passed / 1 failed；唯一失败为 keeps controlled selection and keyboard focus aligned with reorder=true。未为通过而改产品、仓库测试或断言。

## Fresh 证据

- tests.log：完整既有活动测试入口 exit 0，UI 43 文件 / 641 PASS，host 3 文件 / 17 PASS，无 skip。
- docs-tests.log：3 文件 / 6 PASS；仅静态文档源码契约，非文档站运行。
- build.log：UI/playground 两份 vue-tsc --noEmit + production build exit 0；既有 jsdom CSS parse / VueUse INVALID_ANNOTATION 输出保留。
- fmt.log / lint.log：按实际 diff 全部 13 个 frontend 变更文件 scoped 检查 exit 0；没有全仓 lint 声明。git diff --check PASS。root README/evidence 为人工与 JSON/像素/hash 审核。
- button-probe.test.ts：10/10 PASS。5 条普通多态路径（默认、as=button、as=a、asChild anchor、asChild button）核对 DOM id/aria-label/href、click、disabled 拦截和恢复；3 条直接宿主 loading 路径核对 busy/disabled/恢复；2 条只断言已知 #43 仍存在。最后两条是缺陷记录，不是正确性通过或已修复声明。
- 补充 probe 初次 native .click 在 Vue capture/bubble invoker 的同毫秒时间戳保护下出现 3 项 harness 误报；定位 runtime-dom 的 _vts/attached 检查后，普通激活改用 VTU trigger 的事件时间戳处理。原始 public-probes.log、button-probe-diagnostic.log 保留，最终只余稳定的 F1。首次 /tmp 与 /private/tmp canonical root 不一致导致 no tests 的工具失败也保留。
- artifact-audit.log：最终重建后 validated-files.json 的 30 个输入/HTML/JS/CSS/字体 SHA256 全等，mismatches=[]。JS index-mQWV6kKP.js / CSS index-CEZD6G1i.css 与浏览器资源记录一致。
- lock Git blob base/head 均 28c9958dee245741c0db1e6fab9dec33ca4894c1；提交和实际安装 .pnpm/lock.yaml SHA256 均 b4bc0d1992a19af9978dd14ccd7a6f5e92bda1d91cd8f9080f2bd9215d1fe85d。根/UI/playground manifests、workspace 配置全 blob 相等，冻结 shadcn 范围 diff 0。
- installed-graph-audit.log：直接对 T02 R2 clean 安装比较，安装 lock 全字节一致，.modules.yaml 除 prunedAt 时间戳外全部字段一致（含完整 hoistedDependencies、registry/store、skipped、build/layout 字段）。Vue 的 host/UI realpath 身份相同，workspace UI 指向当前独立库。按授权不重跑大范围 F1/解析语义工具、不重复安装。

## 继承证据审查

- RED→GREEN 原始日志确实失败于公开 DOM/事件接缝：默认按钮原生 disabled=false、anchor 缺 aria-disabled、segment tabindex 缺失、hash 内部锚点跳回桌面。宿主各轮失败及 GREEN 保留；没有把既存功能补测试伪称 RED。该历史是继承审查，本席没有重演这些 RED。
- browser-audit.json：8 个唯一横竖×明暗×neutral/blue 组合，viewport 为 768×1024 或 1024×768；每组 28 targets，最小宽56/高44，overflow=false，所有启用项中心 hit-test 通过，5 种卡片 tone 不塌缩。原始脚本按各目标滚动后检查中心，不能扩大为所有像素无遮挡或物理触控。
- interactions 两视口的控制值/边界、原生 Enter/Space/Tab/方向键、loading、pulse/5种站点色及内部 hash 链接断言已读；focusVisible 记录的是 stepper 减少按钮，segment 选择/焦点由脚本中的即时断言证明，未声称逐项保存了全部焦点瞬时快照。
- 四张截图均已目视，PNG 真实尺寸为 753×2114、753×2114、1009×1766、1009×1766；与 CSS viewport 宽差15px 已明确记录，不从 PNG 反推 viewport。四张截图与 /tmp 原始字节一致。
- final bundle 强制 reload/名称断言、资源 200、响应 URL 和独立重建 SHA 身份支持继承该演示的浏览器证据。本席 fresh browser UNRUN；未把 JSON 或截图审核称为 fresh browser。
- 两次 T3 同一步 snapshot 原错均为 Preview automation snapshot timed out after 15000ms.，随后 ego 回退有记录。服务前 ERR_CONNECTION_REFUSED、无效 about:blank、T3 resize 未生效、后台 rAF timeout、旧 bundle 的 Target below 44px、最小化截图失败、并发 viewport mismatch/不完整轮次全部保留，不算最终矩阵。
- UI/host 的测试数量不代表全部组合：动态 options 键盘已被 F1 反例击穿。文档 6 项是静态，不代表完整站可运行。

## #43 边界

Primitive 将 attrs/guard 克隆到首个非 comment slot 子节点，loader 先于真实子 anchor/button；基线模板已有相同布局。已读 #43 及父控制器将其设为 #1 子票、#11 前置的记录。本席确认其仍在，没有声称修复 asChild+loading，也未因这一已公开的继承缺陷单独拒绝窄演示。普通无 leading 的 asChild 两种宿主通过补充 probe；不扩大为任意自定义 as 组件/所有 slot 组合认证。当前拒绝原因仅为独立 F1，不自动顺修 #43。

## UNRUN 与最终状态

- Fresh browser、物理触屏/手套、其他浏览器、CI、完整文档站运行、版本化包 #11、旧库接入/旧全栈、部署/发布 UNRUN。
- 没有执行 merge 命令；merge commit=null，mergedAt=null。PR #44 OPEN，#4 OPEN，未追加 completed 或关闭。
- integration/root 仍 a482af3826f611bab11f608139860b7f9a29891a，tree a9de6d1ed13a20b905c2ce54814a810d18cef822，clean。
- task 仍 a7dfc8c07ef99e2f72fe1b90759cb835dc744c10，tree 4ccb18d06fc8c563eb544e4a2e3cf977f8c16f8e，clean。
- #43 OPEN；#1 OPEN；#18 OPEN/draft=true；main 仍 599031a688496679e300458f56a1896d41ac8f81，均未修改。
- 原工作树和全部 /tmp 日志保留，交父代理归档清理；未启动监控/轮询。
