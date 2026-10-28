# 已保存计划只读组合（P15）

`@nerv-iip/scheduling` 主桶提供 `SchedulingSavedPlan`、`SavedPlanOrders`、`SavedPlanWorkOrderLink`；保留来源名称别名 `SchedulingPlanGantt`、`SchedulingPlanOrders`、`SchedulingWorkOrderLink`。别名采用下列中性合同，不接受旧 SDK props。两域源码消费者为 `/#schedule-saved/library`、`/#schedule-saved/studio`；页面只使用本地数据。

## 输入与默认值

| 组件                   | 输入                                                                                            | 默认 / 行为                                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| SchedulingSavedPlan    | `planId: string`、`groupBy: string` 必填；`model?: ScheduleModel`                               | model.meta.planId 必须等于 planId；不推断工厂/时区/领域关联                                                                                       |
| SchedulingSavedPlan    | `state?: loading/ready/forbidden/unavailable`、`laneOrder?: LaneOrder`                          | ready、busiest；无 model 显示待选择；loading/无权/不可读分别显示                                                                                  |
| SchedulingSavedPlan    | `selectedTaskId?: string/null`                                                                  | 父输入权威；点击/搜索只提案，未接受不显示详情；换计划、删任务发 null，并使旧选择失效，同 key 返回不复活。相同计划/任务更新从当前 model 读取 facts |
| SchedulingSavedPlan    | `orders?: SavedPlanOrdersInput`、`commercial?: SavedPlanCommercial`、`links?: SavedPlanLinks`   | 每份带 planId；旧计划回执不显示。host 负责同计划内的请求取消/顺序；库不发请求                                                                     |
| SchedulingSavedPlan    | `planLabel/planStatusLabel/planRangeLabel?: string`                                             | 已保存计划 / 只读 / 不显示；host 提供名称、状态和显式时区范围                                                                                     |
| SchedulingSavedPlan    | `summary?: {planId,facts,notices?}`                                                             | host 提供统计、失效原因及不可绘制提示；数字 0 保留，null 显示 —；不计算发布资格                                                                   |
| SchedulingSavedPlan    | `categories?: {key,label}[]`、`shortages?: {planId,source,rows}`                                | 图例复用 P08；缺口复用 P11，不声称当前库存就绪                                                                                                    |
| SchedulingSavedPlan    | `onNavigate?: (request)=>void/Promise<void>`、`onOpenPlanDetail?: (planId)=>void/Promise<void>` | 无 callback 无操作；忙时禁重，失败用通用文案；更换目标/计划/卸载后的旧回执不再更新界面                                                            |
| SavedPlanOrders        | `planId/model` 必填；`orders/commercial/links/selectedTaskId/navigate` 可选                     | 无 model/plan 对应不关联任务；操作项只接受 taskId/orderId/operationId 三项完全相等的显式 taskRefs，不做名称/编码猜测                              |
| SavedPlanWorkOrderLink | `label/request/action` 必填；`target/navigate` 可选                                             | 缺目标或 callback 时纯文字；有目标也由 host 决定是否允许传入                                                                                      |

事件：组合 `update:selectedTaskId`、`update:groupBy`、`update:laneOrder`；侧表 `select(taskId)`。组合 `actions({planId})` slot 供 host 放发布按钮、禁用原因与 busy；slot 异步动作由 host 管理。Link 无事件/slot，label 提供文字。搜索、侧栏、刻度是局部状态（空关键词、展开、auto）；分组和排序受控。资源图只读，复用 P04 真实 renderer 与唯一 native fallback，不支持 native zoom/reveal 的等价承诺。取消或拒绝选择时局部重新挂载图面清除其内部选择；真实 vendor 和 native 的视觉一致性交父运行席验证。

`SavedPlanOrder.progress` 分 known(completed/planned) 与 unknown/forbidden/unavailable；commercial 分 loading/forbidden/unavailable/ready(groups)，未提供为未知、ready [] 才是已知无关联。商业组 key 与 label 分离，可同名多组。状态、进度、predecessors、详情风险/分段/时间/锁定/资源 facts 来自公开模型，不迁入 auth/router/SDK，不展示 HTTP 错误或技术 payload。

导航请求为 `{kind:'task',planId,taskId,orderId,target}` 或 `{kind:'group',planId,groupKey,target}`，真实 key 和当前上下文由输入构建。target 是 host 的不透明字符串，库不自行路由、不替 host 授权。详情按钮是独立 planId 回调。host 异步取数仍须取消旧请求；尤其相同 planId 的重刷必须由 host 保证最新回执，不能仅凭 planId 识别请求世代。

## 使用

```vue
<SchedulingSavedPlan
  :plan-id="planId"
  :model="model"
  :orders="orders"
  :commercial="commercial"
  :links="links"
  v-model:selected-task-id="selected"
  v-model:group-by="groupBy"
  :on-navigate="navigate"
>
  <template #actions="{ planId: current }">
    <button :disabled="!canRelease" @click="release(current)">发布</button>
  </template>
</SchedulingSavedPlan>
```

完整来源、旧签名和 consumer 处置、Requirement/Evidence 与执行边界见 [P15 证据](evidence/t07-p15/README.md)。旧四应用接入与旧库退出已取消 NOT_PLANNED；P16 工作台组合另行负责。
