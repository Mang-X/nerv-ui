---
title: NvRingGauge 环形仪表
---

<script setup>
import { computed, ref } from 'vue'
import { NvRingGauge, NvScreenInput, NvScreenPanel } from '@nerv-ui/ui'
const input = ref('72.5')
const finiteValue = computed(() => {
  const n = Number(input.value)
  return input.value.trim() !== '' && Number.isFinite(n) ? n : undefined
})
</script>

# NvRingGauge 环形仪表

裸内容环形进度。弧长把输入限制在 0–100；中心读数保留输入的范围，整数原样、小数四舍五入到一位。例如 125.25 显示 125.3%，弧长为满环；负数与零都没有填充，但读数不同。`label`、`suffix` 与数值共同组成 SVG 的可访问名称。

## 示例

<ScreenDemo>
  <NvScreenPanel title="空间比例" style="width: 360px">
    <NvScreenInput v-model="input" ariaLabel="预订比例" />
    <NvRingGauge v-if="finiteValue !== undefined" :value="finiteValue" label="预订比例" />
    <p v-else role="status">比例未知</p>
    <NvRingGauge :value="0" label="阅读比例" :size="120" :value-size="24" />
  </NvScreenPanel>
</ScreenDemo>

```vue
<NvRingGauge :value="72.5" label="预订比例" />
<NvRingGauge :value="125.25" label="原始比例" :size="160" :value-size="32" />
```

## API

### NvRingGauge 属性

| 属性        | 说明                                             | 类型     | 默认  |
| ----------- | ------------------------------------------------ | -------- | ----- |
| `value`     | 有限数字；弧长限制在 0–100，显示读数不作范围钳制 | `number` | 必填  |
| `label`     | 数值下方标题                                     | `string` | 必填  |
| `suffix`    | 单位                                             | `string` | `'%'` |
| `size`      | 外径，px                                         | `number` | `140` |
| `valueSize` | 中心字号，px                                     | `number` | `28`  |

## 设计说明

未知值不在数字 API 内。宿主应显示“比例未知”等文字并暂不挂载环，不能把 null、NaN 或缺失强转为 0。零是有效数值。环不计算业务比例；多个环没有共享 SVG fragment 引用。减少动态效果时停止弧长过渡，读数仍可更新。长标题、单位或大数应由宿主提供足够空间及滚动容器。
