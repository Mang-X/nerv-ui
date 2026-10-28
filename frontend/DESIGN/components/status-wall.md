# 分组状态墙决策

## 规则

远距状态密集展示使用 `NvScreenStatusWall`，flat 保留六列、122px 行高、12px 行距和 overscan=2；容器必须有确定高度。单个 item 输入纯展示标签、可辨身份、摘要、显式 label/tone 与可选分组，宿主保持 key 唯一稳定。状态不根据中文推导。

## 判定

需要大数据有限 DOM 时选 flat；分组紧凑格用于按区扫视，分组横条用于并排比较。两个分组模式渲染全部项目，visible 表示已渲染项目，包含 overscan，不能当作像素命中结果。有限 DOM 保证仅覆盖 flat。

## 正例

书房位置与花园区域均由宿主内存提供。组件发出 preview/select/visible；宿主用既有 `NvScreenPanel` 显示等待、结果、失败和当前身份。items、同 key 新版本、分组模式、滚动、离页均取消旧预览资格。异步提交再核归属，不能只依赖 watcher。

## 反例

不把 factory、Device、参数配色、统计归并、请求、缓存或固定轮询放入库。计数与业务摘要由宿主生成。完整 info/parameter/history、mini spark 取值和缩放 portal 属后续详情范围；本墙不增加浮层框架，也不承诺分组虚拟化。技术值与人类身份分开；零与未知保留输入区别。
