---
title: 排程面板与草案
pageClass: nv-wide
---

<script setup>
import SchedulingPanelsExample from '../../.vitepress/examples/SchedulingPanelsExample.vue'
import SchedulingDraftExample from '../../.vitepress/examples/SchedulingDraftExample.vue'
</script>

# 排程面板与草案

复用公开 `@nerv-iip/scheduling` 组件与现有中性活动 recipe。保存仅写入本页内存副本，刷新即结束，不连接后端。DHTMLX 9.1.4 Professional Evaluation 声明与水印保留，许可范围 UNKNOWN。

## 面板与当前事实

<Demo block><SchedulingPanelsExample /></Demo>

工具栏的 scale/group/laneOrder/search 均由宿主接纳并传给实际资源图及 Legend；搜索前后项发 selectTask/revealTask 命令，图面未就绪时给出理由。图面始终只读，详情的锁定请求可采用、拒绝或因只读隐藏。选择与详情按当前 task.id 关联，替换来源清空旧选择。ConflictPanel/ChangeSummaryPanel 的 select 使用同一身份；UnscheduledPanel 的 fix 仅记录联系请求。

参与人数 0、空备注与未知反馈来自 host 事实，不把未知补零。Legend 读取同一模型、刻度、维度和排序，不推测班次或负荷。工具栏默认 groupBy=workCenter、laneOrder=busiest；此例显式使用 name 排序。TaskDetailPanel 的 task 可缺省，readOnly 默认未开启；此例由 host 控制。

## 草案与内存回执

<Demo block><SchedulingDraftExample /></Demo>

SchedulingDraftBoard 内部真实组合 SchedulingDraftFeedback 与 SchedulingDraftClearDialog，也组合工具栏、详情和双图；无须为内部组件再造一份实现。三视图消费相同 model，selectedTaskId、update/move/lock、待排及 undo/redo 都只是请求，宿主回写才接受；“保留原安排”拒绝回写。反馈仅为 host 提供的 unknown/开放时间提醒，不执行资格或排程求解。

save/clear 接收当前模型副本和 AbortSignal，严格 true 才表示成功；false、throw 或缺 callback 均保留草案并给安全提示，可再次尝试。清空取消不执行；重试模式首次 false、第二次 true。延迟失败期间替换来源或收起安排使旧回执失效，不污染新来源。clear 成功在本页恢复当前来源基线，不表示删除服务记录。回调只在点击时创建短时计时器，SSR 不启动常驻任务。

本组合未自定义 slots；使用组件默认内容。完整 props/events 与接纳合同见[面板合同](../../../../../../docs/scheduling-panels.md)、[草案合同](../../../../../../docs/scheduling-draft.md)。兼容别名复用相同公开实现，不重复计数。快照与比较见[排程事实与比较](./scheduling-facts)；请求异步、工作台和日安排由后续文档项覆盖。

返回[工单图](./gantt-chart)或[资源图](./resource-scheduler)，原图面全部变体保留。

继续查看[排程请求与异步候选](./scheduling-requests)。
