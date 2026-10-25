# T06 文件样张 basepath 窄修

2026-10-25，仅处理父 [#7](https://github.com/Mang-X/nerv-ui/issues/7) 组合验收 R1 的 F1/P2。范围为 playground `PreviewPanel.vue` 的受控 fixture URL；没有修改组件库、renderer、全局路由或旧消费者。关联父票，不关闭父票；独立 merger 后仍需父 R2。

## 来源与修改

- 开工 base/integration：`e136487941ff9e18103042c3e44ac775d2c1b343`，tree `4890ee7048e72cb599cbfedd5b78080360b62eda`。
- 真实工作树：`/Users/mang/Project/nerv-ui-worktrees/t06-basepath-images`，分支 `fix/t06-basepath-images`；旧 T3 自动树没有实施写入。
- [原拒绝评论](https://github.com/Mang-X/nerv-ui/issues/7#issuecomment-6394853883) 与原父 body 保留。F01 引入了硬编码 `/files/`；组合 base `e3909896e2072d4a4b874161f29a555cbe50168d` 尚无文件页，是继承的父 AC 缺口，不是 F05 回归。
- PNG/JPEG、坏图、missing 及四类 unsupported 样张共 8 处 URL 改用同文件既有 `import.meta.env.BASE_URL + 'files/…'`。SVG/PDF/Office 原写法与 Blob URL 所有权保留。

## Fresh 验证

`/tmp/nerv-ui-t06-basepath/` 保存命令、退出码、测试 JSON、截图与真实响应体。持久目录为 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t06-basepath-fix/`；精确最终 head/tree、逐项矩阵与原始文件索引见其中 `pins-final.json`、`RequirementEvidence.md`、`SHA256SUMS`。

- RED：原实现运行新公开回归，非根 PNG/JPEG 两条因根 `/files/` 而失败；root 两条通过。首轮脚本的固定 `src` 参数使实际范围为 host：251 passed / 2 failed，exit 1，原结果保留。
- GREEN：收窄命令 `pnpm -C frontend/apps/playground exec vp test run src/files/PreviewPanel.test.ts`，10 passed；host 259 passed。两者 exit 0、failed/pending 0、逐 assertion passed；JSON 未提供 `numUnhandledErrors`，日志另检无 unhandled/uncaught。jsdom 的 load/error 是合成事件，真实解码由下面 browser 单独证明。
- 三活动包 vue-tsc、普通 production build、`--base=/parent-proof/` build、两维护文件 fmt/lint 均 exit 0。全部 pnpm 入口及 nested shim 固定 corepack 11.22.0；frozen install exit 0，使用本机缓存安装 855 当前平台包，不称完整 clean-checkout/packed 安装。
- 真实 production browser 在 root `http://127.0.0.1:5280/#files` 与同 base preview `http://127.0.0.1:5281/parent-proof/#files`：PNG/JPEG 均 200、正确 MIME、640×400、ready image，110% 与旋转 90°；每图均有来源 error→恢复及 missing→恢复。
- PNG 10878 bytes / SHA256 `bbb5957119507867b24fb51c761bcbf1bf3af25c38f908d68721e2d03c8ae92e`；JPEG 16037 bytes / SHA256 `2e5b23c0c5eaea91d63ae67b11aef0f4257974bd8d1e61448a964a294dcbaa30`。20 个实际响应体逐字节等于最终 dist，含两 base 的真实 Image 请求及相邻 SVG/PDF/Office fixture；Office fixture 的空 MIME 按原值保留。
- 非根 base 的真实 PDF 位图及三 Office canvas 均有非空像素/hash与已查看截图；SVG 正常。坏图保持解码错误，四类 unsupported 保持 unsupported；已知 PNG 走本地 Blob 解码后切回 JPEG，host URL 正确回收。完整 PDF/Office 页码、sheet、zoom 与深对抗矩阵属于继承证据，没有冒称本轮全重演。
- 16 份依赖输入逐字节不变，4 importers / 973 packages / 973 snapshots 完整对象相同；三活动包均为同一个 Vue 3.5.39 realpath。全部包内生产代码与 base 无差异。

公开测试名：`previews 'root PNG' / 'root JPEG' / 'nested PNG' / 'nested JPEG' at the public base URL and recovers after image failure`（4 例）；`keeps nested SVG and corrupt-image fixtures distinct and recovers from a host source error`；`keeps the nested 'text' / 'legacy' / 'media' / 'archive' fixture unsupported and opens only the controlled base URL`（4 例）；`keeps a local Blob URL unprefixed under the nested base and releases it on fixture replacement`。逐例精确名称以 `test-validation.json` 为准。

## 证据限界与清理

原 R1 的 404/FAIL 截图、`raw/prod-combination.json` 与 `correct-base-responses.json` 留在 durable `t06-parent-acceptance-r1/`；本轮只存路径/hash引用，不复制历史数千文件。父原七 AC、spec #1、F01 #72 与原拒绝均已读取。原 UI802/mobile144/docs-source6+2、五叶完整深分支及 Worker 内部网络/revoke 证据按 producer 不变继承，不称 fresh。

T3 status/open 成功；服务未启动时第一次 open 的 chrome-error 保留，随后导航成功，但 snapshot 连续两次 `Preview automation snapshot timed out after 15000ms.`，据此改用已装 Ego 0.6.1.9，未升级。探针准备失败保留：误设 25% 步长、在入场动画中读 transform、root 收尾 recorder 作用域 ReferenceError、误把 PDF 位图当 canvas 等待超时。后续按真实 producer/可见状态修正探针，未改 renderer。正常 missing 路径由 SPA fallback 返回 200/text/html，仍触发真实 image error；5 条 missing/corrupt body unavailable/不可比响应单列，未伪造 404 或成功资源。原 CSS 解析、build CSS/motion/PURE/chunk 警告不清洗；主线程 warning 为空不代表 Worker warning 为空。

最终离页 3 Worker 全 terminate，12 主线程可观测 URL 全 revoke；3 个 Worker bootstrap URL 的 revoke 发生在 Worker realm，本轮 recorder 不覆盖，沿用原跨线程证据。未重验所有 observer/timer 深矩阵。主线程无隐式写或非 loopback 网络、window error/unhandled rejection 为空；Worker 网络本轮未独立拦截，继承原证据。Ego space42 已 finish，自有 T3 tab 已关闭；未修改 native zoom/emulation，最终 scale 1 / dpr 2。仅终止 cwd/PID 核实为本任务的 5280/5281 服务，wrapper exit143 为主动清理；工作树 Git clean 留给父统一管理。

**UNRUN：CI、完整 docs #10、packed #11、device/camera #41、旧 consumer #12–15、生产 FileStorage、发布、独立 merger、父 R2。** F03 PUT 等待 1% P3、Office 英文 404 P3、#43/#51 不扩修；#7 的原拒绝记录不被本轮实现证据覆盖，保持 open/body 原样，#18 保持 draft。新旧 main、root integration 与旧源只读核对，local/remote main 分列，不以改 refs 迎合断言。
