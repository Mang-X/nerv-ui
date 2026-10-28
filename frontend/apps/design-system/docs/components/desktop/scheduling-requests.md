---
title: 排程请求与异步候选
pageClass: nv-wide
---

<script setup>
import RequestFormsExample from '../../.vitepress/examples/RequestFormsExample.vue'
import AsyncCandidatesExample from '../../.vitepress/examples/AsyncCandidatesExample.vue'
</script>

# 排程请求与异步候选

本页项目、结果和保存回执只存在于本页内存，刷新后消失；没有连接资格查询、实际 APS 计算或后端保存。显示完成只说明本页接收了当前请求的结果；“已保存”只说明本页接收了当前保存确认。DHTMLX 9.1.4 Professional Evaluation 声明与水印保留，商业授权 UNKNOWN。

## 候选项目与单项请求

<Demo block><div class="min-w-0 overflow-x-auto" role="region" aria-label="请求表单交互示例" tabindex="0"><RequestFormsExample /></div></Demo>

在本页状态设置中选择范围未就绪、读取中、读取失败、显示项目或空结果。搜索不存在的名称可查看无匹配；筛选后“加入当前显示项”只加入可见行，隐藏项按所选策略保留或清除。优先级空值表示未提供，0 是实际值；编辑和保存只更新本页记录。

从清单、详情、建议进入固定项目，或从关联记录搜索后人工选择。窗口预设和自定义本地分钟值由宿主校验，输入不转成 UTC；本页按 Asia/Shanghai 解读，不连接真实场地日历。选择来源接受、未确认、失败、等待或缺信息回执，可操作重试与迟到确认。加入现有安排时，窗口内的来源响应区可直接切换响应、确认等待请求、转为只读或换来源。新建安排的等待请求可关闭窗口后从本页状态区接收迟到确认；变更响应后重新打开请求。完整回执必须同时提供 key 和 label；没有完整确认不会显示成功。进入只读后选择和提交不可用，切换来源或关闭请求后旧回执失效。

SchedulingOrderPool 与 SchedulingSingleOrderDialog 直接渲染；SchedulingCandidatePicker 和 SchedulingHorizonFields 在单项窗口内部共享真实交互。SingleOrderSchedulingDialog 兼容别名使用相同实现，不另建示例。

## 当前候选、插单影响与停机提示

<Demo block><div class="min-w-0 overflow-x-auto" role="region" aria-label="异步候选交互示例" tabindex="0"><AsyncCandidatesExample /></div></Demo>

开始核实后可显示计算中、停止、让本轮结果不可用并重试，或手动接收本轮结果。接收上轮成功或失败不会覆盖新请求。切换活动来源或已保存方案同步撤销旧请求和保存确认；只读时停止进行中的请求，完成结果仍可展开查看。恢复操作后可重新发起。结果产生后需单独选择并接收本轮保存确认，失败可重试；上轮确认不等于当前保存。

四件公开组件共享当前 context、baseline、job、request 与 candidate 身份。停机四态由宿主明确提供，备选数量未知和 0 分开；展开可查看影响活动。插单历史提供真实 total 并支持跨页选择，结果展示未知承诺时间、前后影响、移动路径与候选图面。时间到分钟并显式标时区；数量最多三位小数，技术编号弱化显示。任意技术异常不直接上屏。

来源：基点 `4b2d566c173d224be4e9276c7a86c4439fa4cf49` 的 RequestFormsDemo.vue / AsyncCandidateDemo.vue 及相应消费测试；仅提取有限中性 host 到 docs 本地，不导入 playground 运行模块。比较事实复用 C 的 comparisonFacts 与 panelModel。公开合同见[请求表单](../../../../../../docs/scheduling-request-forms.md)与[异步候选](../../../../../../docs/scheduling-async-candidates.md)。

返回[排程面板与草案](./scheduling-live)、[事实与比较](./scheduling-facts)、[工单图](./gantt-chart)或[资源图](./resource-scheduler)。已有页面及图面变体保留。局部 jsdom 与构建证据不代替最终产物的独立 browser/runtime、宽窄与亮暗验收。
