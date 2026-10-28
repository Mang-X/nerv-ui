---
title: 排程事实与比较
pageClass: nv-wide
---

<script setup>
import SnapshotFactsExample from '../../.vitepress/examples/SnapshotFactsExample.vue'
import ScheduleComparisonExample from '../../.vitepress/examples/ScheduleComparisonExample.vue'
</script>

# 排程事实与比较

本页使用中性活动的本地内存记录，不连接实际 APS，不保存或发布方案。来源名称与时间是示例输入，不能作为现场准备就绪的依据。DHTMLX 9.1.4 Professional Evaluation 声明与水印保留，商业授权 UNKNOWN。

## 用料、风险、冲突与负荷

<Demo block><div class="min-w-0 overflow-x-auto" role="region" aria-label="快照交互示例" tabindex="0"><SnapshotFactsExample /></div></Demo>

展开物料汇总、批次影响项、风险分组与零负荷窗口可查看明细。换用当前记录、替换全部记录、清空或恢复均只改变本地输入。预警中的“错误”字样不把 severity 改成阻断；负荷 0 不代表资源可用，未知量保留为“—”。活动详情始终从当前来源查询；只读关闭活动动作，展开和筛选仍可用。读取状态明确区分未知、缺失、无权和暂不可读取，不暴露任意技术异常。

MaterialShortageSummary、PlanRisks、PlanConflicts、ResourceLoads 直接消费公开 display/source 合同。中性自然语言标签采用普通字体；legacy 编号的 mono 12 与本地分钟显示由现有公共适配器负责，本页不改生产排版。数量最多三位小数，表格数量列右对齐；数量与单位分隔。原图面模型的显式 UTC 上下文保持，此页中性模型显式提供 Asia/Shanghai 与任务 timezone。

## 冻结基线与候选对照

<Demo block><div class="min-w-0 overflow-x-auto" role="region" aria-label="比较交互示例" tabindex="0"><ScheduleComparisonExample /></div></Demo>

同一活动换安排实例仍按 semantic key 对照；不同活动偶然同 assignment ID 不合并。午间活动由来源显式标为待安排；清空候选后是候选未提供，完工时间未知，候选说明不借用基线历史说明。来源指标只显示输入事实：零值保留，缺值显示“—”；“清空指标”和“不提供指标”分别演示空集与缺失。替换候选不改冻结基线，且清空旧选择。

ScheduleRevisionReview 与独立 SchedulingPreviewResult 共用当前候选；后者对应任务中称为 ScheduleRevisionPreview 的预览职责，当前公开桶仅导出 SchedulingPreviewResult，不另造组件或别名。可从比较摘要或只读图面选择当前活动，切到只读查看后关闭选择，仍能展开。图面始终禁止拖拽修改。“查看身份校验提示”通过合法 public 输入演示重复身份的安全错误；恢复两侧记录后重新显示图面，不捕获或掩盖校验结果。

示例来源为 `SnapshotRiskDemo.vue`、`ScheduleComparisonDemo.vue` 及中性 fixtures（固定基点 `074e832`）；只复制所需宿主逻辑和数据到文档本地，不导入 playground 应用运行模块。比较模型复用现有文档 panelModel，公开合同见[快照展示](../../../../../../docs/scheduling-snapshot.md)与[比较合同](../../../../../../docs/scheduling-comparison.md)。图面、内部风险组合和兼容名称不重复计为新组件。

返回[排程面板与草案](./scheduling-live)、[工单图](./gantt-chart)或[资源图](./resource-scheduler)，原页面和全部图面变体保留。构建与 jsdom 消费测试不代替最终产物的独立宽窄、亮暗和操作验收。
