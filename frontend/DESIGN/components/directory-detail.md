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
