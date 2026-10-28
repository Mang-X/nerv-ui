# T09/E SavedPlan 导航并发返修

## 原反例与范围

独立 R1 的最终 dist 真实浏览器发现：依次打开两条不同活动工单，第二条覆盖宿主单槽完成回调，第一条永久 pending。原 P1 与截图保留于外部 t09-e-review-runtime-r1；仅返修 SavedPlanExample 文档宿主，不改生产导航组件或合同。

## Requirement coverage

- `saved plan supersedes another task navigation without stranding either link and consumes each receipt once`：不同链接连续请求时旧请求结束；新请求确认后两者均可用；回执消费一次，失败后同链接可重试。
- `saved plan releases current navigation on fact replacement without reviving a cancelled destination`：事实替换结束当前导航，之后旧接收操作不恢复目的地。

旧实现定向 7 PASS / 2 FAIL；修改后完整文档局部 61 PASS / 0 FAIL。原始 red/green JSON 与日志保留，不以新 PASS 覆盖原浏览器 FAIL。缺失 runtime/unhandled 数字保持 UNKNOWN。

## 生命周期与边界

新导航先结束旧请求；取消使旧回执版本失效并释放 Promise。完成句柄消费后清除；当前计划、事实或读取状态替换及卸载均取消当前请求。被取消的请求正常结束，不伪报成功目的地；明确失败才沿公开组件显示安全重试提示。

types、完整 docs build、scoped lint/fmt 与维护 diff-check 的实际结果见外部 t09-e-navigation-fix/handoff.md。本席不运行浏览器；原 P1 是否在真实页面闭合及剩余工作台/日安排/打印矩阵留独立 R2。CI/packed/device/真实 APS/生产、原生打印及实纸仍 UNRUN；历史 FAIL/UNKNOWN 保留。旧四应用接入退出 NOT_PLANNED。
