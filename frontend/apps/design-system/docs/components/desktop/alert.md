---
title: Alert 警告提示
---

<script setup>
import { Alert, AlertTitle, AlertDescription } from '@nerv-iip/ui'
import { InfoIcon, TriangleAlertIcon } from '@lucide/vue'
</script>

# Alert 警告提示

页面内常驻的提示条，用于陈述上下文、风险或操作结果，区别于短暂的轻提示。`Alert` 由 `AlertTitle` 与 `AlertDescription` 组合而成。

## 示例

<Demo>
  <Alert class="max-w-md">
    <AlertTitle>计划已锁定</AlertTitle>
    <AlertDescription>今日分组 A 计划已下发，所需资源已锁定，开始后不可再调整顺序。</AlertDescription>
  </Alert>
</Demo>

```vue
<Alert>
  <AlertTitle>计划已锁定</AlertTitle>
  <AlertDescription>今日分组 A 计划已下发，所需资源已锁定，开始后不可再调整顺序。</AlertDescription>
</Alert>
```

图标作为 `Alert` 的直接子节点，自动对齐到标题与描述左侧。

<Demo>
  <Alert class="max-w-md">
    <InfoIcon aria-hidden="true" />
    <AlertTitle>数据网关已同步</AlertTitle>
    <AlertDescription>最近一次采集于 16:00，下一次将在 5 分钟后自动拉取。</AlertDescription>
  </Alert>
</Demo>

```vue
<Alert>
  <InfoIcon aria-hidden="true" />
  <AlertTitle>数据网关已同步</AlertTitle>
  <AlertDescription>最近一次采集于 16:00，下一次将在 5 分钟后自动拉取。</AlertDescription>
</Alert>
```

<Demo>
  <Alert variant="destructive" class="max-w-md">
    <TriangleAlertIcon aria-hidden="true" />
    <AlertTitle>资源节点阻塞</AlertTitle>
    <AlertDescription>RES-ASM-04 处于阻塞状态，已暂停指派，请先处理报警。</AlertDescription>
  </Alert>
</Demo>

```vue
<Alert variant="destructive">
  <TriangleAlertIcon aria-hidden="true" />
  <AlertTitle>资源节点阻塞</AlertTitle>
  <AlertDescription>RES-ASM-04 处于阻塞状态，已暂停指派，请先处理报警。</AlertDescription>
</Alert>
```

## API

| 属性      | 说明     | 类型                     | 默认      |
| --------- | -------- | ------------------------ | --------- |
| `variant` | 视觉变体 | `default \| destructive` | `default` |
