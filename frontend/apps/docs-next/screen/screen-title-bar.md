---
title: NvScreenTitleBar 大屏分区标题
---

<script setup>
import { NvScreenTitleBar } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'
</script>

# NvScreenTitleBar 大屏分区标题

居中标题加短下划线，两侧是渐变细线，细线内端各有一个菱形节点。

## 示例

<Demo>
  <div class="nv-screen-stage" style="padding: 40px">
    <NvScreenTitleBar title="产线综合监控" sub="更新于 14:32" />
  </div>
</Demo>

## API

| 属性 | 说明 |
| --- | --- |
| `title` | 标题文字。 |
| `sub` | 副行，可选。 |
