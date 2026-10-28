# 照片与成功附件

## 规则

`NvPhotoAttachments` 属于移动层，用原生文件入口和受控列表组合照片附件；不是相机框架。`capture="environment"` 是浏览器提示，是否打开相机由设备决定。

## 判定

需要拍照或选择单张照片，并等待宿主完成回执后显示附件时使用。仅需通用上传队列时使用既有 `FileUpload`；它的 session/transport/owner 合同不适合简单 callback，不强迫此组合携带那些字段。列表复用原生 keyed ul；既有无限列表不适合少量成功回执。按钮、标签直接复用移动件；不创建 objectURL，不提供图片预览，因此不引入资源回收问题。

## 正例

宿主以 `upload(File, { signal, purpose })` 适配传输、类型和限额检查、后端 complete 回执；回执转换为非空 `key`、非空 `name` 和可选安全 `description`。`attachments` 为权威成功列表，监听 `update:attachments` 后决定是否采用。key 唯一且稳定，同名照片可用描述和可见等宽身份区分。

## 反例

不要把选取、字节传完或无 callback 当作成功。不要把 Error.message、HTTP 或任意响应直接当作用户文案。不要使用数组 index 删除或推算后端身份。不要把页面示范回执当作已保存。

## 所有权

`contextKey` 是来源/记录/版本失效身份；`purpose`、`accept`、`hint`、`upload`、禁用规则与受控列表变化会取消当前工作，含同 key 新版本。隐含宿主策略变化须改变 contextKey。每次提交检查快照与 callback 身份，拒绝迟到 success/failure/finally；取消/卸载发出 AbortSignal，宿主仍须正确处理实际传输取消。失败仅显示 errorMessage 或默认安全文案，原始异常通过 diagnostic 事件交宿主。无乐观列表；父拒绝更新则维持原列表。重试为重新选择，可重选同一文件。
