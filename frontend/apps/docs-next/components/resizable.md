---
title: NvResizable 可调分栏
---

<style>
[data-slot='resizable'].nv-resizable-vertical { height: 280px !important; }
</style>

<script setup>
import { NvResizable } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'
</script>

# NvResizable 可调分栏

两栏之间用拖拽手柄或方向键调整比例，可设定最小、最大与可折叠范围。

## 示例

<Demo block>
  <NvResizable :default-size="32" :min-size="20" :max-size="70" label="调整左侧宽度">
    <template #start>
      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 14px">
        <strong>分组列表</strong>
        <span style="color: var(--vp-c-text-2)">第三分组</span>
        <span style="color: var(--vp-c-text-2)">第一分组</span>
        <span style="color: var(--vp-c-text-2)">校验部</span>
      </div>
    </template>
    <template #end>
      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 14px">
        <strong>记录详情</strong>
        <span style="color: var(--vp-c-text-2)">REC-1034 · 已完成 318 / 500 项</span>
        <span style="color: var(--vp-c-text-2)">拖动中间手柄可调整两栏宽度</span>
      </div>
    </template>
  </NvResizable>
</Demo>

<Demo block>
  <NvResizable
    orientation="vertical"
    class="nv-resizable-vertical"
    :default-size="45"
    :min-size="25"
    collapsible
    collapsed-size="48px"
    label="调整上方面板高度"
  >
    <template #start>
      <div style="font-size: 14px">
        <strong>上方面板</strong>
        <p style="margin: 6px 0 0; color: var(--vp-c-text-2)">
          收起后可拖回展开，方向键也能调整高度。
        </p>
      </div>
    </template>
    <template #end>
      <div style="font-size: 14px">
        <strong>下方面板</strong>
        <p style="margin: 6px 0 0; color: var(--vp-c-text-2)">纵向分栏适合上下对照的内容。</p>
      </div>
    </template>
  </NvResizable>
</Demo>

## API

### NvResizable 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `orientation` | 两栏并排或上下堆叠 | `horizontal \| vertical` | `horizontal` |
| `defaultSize` | 首栏的初始占比（百分比） | `number` | `30` |
| `minSize` | 首栏的最小占比（百分比） | `number` | `20` |
| `maxSize` | 首栏的最大占比（百分比） | `number` | — |
| `collapsible` | 允许首栏折叠到 `collapsedSize` | `boolean` | `false` |
| `collapsedSize` | 折叠后的尺寸，如 `0` 或 `48px` | `number \| string` | — |
| `step` | 方向键每次调整的百分比 | `number` | — |
| `largeStep` | Shift 加方向键每次调整的百分比 | `number` | — |
| `label` | 拖拽手柄的无障碍名称 | `string` | `调整面板大小` |

### NvResizable 插槽

| 插槽 | 说明 |
| --- | --- |
| `start` | 首栏内容 |
| `end` | 次栏内容 |
