---
title: NvToolbar 工具栏
---

<script setup>
import { ref } from 'vue'
import { NvToolbar, NvToggle, NvToggleGroup } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const format = ref(['bold'])
const view = ref(['table'])
</script>

# NvToolbar 工具栏

把相关操作收拢为单一 Tab 停靠点，方向键在按钮与切换组之间移动。

## 示例

<Demo block>
  <NvToolbar aria-label="格式工具栏">
    <NvToggleGroup v-model:value="format" multiple aria-label="文本格式">
      <NvToggle value="bold">粗体</NvToggle>
      <NvToggle value="italic">斜体</NvToggle>
      <NvToggle value="underline">下划线</NvToggle>
    </NvToggleGroup>
    <NvToggle variant="outline" default-pressed>显示网格</NvToggle>
    <NvToggle disabled>导出（禁用）</NvToggle>
  </NvToolbar>
  <p style="margin: 10px 0 0; font-size: 13px; color: var(--vp-c-text-2)">
    已启用格式：{{ format.join('、') || '无' }}
  </p>
</Demo>

<Demo block>
  <div style="max-width: 320px; width: 100%">
    <NvToolbar orientation="vertical" loop aria-label="视图工具栏">
      <NvToggleGroup
        v-model:value="view"
        orientation="vertical"
        aria-label="视图切换"
      >
        <NvToggle value="table">表格视图</NvToggle>
        <NvToggle value="list">列表视图</NvToggle>
        <NvToggle value="board">看板视图</NvToggle>
      </NvToggleGroup>
    </NvToolbar>
    <p style="margin: 10px 0 0; font-size: 13px; color: var(--vp-c-text-2)">
      当前视图：{{ view[0] ?? '未选择' }}
    </p>
  </div>
</Demo>

## API

### NvToolbar 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `orientation` | 工具栏排列方向 | `horizontal \| vertical` | `horizontal` |
| `loop` | 方向键在首尾之间循环 | `boolean` | — |
| `disabled` | 禁用整组 | `boolean` | `false` |

### 透传属性

| 属性 | 说明 |
| --- | --- |
| `aria-label` | 工具栏的无障碍名称，通过透传属性传入 |

工具栏内的 `NvToggle` 与 `NvToggleGroup` 会自动加入同一套方向键导航，无需额外配置。
