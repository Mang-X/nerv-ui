# T09/B：排程面板与草案站内示例

范围：#145，父 #10 的 B，独立 scope:M 文档消费者交付。基点 `7251527490251b3ba52240cab8c965dff5b4a06f` / tree `a27c860a59a04e73b2d02a09a0113326ec2c11dd`。不修改生产 packages、锁、vendor、patch 或 migration。T01 来源仍固定 `79b1578f2b75f55709765b5e7882aaf33146c603`。

## Requirement | Evidence

| Requirement | Evidence |
| --- | --- |
| 全部 B 公开组件真实 live | [站内组合页](../../../frontend/apps/design-system/docs/components/desktop/scheduling-live.md)：面板段的 SchedulingToolbar、SchedulingLegend、TaskDetailPanel、ConflictPanel、UnscheduledPanel、ChangeSummaryPanel；草案段 SchedulingDraftBoard 内部真实组合 SchedulingDraftFeedback、SchedulingDraftClearDialog，兼容别名不另造实现 |
| 选择、当前 ID、替换、接受拒绝、只读、事实、搜索定位、维度排序与 Legend | `current task selection joins real panels facts search graph commands rejection readonly and replacement`；真实面板消费中性 `panelModel`，图与 Legend 接收相同参数。图只读、详情可请求锁定，不声称图可编辑；0/unknown 来自 host |
| 受控草案与反馈 | `draft public composition rejects edits then accepts and renders feedback with current selection`；三视图、选择、锁定、待排、undo/redo 复用既有 DraftEditingDemo recipe，不实现求解器 |
| 保存 true/false/throw/缺 callback 与重试 | `save receipt false retains or saves only the current memory snapshot`、`save receipt failure retains or saves only the current memory snapshot`、`save receipt missing retains or saves only the current memory snapshot`、`save receipt success retains or saves only the current memory snapshot` |
| 清空失败、重试、取消、安全提示和当前来源 | `clear false retries true and cancel keeps the draft unchanged`、`clear thrown failure preserves edits and safe retry can restore the baseline`、`delayed save and clear receipts cannot overwrite a replacement source` |
| assignment / marker / 同名 ID 空间 | `existing resource Markdown accepts dimension assignments and unassigned markers without equating IDs` 直接从实际资源 Markdown 的 script 与全部 Demo 内容编译 SFC；`dimension null markers and pure resource unassignment remain separate in the draft host`。原资源页两处拖拽使用公开 useSchedulingEdits；字段选择仅按本页显式目录映射 |
| 有效入口与原页面保留 | `connects both public live compositions from the existing scheduling pages and sidebar`；A 的 `retains the frozen 174 pages and 206 site files` 仍执行。原 gantt/resource 的基础、刻度、图例、详情、只读、加载、空态、时间块、日历与图外编辑变体保留；新增 1 页，无删页 |
| RED → GREEN | 原资源 Markdown 实际渲染测试在 base 失败（team assignment 未接纳）；拒绝开关变异测试也失败。恢复后 A6 + B12 = 18/18，3 files，exit 0。入口缺失 RED 另保留 |
| 门禁 | 完整 docs:typecheck、docs:build exit 0；scoped lint/fmt、diff check、相对文件链接与原清单保留通过。执行命令与原始日志在外部 handoff |

## 证据边界与来源

外部原件：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-b-implementation-r1/`。handoff 含具体命令、对象、全部测试精确名、已读/未读、归档逐 SHA256 回读。

已核当前公开 barrel、props/events/defaults，panel/draft/legend 与 useSchedulingEdits producer；文档 host 沿用 playground 中性 panelModel 与 DraftEditingDemo（复制为文档本地 recipe，去掉 playground 导航/页头，不依赖其应用运行时）。新增示例时间明确 Asia/Shanghai；原三共享模型仍显式 UTC，原表单输入也使用 UTC 到分钟。无新增 SDK/auth/router 业务、依赖或永久 runtime registry。Demo 使用既有 ClientOnly/vp-raw 容器；短时延迟仅在点击后创建，卸载清理。

jsdom 仅 stub 两种图的模型/命令边界，公共面板、草案、反馈和确认对话框真实渲染；不证明 DHTMLX、native 或浏览器图面。日志保留 jsdom CSS stylesheet 解析诊断；运行时与 unhandled 数字未单独收集，UNKNOWN。完整 build 仅证明 SSR/静态产物，不称真实交互 PASS。

继承 A6、历史 alias RED、时区 gate FAIL、global fmt 3 FAIL、TZ timeout 均保留，不以新 PASS 擦除。vendor policy 四项 skip 零执行；DHTMLX 9.1.4 Evaluation 声明水印及字节不改，license UNKNOWN。browser/native/vendor 独立运行席、CI、packed、device、APS/production UNRUN。旧四应用接入/退出 NOT_PLANNED。C/D/E/F/G/H 各自另验；本席不 review/ready/merge/验收 comment/close/watch/发布。
