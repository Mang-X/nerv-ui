# 通知收件箱

## 规则

使用中性通知事实组合列表、详情与任务。宿主负责数据、筛选结果、记录身份、异步状态和已读结果；组件仅发出请求。不包含认证、查询、轮询或 SDK。

## 判定

PC 鼠标键盘表面使用 `NvNotificationInbox`。即时反馈继续使用现有 `toast`/通知工具；本件不新增通知引擎。浮层由宿主用既有 `NvSheet` 组合，面板不自行控制打开。

## 正例

宿主提供稳定唯一 key、可读 title、明确的 statuses label/tone；未读由 read=false 表示。markRead 后先传 pendingKeys，成功后替换 items，失败后传用户可读 error。filter 事件仅请求，宿主返回筛选后的 items。

## 反例

不从状态文字推断颜色，不把任务编号当标题，不使用数组索引为 key，不将点击当作服务成功。error 不传原始错误 payload。同 key 替换表示当前版本，宿主处理过期异步回执。
