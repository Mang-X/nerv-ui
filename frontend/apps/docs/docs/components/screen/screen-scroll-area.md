---
title: NvScreenScrollArea 滚动区
---

<script setup>
import { NvScreenScrollArea } from '@nerv-iip/ui'
const rows = Array.from({ length: 14 }, (_, i) => ({ id: i, text: `${i + 1} · 街角阅读与河岸展览` }))
</script>

# NvScreenScrollArea 滚动区

基于 Reka ScrollArea 的大屏手动滚动区，使用既有 `--nv-scr-*` 令牌。细滚动条与上下缘箭头提示未读内容，不自动轮巡；原版 shadcn 不改动。

## 示例

<ScreenDemo>
  <NvScreenScrollArea style="max-height:180px">
    <div><div v-for="row in rows" :key="row.id" style="padding:12px">{{ row.text }}</div></div>
  </NvScreenScrollArea>
</ScreenDemo>

```vue
<NvScreenScrollArea type="always" style="height:240px" aria-label="空间消息">
  <div class="messages"><div v-for="row in rows" :key="row.id">{{ row.text }}</div></div>
</NvScreenScrollArea>
```

## API

### NvScreenScrollArea 属性

| Prop     | 类型                                        | 默认      | 说明           |
| -------- | ------------------------------------------- | --------- | -------------- |
| `type`   | `'hover' \| 'auto' \| 'always' \| 'scroll'` | `'hover'` | 滚动条浮现时机 |

### 插槽

| 插槽     | 说明       |
| -------- | ---------- |
| 默认插槽 | 滚动内容   |

## 设计说明

用 `height`、`max-height` 或 flex 约束根节点。内部 viewport 用 flex 传高，内容层为块级；自己的 flex/gap 样式放在 slot 内包装元素。

提示按真实 viewport 的 scrollTop、clientHeight、scrollHeight 计算。scroll、内容增删或替换、viewport 和内容尺寸变化都会更新；替换内容层后移除旧尺寸观察并观察新层。卸载时清理 scroll、ResizeObserver 和 MutationObserver。低动效时箭头不呼吸。

需要绑定原生滚动元素的 `useVirtualList` 等虚拟列表不适用；由其 owner 使用原生容器与既有 `.nv-scr-scroll` 样式，本票不提供虚拟墙。

独立宿主 `/#screen/data` 可追加、缩短、清空、恢复、替换内容和展开行高。自动轮巡另见 [NvScrollBoard](./scroll-board)。
