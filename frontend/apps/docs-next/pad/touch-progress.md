---
title: NvTouchProgress 触屏进度条
---

<script setup>
import { ref } from 'vue'
import { NvTouchButton, NvTouchProgress } from '@nerv-ui-next/pad'
import '@nerv-ui-next/pad/styles.css'

const percent = ref(40)

function adjust(delta) {
  percent.value = Math.min(100, Math.max(0, percent.value + delta))
}
</script>

# NvTouchProgress 触屏进度条

平板端的进度指示，支持确定值与不确定值、两种尺寸和三种语义色。

## 示例

<Demo block>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <NvTouchProgress :value="percent" label="处理进度" show-value />
    <div style="display: flex; gap: 12px">
      <NvTouchButton size="md" variant="secondary" @click="adjust(-10)">减 10</NvTouchButton>
      <NvTouchButton size="md" variant="secondary" @click="adjust(10)">加 10</NvTouchButton>
      <NvTouchButton size="md" variant="ghost" @click="percent = 40">复位</NvTouchButton>
    </div>
  </div>
</Demo>

<Demo block>
  <NvTouchProgress label="等待资源分配" />
</Demo>

<Demo block>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <NvTouchProgress :value="72" tone="danger" label="风险记录" show-value size="md" />
    <NvTouchProgress :value="88" tone="neutral" label="已归档记录" show-value size="lg" />
    <NvTouchProgress :value="100" label="步骤已完成" show-value />
  </div>
</Demo>

## API

### NvTouchProgress 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 当前进度；`null` 时显示不确定值动画 | `number \| null` | `null` |
| `min` | 进度下限 | `number` | `0` |
| `max` | 进度上限 | `number` | `100` |
| `label` | 进度条上方的可见标签 | `string` | — |
| `showValue` | 在标签行末尾显示格式化后的数值 | `boolean` | `false` |
| `size` | 轨道高度：`md` 为 14px，`lg` 为 20px | `md \| lg` | `lg` |
| `tone` | 指示条语义色 | `brand \| danger \| neutral` | `brand` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `label` | 自定义标签内容 |
| `value` | 自定义数值内容，作用域为 `{ state }` |
