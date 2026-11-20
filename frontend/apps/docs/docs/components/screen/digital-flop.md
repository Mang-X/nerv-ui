---
title: NvDigitalFlop 数字翻牌
---

<script setup>
import { ref } from 'vue'
import { NvDigitalFlop, NvScreenButton, NvScreenPanel } from '@nerv-ui/ui'
const value = ref(1284)
</script>

# NvDigitalFlop 数字翻牌

数字按千位分组并保留小数位，更新时在 0.6 秒内收敛到最新值；减少读数也可更新。字符串逐字原样显示，适合宿主已经格式化的读数或“尚未统计”。可访问名称包含完整读数和单位。

## 示例

<ScreenDemo>
  <NvScreenPanel title="到访计数" style="width: 600px; overflow: auto">
    <NvDigitalFlop :value="value" suffix="人次" />
    <div style="display:flex;flex-wrap:wrap;gap:8px">
      <NvScreenButton variant="secondary" @click="value = 2400.5">增加</NvScreenButton>
      <NvScreenButton variant="secondary" @click="value = 12.25">减少</NvScreenButton>
      <NvScreenButton variant="secondary" @click="value = '12 345.67 · 待核对'">显示文字</NvScreenButton>
      <NvScreenButton variant="secondary" @click="value = 0">有效零值</NvScreenButton>
    </div>
  </NvScreenPanel>
</ScreenDemo>

```vue
<NvDigitalFlop :value="1284.5" suffix="人次" />
<NvDigitalFlop value="尚未统计" />
```

## API

### NvDigitalFlop 属性

| 属性     | 说明                     | 类型               | 默认 |
| -------- | ------------------------ | ------------------ | ---- |
| `value`  | 数字自动分组；字符串原样 | `number \| string` | 必填 |
| `suffix` | 末尾单位                 | `string`           | 无   |

## 设计说明

有限数字按 JavaScript `number` 的最短表示计算有效小数位（含科学计数法）：`1e-7` 显示 `0.0000001`，`1.25e-7` 显示 `0.000000125`。最多展开 100 位小数；需要超过 100 位时保留最短科学计数法，例如 `1e-101`、`5e-324`，避免四舍五入成零或触发格式化范围异常。普通数字仍按千位分组；这不提供任意精度或金融运算。NaN、无穷值不属于有效数字输入。

快速再次更新会替换旧目标；切换到字符串或卸载时取消在途 RAF。系统进入 `prefers-reduced-motion: reduce` 时立即显示最终数字，后续数字更新不启动 RAF；读数不随动画移除。字符串不是数值解析接口，`'0'` 与 number 0 都能显示，但只有数字参与过渡。未知由宿主传明确文字，不用 NaN。长读数应放在可聚焦、可滚动的宿主区域，避免裁切；不承诺任意长度自动缩字。
