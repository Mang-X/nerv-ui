---
title: NvTimePicker 时间选择器
---

<script setup>
import { NvTimePicker } from '@nerv-iip/ui'
import { ref } from 'vue'

const planTime = ref('08:30')
const stepTime = ref()
</script>

# NvTimePicker 时间选择器

通过浮层选择小时与分钟。`NvTimePicker` 支持 `minute-step` 控制分钟粒度，触发器与日期选择器一致。

## 示例

<Demo>
  <div style="max-width: 240px">
    <NvTimePicker v-model="planTime" placeholder="选择时间" />
  </div>
</Demo>

```vue
<NvTimePicker v-model="planTime" placeholder="选择时间" />
```

「此刻」使用当前小时，按步长取最近分钟；若取整超过本小时最后一个候选，使用最后候选，不跨到下一小时。例如 5 分钟步长在 14:58 或 14:59 取 14:55，1 分钟步长保持当前分钟。

<Demo>
  <div style="max-width: 240px">
    <NvTimePicker v-model="stepTime" :minute-step="5" placeholder="按 5 分钟选择" />
  </div>
</Demo>

```vue
<NvTimePicker v-model="stepTime" :minute-step="5" placeholder="按 5 分钟选择" />
```

<Demo>
  <div style="max-width: 240px">
    <NvTimePicker :model-value="'08:30'" :disabled="true" />
  </div>
</Demo>

```vue
<NvTimePicker v-model="planTime" disabled />
```

## API

| 属性          | 说明                       | 类型             | 默认       |
| ------------- | -------------------------- | ---------------- | ---------- |
| `v-model`     | 绑定时间（`HH:mm` 字符串） | `string \| null` | `null`     |
| `minute-step` | 分钟步长                   | `number`         | `1`        |
| `placeholder` | 未选中占位文本             | `string`         | `选择时间` |
| `disabled`    | 是否禁用                   | `boolean`        | `false`    |
