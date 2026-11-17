---
title: NvTimeline 时间线
---

<script setup>
import { NvTimeline } from '@nerv-iip/ui'
import {
  FilePlus2Icon,
  PackageCheckIcon,
  PlayIcon,
  TriangleAlertIcon,
} from '@lucide/vue'

const items = [
  {
    key: 'created',
    title: '记录创建',
    label: '06-17 08:12',
    description: '由计划模块自动下发，关联条目已预占。',
    tone: 'neutral',
    icon: FilePlus2Icon,
  },
  {
    key: 'kitted',
    title: '资料就绪',
    label: '06-17 08:40',
    description: '5 项附件从 Alpha 库转入并送达处理区。',
    tone: 'success',
    icon: PackageCheckIcon,
  },
  {
    key: 'started',
    title: '开始处理',
    label: '06-17 09:05',
    description: '张伟在 RES-07 扫码开始，单件耗时 42s。',
    tone: 'brand',
    icon: PlayIcon,
  },
  {
    key: 'warn',
    title: '初审预警',
    label: '06-17 09:21',
    description: '指标 12.02 接近阈值上限，已通知负责人复核。',
    tone: 'warning',
    icon: TriangleAlertIcon,
  },
]
</script>

# NvTimeline 时间线

步骤流转 / 操作日志的垂直时间线。`NvTimeline` 用不透明语义色节点串接在连接轨上，每个事件含标题、元信息标签与描述，并可在末尾追加脉动的“进行中”节点。

## 步骤日志

<Demo>
  <div class="w-96">
    <NvTimeline :items="items" pending pending-text="处理中…" />
  </div>
</Demo>

```vue
<NvTimeline :items="items" pending pending-text="处理中…" />
```

其中每个 `TimelineItem` 形如：

```ts
const items = [
  {
    key: 'started',
    title: '开始处理',
    label: '06-17 09:05',
    description: '张伟在 RES-07 扫码开始，单件耗时 42s。',
    tone: 'brand',
    icon: PlayIcon,
  },
  // …
]
```

## 属性

| 属性          | 说明                                                            | 类型             | 默认      |
| ------------- | --------------------------------------------------------------- | ---------------- | --------- |
| `items`       | 事件数组（`title` / `label` / `description` / `tone` / `icon`） | `TimelineItem[]` | —         |
| `pending`     | 末尾追加脉动的进行中节点                                        | `boolean`        | `false`   |
| `pendingText` | 进行中节点文案                                                  | `string`         | `进行中…` |
| `reverse`     | 最新优先排序                                                    | `boolean`        | `false`   |

`TimelineItem.tone` 取值：`brand \| success \| warning \| danger \| neutral`。
