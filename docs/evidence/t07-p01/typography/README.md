# #84 / PR100：R2 STD-2 字号修复

仅修 R2 Standards 的 STD-2 / P2，scope:S。待独立 R3；本实施不代替独立审核。PR100 保持草稿，#84/父 #8/spec #1 保持 OPEN。未 ready、merge、close、watch、poll 或发布。

## 固定对象与根因

真实工作树 `/Users/mang/Project/nerv-ui-worktrees/t07-p01-native-timeline`，分支 `feat/t07-p01-native-timeline`，开工 clean。起点 `b19166eb07d91590453d60a6424debadd2394959` / tree `6817b1ea9b58e56b90aae3d0524a623799ff4160`。交付前 fetch + merge integration 为 Already up to date：base `93f9689cae554ea87ca6cb2a28a56b2f11f14f32` / tree `74e5607188826c0a48f7bbbf1474ba0fbf822bdc`。最终 head/tree、PR 回读与 clean 记录见本轮 durable `handoff.md`、`raw/pins-final.json`。

完整读取 R2 回执、原 R1 回执、R1 修复 handoff、实时 #84/#8/#1、研究 P01/D1–D6 和目标 AGENTS/governance/foundation/PC product。R2 为 Standards material 1 / Spec material 0 / optional 0，原 R2 browser 因停止为 UNRUN，不能改称通过。

`foundation.md:108–118` 规定正文、时间戳、提示和标签使用 `text-sm`，禁止 scoped 自定义字号；PC product 要求靠排版纪律保持密度。目标 SFC 原有 **9** 处 `font-size`（449/464/519/526/534/550/575/645/658），包括 0.65/0.7/0.72/0.75/0.875rem，均在同一 owner。

## 本轮改动

唯一生产文件为 `NvScheduleTimeline.vue`：根增加规范 Tailwind `text-sm`，移除全部 9 处 scoped 字号，后代统一继承。状态徽章继续由已有 `NvStatusBadge` 拥有自身排版。未加 token、豁免或治理修改。决策页补排版说明，由现有文档站 include 复用。

`raw/source-final.json` 证明整个源码 delta 恰好为上述字号变化：script 完全不变，R1 状态、真实投影盒/短项详情和严格日历修复保留；公开测试、playground、theme.css 字节不变。不重构日历、投影、详情或 API，不改其它组件。无新增镜像静态测试。

## Fresh 门禁

串行执行，未修改 timeout/skip：

- UI **805**、公开 host **294**（`--fileParallelism=false`）、UI docs-source **6**；各 exit0，JSON success=true，failed assertions/suites/pending=0，所有文件通过且非零断言。reporter 未提供 unhandled 计数，保留 null；日志未见 unhandled error/rejection/uncaught 标记，jsdom CSS 告警保留。
- 三个活动包类型、根 build、非根 `/p01-proof/` build、公共主桶独立几何宿主 build；受影响源码/决策页 fmt 和源码 lint 均 exit0。证据文档采用当前 formatter 支持的 stdin 模式逐字节检查。
- 16 工程输入相对 base 全字节相等；完整 YAML 对象全部字段与 dependency/peer/optional 边相等，**973 packages / 973 snapshots**；ui/mobile/playground Vue 为同一 realpath。task-local shim 显式 corepack pnpm **11.22.0**，包含 nested 调用；无 install、升级或 Python/global 安装。

公开行为测试逐名结果在 `raw/test-validation.json`；P01 主桶 33 条及导航 1 条 fresh PASS。包括：

- `uses unified badges for host conflict attention lock and labels without classifying host text`
- `keeps short task identity statuses and selection readable in native details without widening time bars`
- `rejects nonexistent calendar dates across tasks horizon windows segments and dependency endpoints`
- `replaces same-key labels facts segments links windows and resources without retaining old content`
- `readonly selection never edits or mutates frozen caller data`

本轮样式变更未触及 mobile owner，mobile144/docs2 仅引用 R2 的继承 PASS，本轮 UNRUN。原外部日期 probe 本轮 UNRUN，公开 host 中的日期分区 fresh PASS 不迁名为外部 probe。

## Fresh 真实浏览器

先 T3 preview_status/open；服务未起时 open 为 chrome-error，启动新 dist 服务后 navigate 成功。同一步 snapshot 连续两次 raw `Preview snapshot failed: Preview automation snapshot timed out after 15000ms.`，才按用户约定 fallback 到已装 ego-browser 0.6.1.9。升级提示保留，未升级。

1440×1100 / 640×1100 × 亮暗四态：

- 实际目标文字 font-size 均 **14px**；轴/泳道/窗口/分段/标题/时间/短详情统一规范字号。默认 read 的标题、书目事实、时间和上下篇标签在原盒内，无新增裁切。PNG 已实际查看。
- 720px track 的相邻五分钟 A/B 各 **2.4921875px**（独立期望2.5，误差0.0078125，容差0.02）；半段 **1.2421875px**（期望1.25）、一秒条 **0.0078125px**（期望1/120）、四小时条120px/一小时分段30px；边界分钟条、裁剪 window 及依赖首尾同时间盒对齐。没有 padding/min-width 撑宽。
- 短项原生详情的标签、时间、事实、统一状态都在按钮内；A/B 鼠标选择、一秒项 Enter 选择及真实2.5px条点击保持 taskId。放大字号未隐藏短项可读内容；投影条内仍使用原有 compact 规则。
- 默认演示 read180px / segment60px，宽窄明暗通过；同 key 替换文本/事实/分段/links/windows、清空恢复、收窄容器、desktop 卸载重入及非根选择通过。
- 从浏览器对实际页面资源做 no-store GET：几何宿主 **4**、根 schedule **5**、非根 schedule **5** 个响应，status/MIME/bytes/SHA-256 与本轮对应 dist 完全相同。不是仅检查 URL 或产物文件名。非根无外部请求。

具体量测见 `browser/geometry-four-states.json`、`app-four-states.json`、`short-clicks.json`、`*-resources.json` 及 PNG。亚像素量化保留。runtime events 空缓冲不证明无异常，运行时异常事件覆盖仍 UNKNOWN。

## 历史、失败与未执行

- 本轮首轮几何宿主命令误用不存在的 `vite` 可执行入口，exit1/0执行；原日志保留。改为仓库实际 `vp build` 后 exit0，不修改依赖或产品绕过。T3 两次超时及服务前连接失败同样保留。
- full RAW 新 main→head diff-check 仍 **exit2**；base→head P01 diff **exit0**；b19166e→head typography maintenance **exit0**，原835d8e→head maintenance另列0。未改历史 raw/PDF/vendor/source 空白追求全绿。
- R1 的3项 P2、原日期产品 FAIL、修复席原 probe 诊断 FAIL/安全副本 PASS、旧 host 默认并发 FAIL 根因 UNKNOWN，均保留在历史 durable。默认并发 lane 本轮 UNRUN，不改 timeout/skip。历史 R1/fix/R2 SHA256SUMS 分别40/211/178项全部逐文件回读相等；这是完整性验证，不是全文或全量运行复审。
- 独立 R3、CI（PR 无 checks）、完整 docs10、packed11、device、旧 consumer13/15、真实 DHTMLX87、后继85–99、父8组合及发布 UNRUN。DHTMLX9.1.4 Professional Evaluation/水印未动，授权 UNKNOWN。#43/#51/P3 不扩修。

本实施无剩余修法异议；R3 尚未执行，不能声称独立 material/optional 已归零。原 R2 browser UNRUN 继续保留，本轮 fresh browser 单独记账。

## 清理与证据

自有 Ego TaskSpace50 finish keep[]；恢复 metrics/media/page scale，实测 visualViewport.scale=1、CSS zoom=1。T3 自有 tab 恢复 fill/system 后关闭；自有服务停止，4188/4189 无监听。root 和旧源只读，旧 HEAD 保持79b1578f；旧 local main ecb76263 与 tracking/live remote main 7b7bbb4f 分列，不混称。

- 本轮 scratch：`/tmp/nerv-ui-t07-p01-typography/`。
- 本轮 durable：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-p01-typography-fix/`，包含本轮 raw/scripts/browser/handoff 与 SHA256SUMS，逐项回读。过滤 node_modules/cache/cleancheckout/.vite/dist/nested-dist，只归档本轮并引用历史。
- 历史 R2：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-p01-review-r2/review-receipt.md`。
- 历史 R1：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-p01-review-r1/review-receipt.md`。
- 原三项修复：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-p01-fix/handoff.md`；仓内 [F1–F3 证据](../f1-f3/README.md)。
