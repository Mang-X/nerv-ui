## 使用规则

`NvMobileTaskListShell` 组合 `NvPullRefresh`、`NvInfiniteList`、`NvMobileEmpty`、`NvMobileErrorRetry` 与移动按钮，适合局部筛选列表；不包含取数、游标运算、详情草稿或业务模型。布局沿用来源的固定筛选区、自有滚动区、保留行和局部错误。

## 判定

首次错误不能显示空成功；仅 `state=ready`、无 pending/错误且 loaded=0 才显示空态。未知后续 `hasMore=null` 与暂停、完成分别表达。`errorMessage` 为首次/刷新错误，`appendErrorMessage` 为后续页错误，安全文案由宿主分类；诊断留在宿主 callback 或 `storageError` 通道。

## 正例

宿主以稳定 sourceKey/filterKey 标识请求归属，以 pageKey 标识成功提交的游标或 revision。暂停先 abort；success/catch/finally 均再次核对当前控制器与最终身份。重试沿用失败游标，成功去重不以可见行数推算分页。原地数组批量修改不能作为同步查询触发源；本组合不拥有选择/详情，因此不清理任何宿主草稿。

存储接口可省略；省略不表示已保存。注入同步 load/save，仅存 source 的 filterKey 和实际位置。恢复筛选是请求，宿主可拒绝；拒绝后不在推测筛选下加载。外部替换 storage、切换 source/filter、卸载取消旧恢复。恢复跨页只在成功 pageKey 推进后继续，失败暂停并等待重试，完成则保存实际可达位置。滚轮、触摸起手、键盘与实际手动滚动终止恢复，不覆盖用户的新位置。

## 反例

不要把业务 namespace、sessionStorage、SDK、认证或 fetch 放进库；不要把 unknown 当 false/0。不要在未渲染或未测量高度前宣布恢复完成。不要在 handler 缺失或拒绝请求时自动忙循环。不要把 source A 的位置写入 B。
