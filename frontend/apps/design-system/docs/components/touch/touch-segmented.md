---
title: NvTouchSegmented 分段切换
---

<script setup>
import { NvTouchSegmented } from '@nerv-iip/ui'
import { ref } from 'vue'

const view = ref('queue')
const viewOptions = [
  { value: 'queue', label: '待处理' },
  { value: 'done', label: '已完成' },
]
const shift = ref('day')
const shiftOptions = [
  { value: 'day', label: '早班' },
  { value: 'swing', label: '中班' },
  { value: 'night', label: '夜班' },
]
</script>

# NvTouchSegmented 分段切换

Pad 大触控的分段控制器：**48px** 高，一点即切，适合 2–4 个互斥视图。比 Pad 上的下拉选择少一次展开-选择的路径。与大屏的 NvScreenSegmented 同源，尺寸按大触控放大。

## 示例

`v-model` 绑定当前值，`options` 提供 `{ value, label }` 列表。组件保持受控：点击或按键发出 `update:modelValue`，选中态由宿主回传的值决定。

整体保持 48px 高，单段实际触控目标为 44px。Tab 进入当前选中项，左右方向键循环移动焦点并请求选择，Home / End 跳到首项 / 末项。宿主为 tablist 提供可访问名称，并展示对应内容。

`options` 的 `value` 应保持唯一且稳定；宿主重排、删除或插入选项后，键盘导航按当前顺序定位焦点并请求对应值，选中态仍等待宿主回传。

<Demo>
  <NvTouchSegmented v-model="view" :options="viewOptions" />
</Demo>

```vue
<script setup>
const view = ref('queue')
const viewOptions = [
  { value: 'queue', label: '待处理' },
  { value: 'done', label: '已完成' },
]
</script>

<NvTouchSegmented v-model="view" :options="viewOptions" />
```

段数建议 ≤4，超过改用列表或标签页。

<Demo>
  <NvTouchSegmented v-model="shift" :options="shiftOptions" />
</Demo>

## API

### NvTouchSegmented 属性

| 属性         | 说明       | 类型                                 | 默认 |
| ------------ | ---------- | ------------------------------------ | ---- |
| `modelValue` | 当前选中值 | `string`                             | —    |
| `options`    | 选项列表   | `{ value: string; label: string }[]` | —    |

### 事件

| 事件                | 说明       | 载荷     |
| ------------------- | ---------- | -------- |
| `update:modelValue` | 选中项变化 | `string` |
