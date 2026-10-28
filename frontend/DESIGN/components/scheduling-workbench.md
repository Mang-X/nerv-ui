# 工作台组合决策

## 规则

SchedulingWorkbench 保留来源公开名，组合 P04–P09；SchedulingHistory 拥有中性历史筛选分页、冻结选择及异步操作回执隔离。属于 scheduling/PC 专用组件（既有命名空间），不新增 primitive 或引擎。两域 recipe 只负责演示与导航。

## 判定

当前事实与历史快照分别提供，不能因相同 ID 互相借用。操作资格、确认说明、状态词表、下载内容由宿主注入。需要领域工作流时留在宿主；P16 不恢复业务 API/auth/router/poll/persistence。

## 正例

翻页后继续阅读所选快照；更换来源关闭旧详情并 abort；回调 true 才显示成功。窄布局纵排、根 grid minmax(0,1fr)、显式时区、数量零值保留、错误文案不显示技术异常。

## 反例

从当前页找不到 ID 就清空历史详情、按同名任务 join 当前事实、让旧请求 finally 解锁新请求、用 fake 通过声称真实 Evaluation 引擎通过。
