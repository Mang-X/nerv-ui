# T07/P01：独立 R1 三项 P2 修复

本轮仅修 [#84 / PR100](https://github.com/Mang-X/nerv-ui/pull/100) 的 STD-1、SPEC-1、SPEC-2，交独立 R2；未 ready、merge、close、发布或监控。初始 clean head `835d8e284f06b0f7be01218a71664f88d6264ce4` / tree `2c9331690542e2b406e68d6bb07d57c24572791d`。交付前 fetch + merge 的 integration 为 `93f9689cae554ea87ca6cb2a28a56b2f11f14f32` / tree `74e5607188826c0a48f7bbbf1474ba0fbf822bdc`，Already up to date；最终 head/tree 回到持久目录 `handoff.md` 与 PR。

所有命令显式 workdir `/Users/mang/Project/nerv-ui-worktrees/t07-p01-native-timeline`，分支 `feat/t07-p01-native-timeline`。root/main/旧源只读；Python 未执行，未使用全局安装。pnpm 由 task-local nested shim 固定 corepack 11.22.0。

## 改动与 Requirement / Evidence

| Requirement                                                     | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| STD-1：统一状态，不按任意宿主文字推导业务 tone                  | `uses unified badges for host conflict attention lock and labels without classifying host text`：6 PASS/1 FAIL → 7 PASS；复用 `NvStatusBadge`，conflict/attention 显式字段对应 danger/warning，锁定及 `Completed` 等任意文案保持 neutral。                                                                                                                                                                                                            |
| SPEC-1：时间盒不被 padding/border 撑宽，短项可读可选            | `keeps short task identity statuses and selection readable in native details without widening time bars`：7 PASS/1 FAIL → 8 PASS；原生 details 独立呈现不足 96px 的标签、时间、事实、状态和选择，时间条保留完整 aria/title；无新拖动/编辑合同。真实 browser 独立固定期望检查名 `adjacent short intervals preserve real geometry at public root export`。                                                                                              |
| SPEC-2：不存在的日期不能成为另一日，所有日期消费者共用 producer | `rejects nonexistent calendar dates across tasks horizon windows segments and dependency endpoints`：8 PASS/1 FAIL → 9 PASS；非法任务/分段/窗口/依赖消失，非法空 horizon 不画轴，有效控制保留。                                                                                                                                                                                                                                                       |
| 闰年/月末、offset、毫秒、时间范围                               | `preserves valid instant partition leap year February end at independent UTC coordinates`、`preserves valid instant partition divisible four hundred leap year at independent UTC coordinates`、`preserves valid instant partition positive offset crossing UTC date at independent UTC coordinates`、`preserves valid instant partition offset milliseconds at independent UTC coordinates`；另覆盖负 offset、基本 offset/分钟精度及合法 ISO 24:00。 |
| 拒绝无效日历/时钟/offset/区间                                   | `rejects invalid instant partition non leap February without calendar normalization` 等 17 个独立具名分区，含 1900 非闰年、4/31、零月/日、非法起/止、25点、24:01/非零毫秒、分秒/offset 越界、无 offset、零/逆时长。完整名称见持久 `raw/host-final.results.json`。                                                                                                                                                                                     |

日期验证仅在当前 renderer 的 `instant` producer：先验证输入的日历年月日，再按原 offset 解析实刻，不能用 UTC 回转比较误拒合法跨日。保留 ISO 24:00 的全零合法形式；不解析 DST wall time，仍由 host 决定。通用模型、类型公开名、六件套 owner、旧 fallback/migration、vendor/SDK 和 scheduling workspace 均未扩修。

## 本轮 fresh 门禁

最终串行 UI **805**、mobile **144**、host **294**、文档源码 **6+2**，均 exit0、JSON success=true，failed suites/assertions/pending=0；所有文件 passed、发现断言非零。reporter 未提供 unhandled 计数字段，记录 null；日志未发现 unhandled error/rejection/uncaught marker。没有更改 timeout 或 skip，默认 host 并发复现 UNRUN。

`pnpm -C frontend build` 的三包类型与根构建、`vp build --base=/p01-proof/` 非根构建、公共主桶浏览器 harness 构建、受影响 source/docs fmt、source lint 均 PASS。具体参数和时间保存在持久 `raw/*.run.json`。本轮没有重新 install；16 份工程输入相对 base 全字节相等，完整 lock 解析对象相等：973 packages / 973 snapshots，所有 dependency/peer/optional 字段及边未升级；三个活动包 Vue realpath 同一。

## 真实浏览器与资源

短条必须先证实再修：T3 公共主桶独立宿主在 720px track 上测得 A/B 的 5 分钟条分别 **21.1875px / 23.1875px**，起点仅差 2.5px；A 的半段错误变为 10.59375px，源依赖终点脱离可见条。原始 `browser/geometry-red.json` 保存独立期望与逐项失败。

最终产物的 1440×1100 / 640×1100、亮/暗四态（`browser/geometry-final-r2.json`）均通过：A/B 各 **2.4921875px**（独立期望2.5px，误差0.0078125px，容差0.02px）；相邻边界不再虚假重叠。一秒条 **0.0078125px**（期望1/120px）；A 半段 **1.2421875px**（期望1.25px），长项120px、分段30px；起/止边界的一分钟条与裁剪窗口、依赖首尾真实像素均核对。浏览器亚像素量化明确保留，不声称无限精度或最小像素命中。

短时详情真实鼠标选择 A/B、一秒任务 Enter 选择、2.5px 时间条真实点选、只读真实拖动及日期三个控制/offset毫秒均完成（`interactions-dates.json`）。详情文字与徽章可见，时间条保留完整可访问 identity；不会为点击方便扩大时间范围。短条宽窄明暗截图是本轮最终 renderer/CSS 产物截图，非继承。

实际 playground 四态默认任务宽180/120px、两个分段各60px；选择、同 key换文案/事实/风险/分段/links/windows、清空/恢复、desktop 返回/卸载/重入及非根选择均 fresh。16旧入口全遍历及旧图片解码仍属首次实施证据，本轮没有冒称重做；mobile真实浏览器、完整旧路由组合 UNRUN。

对页面实际加载 URL 发 browser no-store GET，比较真实 response body 与本次 dist 的 bytes/SHA-256，同时核对 status/MIME：公共主桶 harness **4**、根 schedule **5**、非根 `/p01-proof/` schedule **5** 个响应全部相等。各 manifest 保留实际 body 哈希与文件哈希；不是只看文件名/URL，也不外推未请求资源。无外部请求。原 R1 的root9/nested8仅继承，不改名fresh。

T3先 status/open，snapshot 同一步两次 raw `Preview automation snapshot timed out after 15000ms.` 后才用 ego-browser skill/既有0.6.1.9，工具升级提示保留但未升级。最终 TaskSpace49 与自有 T3 tab、服务由本席清理，viewport/emulation/zoom恢复记录在持久 browser/raw。此证据不代替独立 R2。

证据文档 fmt 使用当前 oxfmt 包装器支持的 stdin 模式：`node /tmp/nerv-ui-t07-p01-fix/fmt-evidence.mjs check`，内部以 `--config <本工作树>/frontend/vite.config.ts --stdin-filepath=<原文档绝对路径>` 输入原文，exit0且 formatter输出与两份文件逐字节相同（`raw/evidence-stdin-check.json`）。此前两次直接包装器路径调用 exit1 原样保留；首次实施两次旧路径 exit1 也不覆盖。

## 保留 FAIL / UNKNOWN

原独立 R1 receipt、axis JSON、probe 与 raw 日期 FAIL 保持只读，持久指针 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-p01-review-r1/`。本轮原 probe 副本逐字相同：修复前 2 PASS/1 FAIL（真实错误绘制）；修复后仍 2 PASS/1 FAIL，因为原诊断日志对已消失 DOM 调用 `attributes()`，在断言前抛错。另一个明确命名的诊断安全副本仅对日志加 exists 防护，全部 expect 行逐字相同，3 PASS；不把原 probe 改称绿色。

本轮首次类型门禁 exit2 是新增测试 `get().exists()` 的类型误用，改为 `find().exists()` 后重跑通过。临时 harness 插件路径、Vue dedupe 解析与 `/tmp`→`/private/tmp` root 不一致的启动/构建/探针收集错误，T3 初始 URL/服务连接和 evaluate 参数错误、两次 snapshot timeout，均保留原始记录；首轮资源 helper 碰到临时 harness 未声明 favicon 的浏览器默认404而中断，四态几何此前已完成；fixture改用 data favicon 后重新构建/四态/资源全部通过。Ego CLI 对该脚本错误仍返回0，因此按原始错误文本记录 FAIL，不以 CLI exit0冒PASS。未修改产品或断言绕过。

首次实施的 evidence fmt 路径两次 exit1、旧公开 RED、浮点/pointer/barrel/restore/文案与分段几何/导航错误仍见[首次实施记录](../README.md)及其 durable。历史默认 host 并发 FAIL 根因 **UNKNOWN**；历史 T06 指针仅引用，不复制或重标 fresh。DHTMLX 9.1.4 Professional Evaluation 与水印不变，授权 **UNKNOWN**。

## 未运行与持久证据

独立 R2、CI、完整 docs #10、packed #11、device、旧消费者 #13/#15、发布、真实 DHTMLX #87、后继 #85–#99 和父 #8 组合验收均 UNRUN。#43/#51/旧 P3 不扩修，#85 实时 blocked-by #84，仅回读未改图。无未决产品修法异议；独立 R2 仍需确认三项修复。

scratch `/tmp/nerv-ui-t07-p01-fix/`；持久 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-p01-fix/`，附 `SHA256SUMS`。仅归档本轮 scripts/raw/probe/browser 与 handoff；过滤 node_modules/cache/cleancheckout/.vite/dist，旧实施和审核证据只保留 durable 指针，不复制数千文件。
