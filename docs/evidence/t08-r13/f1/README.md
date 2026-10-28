# R13 R1 返修：范围与标签关联

仅 #31 / PR132。base `0072c1cec946b05a5744ae95f54097d608c12ef9`；返修前 head `9b1af32230621b07d60fc51771a429baaa883837`。独立 R1 的 Standards material 0、Spec P2 1：同色范围的图外说明无法对应图内区域。原 R1 拒绝和 probe FAIL 保留。

## 变更

复用安装的 Unovis 1.6.7 `VisPlotband` 公开 `labelText`、`PlotbandLabelPosition.TopInside`、`labelOffsetY` 与 `labelColor`，将宿主标签放到对应范围顶部中央，颜色引用 `--foreground`。没有额外覆盖层、图表框架、API 或依赖变更。完整图外说明继续保留；原 shared scale、裁剪与稳定 id 不变。

## Requirement coverage

- 同色、非空间顺序的 X 范围及 Y 范围分别带有自身标签，文字锚点落在各自真实 producer 矩形内；同 id 替换后无旧文字、删除后无区域：`labels each same-tone range inside its actual region regardless of input order and replacement`。正式回归 RED 为 7 PASS / 1 FAIL，GREEN 为 8/8 PASS。
- 独立 R1 原字节探针 `retains an identifiable label on each of two same-tone plot ranges` 本轮 PASS；整份 probe 3/3 PASS。临时测试文件已清除，没有改写原探针。

测试仍只控制 jsdom 缺失的 SVG 布局边界，保留真实 XYContainer、Line、Plotband 与 scale；不是实际浏览器可读性证据。极窄、重叠、边界标签和真实字体仍需视觉验收。

## 门禁与证据

最终 UI/命名/readiness/docs 合计 264 PASS、host/import 94 PASS；UI 和宿主 typecheck、playground build、受影响源码 fmt/lint 通过。正式 pnpm 11.22.0；未安装或升级。逐命令 argv/cwd/exit、原 JSON 和日志位于 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-28/t08-r13-band-label-fix/`。报告缺少 runtime/unhandled 数字字段，保持 UNKNOWN；CSS 解析和第三方构建 warning 原样保留。

本轮窄增量 diff-check exit 0。base→候选整体 raw diff-check 仍 exit 2，来自既有原始日志空白；R1 的报告口径纠正保留，未清洗历史日志。历史实现 FAIL、global fmt、docs alias、timeout 等不由本轮 PASS 覆盖。

UNRUN：真实浏览器 plot/resize/字体/重叠标签/命中与键盘、HTTP、docs Live/全站 build、CI、packed、device、vendor 专项、APS/production。旧应用接入和旧库退出 NOT_PLANNED，许可 UNKNOWN。PR 保持 draft，#31 open；本轮不 ready/merge/close/watch，不声明整票完成。
