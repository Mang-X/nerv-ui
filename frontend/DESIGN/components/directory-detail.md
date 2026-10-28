# 目录筛选与详情组合

## 规则

使用已有 NvEntityPicker、NvFilterBar、NvDataTable manual 分页、NvSheet 与 NvTimeline，组合源码由 playground 的 directory-detail 目录拥有，不新增公共组件或包导出。

## 判定

单选只能提交目录键；自由输入是名称或编号查询词，不伪装成已存在目录项。分区变更同时清下级。filter 是受控输入，拒绝更新时保持宿主值。宿主负责 query、create 和 timeline 回调；所有请求接收 AbortSignal，仍以请求版本拒绝不合作的旧回执。

创建需要非空名称、上级及宿主非空 receipt；失败保留草稿。翻页、筛选、来源更换和卸载使旧请求失效。时间线仅调用所选记录的来源；受限、未关联、失败、空记录分别显示，绝不查询其他来源补齐。

## 正例

两个中性书房/画室宿主共用一个 recipe。编号与名称分别显示，详情可选字段过滤 null/undefined/空串，保留 0。数值最多三位小数，单位独立；事件时间由宿主一次格式化为本地绝对分钟。

## 反例

不能复制业务 SDK、权限 store、MRP 匹配算法或按相近编号拼接记录；不能在回调返回前宣称保存成功。原应用接入 NOT_PLANNED。

## 来源与处置

固定来源 `79b1578f2b75f55709765b5e7882aaf33146c603`，素材原字节只读。

| 来源                                | input / event / slot / default 处置                                                                                                                                                                                                                                               |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DirectoryPicker                     | directoryType/skuCode/parent/formSiteCode/createContext 领域参数留宿主；model 编码改宿主稳定 key，编号另传 code；clearable/disabled/ARIA 复用。默认 dropdown 保留，选项由 host 提供。create/load-more/search 业务服务改 query/create 回调，筛选与创建分区分开。无私有 slot 迁移。 |
| DirectorySuggestInput               | 自由 model 文本保留为 FilterBar keyword；不把自由文本伪造成目录项。建议搜索与 SDK 由 host 提供，本 recipe 不复制领域目录算法。                                                                                                                                                    |
| useSearchableDirectoryPicker        | selected 名称、上下级范围、分页失败意图保留；默认 50/300ms、防重缓存、组织认证、资源类型和查询算法不迁移，每窗 2 是中性宿主展示选择。                                                                                                                                             |
| FulfillmentTimelineSheet            | open/order 改本地 stable selectedKey；update:open 复用 NvSheet；标题副区为当前名称/编号。原排产按钮不迁移，动作改当前记录筛选。关闭/换记录/readonly/卸载使旧来源失效。                                                                                                            |
| Body / Node                         | ready、空、restricted→forbidden、unlinked、failed/retry 由单一 timeline callback 表达；默认/按 key slot 改 NvTimeline items；状态文案由 host 映射，错误使用安全固定文案。编号、说明、分钟时间保留；原私有 CSS 用 token utilities，长说明可换行。                                  |
| useFulfillmentTimeline              | 只保留单源状态/重试语义；MRP 扫描、pegging、多跳关联、权限判断、紧急度与全量刷新算法不迁移。不得用相似编号补记录。                                                                                                                                                                |
| sales/orders、mes/work-orders/index | 直接消费的 manual page、真实 row identity、编号名称、行操作、详情打开与创建/级联字段为对照；SDK/路由/权限/派工/排程不迁移。相关模板采用 token 类、无独立 style 块需要复制。                                                                                                       |

## 生命周期与显示

候选 options 原地更新不关闭详情；同 key 替换更新当前内容与动作资格，删除后只显示移除说明。监听 source、callback identity 与有效筛选标量，不深监听整个 host；同批数组重排不以中间空槽启动额外时间线请求。readonly 同步取消创建并关闭详情，读取目录仍可继续。receipt 依合法 TypeScript 合同要求为非空字符串；缺失或运行时不合法结果进入安全失败并保留草稿。

`/#directory-detail/library` 与 `/#directory-detail/studio` 可分别进入，两类记录与新增内容相互独立。旧 `/#directory-detail` 默认书房。数值最多三位、表格右对齐 tabular、单位独立 normal/muted 并留空格；详情数值右对齐，编号 mono/xs/muted，标题 tracking-tight，无额外 KPI。分钟时间在 host 同一路径格式化一次。DOM 行为不代替视觉与键盘验收。
