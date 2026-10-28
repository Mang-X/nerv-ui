# T09/B R3 窄幅草案宿主返修

## 范围与原反例

仅修改 `SchedulingDraftExample.vue` 的示例根容器，不改全局 Demo、生产组件、依赖、锁或 vendor。独立 R3 在 390px 下观察到表格按钮与反馈被外框裁切，真实横向 wheel 不能恢复；原 FAIL 见外部 `t09-b-review-runtime-r3/review-receipt.md`，不覆盖。

## 本轮调整

窄屏内边距从 p-5 改为 p-2，sm 起恢复 p-5；根容器限制最大宽度并允许局部横向滚动。容器可聚焦且有“活动草案示例”名称，保留全部文字与操作。

## 验证边界

20 项既有合同测试通过，文档类型检查、目标 lint/format 与维护 diff-check 通过。测试 JSON 缺失 unhandledErrors，保持 UNKNOWN。本轮不新增只镜像 CSS 类名的断言；有效 RED 是独立 R3 生产浏览器反例，GREEN 留独立 R4 核实实际可读、滚动和命中。不把本地测试通过当成窄幅验收通过。

完整构建和实际退出码见外部 `t09-b-narrow-host-fix/handoff.md`。既有 R1/R2/R3 失败、全局格式失败及授权 UNKNOWN 保留；CI、packed、设备、APS 和生产仍 UNRUN。旧应用接入与退出为 NOT_PLANNED。
