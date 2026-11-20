---
layout: page
title: 分页列表恢复
---

<script setup>
import Demo from '../../../../playground/src/mobile-task-list/MobileTaskListDemo.vue'
</script>

# 分页列表恢复

<!--@include: ../../../../../DESIGN/components/mobile-task-list-shell.md-->

<MobileDoc>
<template #phone><Demo /></template>
</MobileDoc>

## API

从 `@nerv-ui/ui-mobile` 导入 `NvMobileTaskListShell`、`MobileListStorage`、`MobileListPosition`。

| 输入                              | 合同                                                                      |
| --------------------------------- | ------------------------------------------------------------------------- |
| sourceKey / filterKey             | 必填 string，当前权威身份，不在内部乐观更改                               |
| pageKey                           | 必填 string 或 number，仅成功页提交后改变                                 |
| loaded                            | 必填 number，去重后可见行数，不推算游标                                   |
| state                             | 必填 unknown / ready，首次成功才能 ready                                  |
| hasMore                           | 必填 boolean 或 null；null 为未知                                         |
| pending                           | initial / refresh / append / null，可省略                                 |
| paused                            | 可选 boolean，权威启停值                                                  |
| errorMessage / appendErrorMessage | 可选安全文案；原始异常不进入 DOM                                          |
| emptyDescription                  | 默认“当前筛选下暂无内容。”                                                |
| storage                           | 可选同步 load(sourceKey) / save(sourceKey, position)，异常转 storageError |

事件：`refresh`、`loadMore`、`retry`、`retryLoadMore` 无参数；`update:paused(boolean)` 请求启停；`restoreFilter(string)` 请求恢复筛选；`storageError(unknown)` 诊断。宿主不响应事件时，不产生虚构成功。slots：`filters` 固定筛选区；默认 slot 为 keyed 内容，宿主拥有行 key。

[组件源码](../../../../../packages/ui-mobile/src/components/task-list-shell/MobileTaskListShell.vue)、[类型](../../../../../packages/ui-mobile/src/components/task-list-shell/types.ts)、[中性宿主](../../../../playground/src/mobile-task-list/MobileTaskListDemo.vue)。深链 `/#mobile-task-list/library` 与 `/#mobile-task-list/studio` 使用本页内存，不是后台存储。可以筛选、刷新、分页、暂停与一次失败重试。文档 live、浏览器与真机滚动未运行。
