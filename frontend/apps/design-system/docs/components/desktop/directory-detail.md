---
title: 目录筛选与只读详情
---

<script setup lang="ts">
import DirectoryDemo from '../../../../playground/src/directory-detail/DirectoryDemo.vue'
</script>

# 目录筛选与只读详情

<Demo><DirectoryDemo /></Demo>

<!--@include: ../../../../../DESIGN/components/directory-detail.md-->

## 宿主合同

可运行源码为 `apps/playground/src/directory-detail`。`DirectoryHost` 提供 source、parents、entities、query、timeline 和可选 create；具体类型在同目录 `contract.ts`。query 接收筛选快照、从 1 开始的页码和每页数量，返回完整窗口及总数。timeline 返回 ready/items、forbidden/message 或 unlinked/message，抛错只显示安全文案和重试。

`filter` / `update:filter` 是唯一筛选通道；页码属于组合本地状态。宿主必须提供稳定且唯一的 row.key；同 key 替换刷新详情内容，重排不改变身份。候选更新不重置详情；删除后禁用旧动作。readonly 同步使创建和详情来源失效。

本页内存确认只表示本页保存，不代表后端持久化。浏览器视觉、HTTP、CI 与打包安装均未运行。
