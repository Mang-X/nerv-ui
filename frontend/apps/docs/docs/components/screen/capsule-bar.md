---
title: NvCapsuleBar 胶囊进度
---

<script setup>
import { ref } from 'vue'
import { NvCapsuleBar, NvScreenButton, NvScreenPanel } from '@nerv-iip/ui'
const items = ref([
  { label: '阅读座席', value: 72.5, tone: 'cyan' },
  { label: '展览空间', value: 125.25, tone: 'indigo' },
  { label: '比较基线', value: -12.3, tone: 'amber' },
  { label: '共享客厅', value: 0, tone: 'green' },
])
</script>

# NvCapsuleBar 胶囊进度

每行显示标题、胶囊轨道与原始读数。填充限制在 0–100，文本保留全部输入精度和范围：125.25% 为满条，-12.3% 与 0% 都无填充，文本各自保留。状态不能只靠颜色区分，标题、数值和单位由宿主提供。

## 示例

<ScreenDemo>
  <NvScreenPanel title="预订分布" style="width: 520px">
    <NvCapsuleBar :items="items" />
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
      <NvScreenButton variant="secondary" @click="items = []">清空</NvScreenButton>
      <NvScreenButton variant="secondary" @click="items = [{ label: '新增阅读', value: 3.14159, tone: 'red' }]">替换</NvScreenButton>
    </div>
  </NvScreenPanel>
</ScreenDemo>

```vue
<NvCapsuleBar :items="[{ label: '阅读座席', value: 72.5, tone: 'cyan' }]" />
<NvCapsuleBar :items="[]" suffix="次" />
```

## API

### NvCapsuleBar 属性

| 属性     | 说明                             | 类型            | 默认                        |
| -------- | -------------------------------- | --------------- | --------------------------- |
| `items`  | 行数组；显式空数组不显示默认示例 | `CapsuleItem[]` | 内置 4 行分组示例，保持兼容 |
| `suffix` | 每个读数的单位                   | `string`        | `'%'`                       |

### `CapsuleItem` 字段

| 字段    | 说明                                | 类型                                                | 默认     |
| ------- | ----------------------------------- | --------------------------------------------------- | -------- |
| `label` | 行标题，长文字可通过 title 读取全文 | `string`                                            | 必填     |
| `value` | 有限数值                            | `number`                                            | 必填     |
| `tone`  | 填充颜色                            | `'cyan' \| 'indigo' \| 'green' \| 'amber' \| 'red'` | `'cyan'` |

## 设计说明

未知行由宿主另行说明或排除，不传 NaN 伪装有效比例。减少动态效果时停止填充过渡。组件不取数、不推断目标达成与否。数值列随读数宽度扩展，轨道可收缩；宿主仍须提供足够容器宽度。
