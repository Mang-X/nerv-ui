# 已保存计划只读组合决策

## 规则

SchedulingSavedPlan（来源别名 SchedulingPlanGantt）拥有计划作用域、受控选择、资源板/详情/搜索的协调；SavedPlanOrders（SchedulingPlanOrders）拥有中性商业组→工单→活动树表；SavedPlanWorkOrderLink（SchedulingWorkOrderLink）只负责 host 授权的最窄导航回调及回执生命周期。它们延续 scheduling 专用包命名，不新增 UI primitive 或引擎。

## 判定

需要已保存方案只读阅读时使用本组合；需要单独树表或 link 时消费对应公开组件。编辑、求解、发布资格、真实查询和持久化交 host；P16 工作台消费本组合。分组维度/标签来自 host，图例和面板复用既有实现。

## 正例

host 明确提供 taskRefs、group key、planId、进度 0 或 unknown、权限不足/不可读/已知空，受控选择回写后展示当前任务 facts。发布按钮可置于 actions slot，host 决定权限与失败处理。

## 反例

按相同名称 join 工单、将 unknown 当 0、旧计划回执覆新、把任务 id 当业务操作 id、在库里 import router/auth/SDK、将 fake board PASS 当真实 Evaluation 引擎通过。
