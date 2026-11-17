---
title: NvKpiBar 指标横条
---

<script setup>
import { ref } from 'vue'
import { NvKpiBar } from '@nerv-iip/ui'
import { BookOpen, Users } from '@lucide/vue'
const items = ref([
  { icon: BookOpen, value: '1,284', label: '累计阅读', tone: 'cyan' },
  { value: '72.5%', label: '空间预订', ring: 72.5 },
  { icon: Users, value: '尚未统计', label: '待确认到访', tone: 'amber' },
])
</script>

# NvKpiBar 指标横条

自带底色和边框的横条，按输入顺序显示图标或小环、数值文字和标题。传入 `ring`（包括 0）优先显示环；省略环时使用实际 `icon` 组件。两分支使用同一份宿主文字，组件不会从环值推断 `value`。

## 图标与环

<ScreenDemo wide>
  <NvKpiBar :items="items" tabindex="0" role="region" aria-label="空间指标，可左右滚动" />
  <button @click="items = [{ value: '0% · 尚无预订', label: '空间预订', ring: 0 }]">有效零值</button>
  <button @click="items = [{ icon: BookOpen, value: '尚未统计', label: '阅读次数' }]">未知文字</button>
</ScreenDemo>

```vue
<NvKpiBar
  :items="[
    { icon: BookOpen, value: '1,284', label: '累计阅读' },
    { value: '125% · 超出目标', label: '空间预订', ring: 125 },
  ]"
  tabindex="0"
  role="region"
  aria-label="空间指标，可左右滚动"
/>
```

## 属性

| 属性    | 说明                         | 类型    | 默认                        |
| ------- | ---------------------------- | ------- | --------------------------- |
| `items` | KPI 单元数组；空数组保持为空 | `Kpi[]` | 内置 8 项工业示例，保持兼容 |

| 字段    | 说明                                     | 类型                           | 默认                  |
| ------- | ---------------------------------------- | ------------------------------ | --------------------- |
| `value` | 宿主提供的完整显示文字                   | `string`                       | 必填                  |
| `label` | 标题                                     | `string`                       | 必填                  |
| `icon`  | 图标组件，接收 size=19；有 ring 时不渲染 | `Component`                    | 无                    |
| `tone`  | 图标/数值强调色；amber 数值保持中性色    | `'cyan' \| 'amber' \| 'green'` | 无，使用 neutral 样式 |
| `ring`  | 环形填充限制在 0–100，文字不受钳制       | `number`                       | 无                    |

未知值可使用文字和 icon 分支，省略 `ring`，不硬传 NaN。环自身含 label/value 的可访问名称。长内容保持原文并横向滚动；宿主可用上例的 tabindex/role/aria-label 让键盘使用者访问横条。图标、文字和环值一致性由宿主负责。减少动态效果时停止环过渡，数字和文字仍可读。
