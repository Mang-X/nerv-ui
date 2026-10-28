# 工作台组合（T07/P16）

从 `@nerv-iip/scheduling` 主桶消费 `SchedulingWorkbench`、`SchedulingHistory` 及 `SchedulingHistoryInput/Entry/Action`。源码中性示例 `/#schedule-workbench/library`、`/#schedule-workbench/studio`；排程各页面顶端可往返全部既有子入口，桌面入口保留。旧 `pages/scheduling.vue` 和 `dev/SchedulingPreview.vue` 被此 recipe 与 P01–P15 演示共同替代，不恢复 business-console 应用。

## 工作台接口

原名 SchedulingWorkbench 保留并进入主桶。可选 props：`model`、`loading=false`、`readOnly=false`、`engineKind=auto`、`defaultView=order`（order/resource）、`context`、`preview`、`release`。后两者沿用 [P03 host 签名](scheduling-host.md)，无回调不显示对应操作。`fix(orderId,operationId)` 仍是待处理入口的提案。新增 `before/after` 无参数 slot，供宿主放入口说明或导航。内部选择、图例默认展开、侧栏展开、刻度 auto；model 由输入克隆，换来源清理选择。只读输入禁止从内部开启编辑；只读、回调替换取消旧回执。

order/resource 复用 P04–P08 图、工具栏与面板；活动表格直接组合 P09 SchedulingDraftBoard，只读查阅，编辑草案通过既有草案入口。这里不新增清空/求解/分配算法，也不改变 P09–P15 合同。宽容器并排、窄容器侧栏纵向，根 grid 使用 `minmax(0,1fr)`。

## 中性历史输入

`SchedulingHistory` 必填 `input: {source,revision,state,entries}`，state 为 loading/ready/error。可选 `pageSize=5`（最小按1处理）、`readOnly=false`、`confirm/download`。本组件对当前输入集合做中性分页，不假装远程分页；宿主需要完整提供此集合。`retry` 事件请求宿主恢复输入，组件不做 query/poll/cache。搜索 label、状态 key、记录日（每条显式 timezone）交集过滤，筛选回第一页。已打开详情拥有独立克隆，不从翻页后的行按 ID 回查。

每条 entry 的 `key` 由宿主在当前 source/revision 中唯一提供；`label/status:{key,label,tone}/createdAt/timezone/quantity:number|null` 必填。quantity 最多3小数、右对齐，0 和 null 分别显示；key 为 mono-xs；时间显示到分钟并附 IANA TZ，坏时间显示未知。可选 `model` 和 `confirmation:{label,description,disabledReason?}`。确认词表及资格全由宿主提供，不猜 published/revoked 等领域状态。

`detail({entry})` slot 组合 P15 SavedPlan、P11 快照或其它已有读面。组件没有默认详情 renderer，也不按相同 task/plan ID 关联当前数据。`confirm/download(entry,{signal,source,revision}):Promise<boolean>` 收到操作独立克隆；true 才显示成功，false/throw 显示安全重试消息。下载函数由宿主准备文件并决定是否实际下载，库不调用 HTTP/Blob 服务。示例仅导出本地中性 CSV，不代表服务端 CSV 通过。

busy 期间禁重；取消等待/确认、过滤/翻页、只读变化、callback 替换、input（含嵌套）替换/错误/清空、关闭明细和卸载都会 abort 并隔离旧 success/catch/finally。保留详情只表示冻结阅读，不表示最新当前事实；来源变更即关闭。宿主也必须检查 signal，取消 UI 等待不能撤销已完成的外部副作用。

## recipe 分工

工作台当前事实、历史 entries 的模型和 P09 可编辑草案由各自 owner 提供；替换当前事实不改历史快照。P10 输入/申请、P11 风险缺口负荷、P12 比较、P13 候选停机、P14 日打印、P15 已保存关联导航通过既有入口实际操作；本票不为它们重建平行实现。其它所有表面保持原入口。旧四类应用接入与旧库退出已取消 NOT_PLANNED。

执行、来源能力映射和未执行边界见 [P16 证据](evidence/t07-p16/README.md)。文档站整体恢复 #10、packed #11 单列；此处源码演示不等于 packed 验证。
