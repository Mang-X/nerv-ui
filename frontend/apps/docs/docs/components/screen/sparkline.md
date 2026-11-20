---
title: NvSparkline 迷你趋势
---

<script setup>
import { ref } from 'vue'
import { NvScreenButton, NvScreenPanel, NvSparkline } from '@nerv-ui/ui'
const data = ref([8, 11, 9, 14, 12, 17])
</script>

# NvSparkline 迷你趋势

裸内容 SVG 折线按本序列最小值、最大值归一化，填满宿主给定的宽高。至少两个点才画线，显式空数组与单点显示虚线，不混入默认业务数据。常量序列为底部水平线，不表示绝对量级为零。

## 示例

<ScreenDemo>
  <NvScreenPanel title="阅读次数" style="width: 360px">
    <div style="height: 56px"><NvSparkline :data="data" area /></div>
    <p>阅读次数：{{ data.join(' → ') || '暂无数据' }}</p>
    <div style="display:flex;flex-wrap:wrap;gap:8px">
      <NvScreenButton variant="secondary" @click="data = [0, 10, 0]">替换为三点</NvScreenButton>
      <NvScreenButton variant="secondary" @click="data = []">清空</NvScreenButton>
    </div>
  </NvScreenPanel>
  <NvScreenPanel title="预订次数" style="width: 360px">
    <div style="height: 56px"><NvSparkline :data="[10, 0]" area color="var(--nv-scr-indigo)" /></div>
    <p>预订次数：10 → 0</p>
  </NvScreenPanel>
</ScreenDemo>

```vue
<div style="height: 56px">
  <NvSparkline :data="[8, 11, 9]" area color="var(--nv-scr-indigo)" />
</div>
```

## API

### NvSparkline 属性

| 属性    | 说明                           | 类型                | 默认                         |
| ------- | ------------------------------ | ------------------- | ---------------------------- |
| `data`  | 有限数值序列，至少两个点才画线 | `number[]`          | 内置示例序列，保持兼容       |
| `area`  | 线下渐变面积                   | `boolean`           | `false`                      |
| `color` | 线条及面积渐变颜色             | `string`，CSS color | `undefined`，使用 cyan token |

## 设计说明

有限数值即使跨越正负极大值也保留序列的相对高低，不因中间跨度溢出产生无效路径；归一化不表示绝对量级。改变点数、颜色或面积开关均使用当前输入。每实例渐变 ID 独立，面积引用本实例 defs。图形自身 `aria-hidden`，宿主须同时提供标题、序列原文或等价可访问说明；只给图形不构成完整读数。缺测含义由宿主说明，不把未知点转成零。减少动态效果时停止路径过渡，图形仍更新。这里没有 hover、轴、取数或业务聚合能力。
