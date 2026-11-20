---
title: NvToggle 切换按钮
---

<script setup>
import { ref } from 'vue'
import { NvToggle, NvToggleGroup } from '@nerv-ui-next/desktop'
import '@nerv-ui-next/desktop/styles.css'

const pinned = ref(true)
const format = ref(['bold', 'italic'])
const density = ref(['compact'])
</script>

# NvToggle 切换按钮

按下后保持选中状态的双态按钮，可用切换组共享选中值并支持方向键导航。

## 示例

<Demo>
  <div style="display: flex; align-items: center; gap: 12px">
    <NvToggle v-model:pressed="pinned" variant="outline">重点关注</NvToggle>
    <span style="font-size: 13px; color: var(--vp-c-text-2)">
      {{ pinned ? '已标记' : '未标记' }}
    </span>
  </div>
  <NvToggle default-pressed>默认按下</NvToggle>
  <NvToggle size="sm">小尺寸</NvToggle>
  <NvToggle disabled>禁用</NvToggle>
</Demo>

<Demo block>
  <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
    <NvToggleGroup
      v-model:value="format"
      multiple
      aria-label="文本格式"
    >
      <NvToggle value="bold">粗体</NvToggle>
      <NvToggle value="italic">斜体</NvToggle>
      <NvToggle value="underline">下划线</NvToggle>
    </NvToggleGroup>
    <span style="font-size: 13px; color: var(--vp-c-text-2)">
      已启用 {{ format.length }} 项：{{ format.join('、') || '无' }}
    </span>
  </div>
</Demo>

<Demo block>
  <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
    <NvToggleGroup
      v-model:value="density"
      deselectable
      aria-label="页面密度"
    >
      <NvToggle value="comfortable">宽松</NvToggle>
      <NvToggle value="compact">紧凑</NvToggle>
      <NvToggle value="dense" disabled>极紧凑（禁用）</NvToggle>
    </NvToggleGroup>
    <span style="font-size: 13px; color: var(--vp-c-text-2)">
      当前密度：{{ density[0] ?? '未选择' }}
    </span>
  </div>
</Demo>

## API

### NvToggle 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `pressed` | 受控按下状态（`v-model:pressed`） | `boolean` | — |
| `defaultPressed` | 非受控初始按下状态 | `boolean` | — |
| `value` | 在切换组内的标识值 | `string` | — |
| `disabled` | 禁用 | `boolean` | `false` |
| `focusableWhenDisabled` | 禁用时仍可获取焦点 | `boolean` | — |
| `size` | 尺寸 | `sm \| md` | `md` |
| `variant` | 外观 | `ghost \| outline` | `ghost` |

### NvToggle 事件

| 事件 | 说明 |
| --- | --- |
| `update:pressed` | 按下状态变化，参数为 `boolean` |

### NvToggleGroup 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 受控选中值（`v-model:value`） | `string[]` | — |
| `defaultValue` | 非受控初始选中值 | `string[]` | — |
| `multiple` | 允许多项同时按下 | `boolean` | `false` |
| `deselectable` | 单选模式下可再次按下以取消 | `boolean` | — |
| `disabled` | 禁用整组 | `boolean` | `false` |
| `orientation` | 排列方向 | `horizontal \| vertical` | `horizontal` |
| `loop` | 方向键在首尾之间循环 | `boolean` | — |

### NvToggleGroup 事件

| 事件 | 说明 |
| --- | --- |
| `update:value` | 选中值变化，参数为 `string[]` |

### NvToggleGroup 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 放置 `NvToggle` 子项 |
