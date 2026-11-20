---
title: 看板与记录卡
---

<script setup>
import LocalKanbanRecordExample from '../../.vitepress/examples/localKanbanRecordExample.vue'
</script>

# 看板与记录卡

把书篮按阅读状态分列。重排或替换待阅读书目后，点击「查看」可读取当前书目的反馈；恢复按钮重置本页书篮。数据只在本页内存中变化，不代表业务保存。

## 示例

<Demo>
  <LocalKanbanRecordExample />
</Demo>

<<< @/.vitepress/examples/localKanbanRecordExample.vue

## API

从 `@nerv-ui/ui` 主桶导入 `NvKanban` 与 `NvRecordCard`。看板接收 `columns`，每列有稳定 `key`、标题和 `items`；`itemKey` 使用记录 ID，`item` 插槽提供当前 `item` 与 `column`。重排和替换由宿主管理，当前组件没有拖拽 API。

记录卡接收 `recordNo`、`title`、`status`、`meta` 和 `progress`，`actions` 插槽放置记录操作。进度为 0–100，本例明确保留 0%，并展示 45%；不传进度表示未提供，而非零。篇幅以数值、空格和单位 `pages` 表示；完整书名在卡片正文换行展示。

## 设计说明

空列显示「暂无卡片」。窄屏在看板内横向滚动到「已读完」；看板可聚焦，按钮使用原生键盘入口。
