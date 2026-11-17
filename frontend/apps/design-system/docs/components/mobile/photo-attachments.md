---
layout: page
title: 照片附件
---

<script setup>
import Demo from '../../../../playground/src/PhotoAttachmentsDemo.vue'
</script>

# 照片附件

<!--@include: ../../../../../DESIGN/components/photo-attachments.md-->

<MobileDoc>
<template #phone><Demo /></template>
</MobileDoc>

## API

从 `@nerv-iip/ui-mobile` 主桶导入 `NvPhotoAttachments`、`PhotoAttachment`、`PhotoUpload`。

| 输入                      | 合同                                                               |
| ------------------------- | ------------------------------------------------------------------ |
| attachments               | 必填 readonly PhotoAttachment[]；宿主提供有效、唯一 key 的成功列表 |
| contextKey / purpose      | 必填 string；当前归属身份 / 宿主用途                               |
| accept / hint             | 必填 string；原生 accept 提示 / 宿主类型、限额说明；实际验证归宿主 |
| upload                    | 可选 PhotoUpload；缺失时禁用；必须完成后返回有效成功回执           |
| title                     | 可选标题，默认“照片附件”                                           |
| disabled / disabledReason | 可选禁用状态与安全理由                                             |
| errorMessage              | 可选宿主审核过的安全失败文案，默认“未能添加照片，请重试。”         |

`PhotoAttachment = { key: string; name: string; description?: string }`。
`PhotoUpload = (file: File, context: { signal: AbortSignal; purpose: string }) => Promise<PhotoAttachment>`。
事件：`update:attachments(PhotoAttachment[])` 请求更新；`diagnostic(unknown)` 仅诊断，不渲染原始异常。无 slot、无 expose、无 provider 或 SDK。没有内置大小上限，不验证传输协议。

[源码](../../../../../packages/ui-mobile/src/components/photo-attachments/PhotoAttachments.vue)、[类型](../../../../../packages/ui-mobile/src/components/photo-attachments/types.ts)、[中性宿主](../../../../playground/src/PhotoAttachmentsDemo.vue)。`/#mobile-photos/library` 与 `/#mobile-photos/studio` 使用明确的本页回执适配；无实际后端保存。浏览器、相机与物理设备证据分别 UNRUN。
