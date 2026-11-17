---
title: NvOeeHero 核心指标
---

<script setup>
import { ref, computed } from 'vue'
import { NvOeeHero, NvScreenPanel } from '@nerv-iip/ui'
const reading = ref('2,460')
const known = computed(() => reading.value.trim() !== '')
</script>

# NvOeeHero 核心指标

主数字、单位、变化文本及归一化 spark 面积。名称保留兼容；组件没有 OEE、同比或费用计算。主数字始终保持原色，只有 delta 文本有变化色。

## 费用下降但改善

宿主明确指定 `deltaTone="positive"`，无需在文本前添加假负号。清空输入表示未知，同时显式清空 spark，恢复 `0` 表示真实零。格式化及缺测判断由宿主负责。

<ScreenDemo>
  <div style="width: 600px">
    <label>费用读数 <input v-model="reading" aria-label="费用读数" /></label>
    <NvScreenPanel title="费用变化">
      <NvOeeHero label="文化空间 · 当日费用" :value="known ? reading : '—'" unit="元" :delta="known ? '较昨日 -5% · 节省' : ''" delta-tone="positive" :spark="known ? [90, 82, 86, 72, 64] : []" />
    </NvScreenPanel>
  </div>
</ScreenDemo>

```vue
<NvScreenPanel title="费用变化">
  <NvOeeHero label="当日费用" value="2,460" unit="元" delta="较昨日 -5% · 节省"
    delta-tone="positive" :spark="[90, 82, 86, 72, 64]" />
</NvScreenPanel>
```

## 旧调用

省略 `deltaTone` 时，仅文本开头（允许空白）的 `-` 或 `−` 呈红，其余呈绿。`较昨日 -5%` 不以负号开头，因此旧逻辑呈绿，不能据此判断好坏。显式 tone 支持 positive / negative / neutral，分别使用绿 / 红 / 弱文本色。

<ScreenDemo>
  <NvScreenPanel style="width: 600px">
    <NvOeeHero label="设备综合效率 OEE" :value="92.4" unit="%" delta="-2.7%" />
  </NvScreenPanel>
</ScreenDemo>

## 属性

| 属性        | 说明                                        | 类型                                    | 默认           |
| ----------- | ------------------------------------------- | --------------------------------------- | -------------- |
| `label`     | 数值标题                                    | `string`                                | 必填           |
| `value`     | 已计算/格式化的数字或文本；未知由宿主传 `—` | `number \| string`                      | 必填           |
| `unit`      | 小号单位                                    | `string`                                | —              |
| `delta`     | 原样显示；空字符串不显示                    | `string`                                | —              |
| `deltaTone` | 宿主决定变化的呈现含义                      | `'positive' \| 'negative' \| 'neutral'` | 旧前导负号规则 |
| `spark`     | 有限、常规量级的数字序列；少于两点不绘制    | `number[]`                              | 原内置示例序列 |

`NvOeeHero` 是裸内容，放入 `NvScreenPanel`。显式 `spark=[]` 不恢复示例；多实例使用各自的渐变定义。不接收 null、NaN、Infinity，也不根据主数字推算曲线。
