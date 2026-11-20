---
title: NvMobileVirtualList 虚拟列表
---

<script setup>
import { NvMobileVirtualList } from '@nerv-ui-next/mobile'
import '@nerv-ui-next/mobile/styles.css'

const rows = Array.from({ length: 5000 }, (_, i) => ({ id: i + 1, name: `记录 ${i + 1}` }))
</script>

# NvMobileVirtualList 虚拟列表

固定行高的虚拟滚动：只渲染可见窗口加缓冲行。5000 行在这里也只挂几十个节点。

## 示例

<Demo block>
  <NvMobileVirtualList :items="rows" :item-height="44" style="height: 280px; border: 1px solid var(--vp-c-divider); border-radius: 8px">
    <template #default="{ item, index }">
      <div style="display: flex; align-items: center; padding: 0 12px; height: 44px; border-bottom: 1px solid var(--vp-c-divider)">
        <span style="opacity: 0.5; width: 56px">{{ index + 1 }}</span>
        <span>{{ item.name }}</span>
      </div>
    </template>
  </NvMobileVirtualList>
</Demo>

## API

| 属性 / 插槽 | 说明 |
| --- | --- |
| `items` | 列表数据。 |
| `itemHeight` | 每行固定高度（px）。固定行高是这份实现的前提，行高不定要逐行测量，是另一套复杂度。 |
| `buffer` | 视窗外多渲染的行数，默认 `6`。 |
| 默认插槽 | 行渲染，参数 `{ item, index }`。 |
| `class` / `style` | 必须有界高度，否则只按视口高度裁剪。 |
