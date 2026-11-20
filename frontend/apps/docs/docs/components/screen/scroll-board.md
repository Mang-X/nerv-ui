---
title: NvScrollBoard 无缝滚动板
---

<script setup>
import { NvScrollBoard } from '@nerv-ui/ui'
const messages = Array.from({ length: 12 }, (_, i) => ({ id: i, text: `${i + 1} · 城市共读与河岸影像` }))
</script>

# NvScrollBoard 无缝滚动板

自动轮巡消息列表。长列表渲染原始与重复两份，按帧位移、按原始列表高度回环。`speed` 为像素/秒；短列表或空列表静止，不显示多余重复行。

## 示例

<ScreenDemo>
  <div style="height:150px">
    <NvScrollBoard :items="messages" :row-key="row => row.id" :speed="28" aria-label="城市消息">
      <template #row="{ item }"><div style="height:36px">{{ item.text }}</div></template>
    </NvScrollBoard>
  </div>
</ScreenDemo>

```vue
<NvScrollBoard
  :items="messages"
  :row-key="(row) => row.id"
  :speed="28"
  style="height:200px"
  aria-label="城市消息"
>
  <template #row="{ item, index }">
    <div class="message-row">{{ index + 1 }} · {{ item.text }}</div>
  </template>
</NvScrollBoard>
```

## API

### NvScrollBoard 属性

| Prop           | 类型                                           | 默认      | 说明       |
| -------------- | ---------------------------------------------- | --------- | ---------- |
| `items`        | `T[]`                                          | —         | 泛型列表   |
| `speed`        | `number`                                       | `28`      | 像素/秒    |
| `pauseOnHover` | `boolean`                                      | `true`    | 悬停暂停   |
| `rowKey`       | `(item: T, index: number) => string \| number` | 下标      | 稳定行身份 |

### 插槽

| 插槽   | 参数                       | 说明       |
| ------ | -------------------------- | ---------- |
| `#row` | `{ item: T, index: number }` | 行内容     |

## 设计说明

- 默认悬停暂停，离开恢复；双向滚轮按列表高度回环。
- 内容追加、缩短或行高变化后重新测量，收回越界位移；不依赖下一次移动才修正。
- `prefers-reduced-motion: reduce` 停止 JS 自动位移，改为原始列表的原生滚动，内容仍可达。运行中切换系统设置同样生效。
- 键盘进入时暂停并回到原始列表，可通过原生滚动和第一份行内控件交互；焦点离开后恢复轮巡。重复区域使用 `aria-hidden` 和原生 `inert`，不产生第二套 Tab 目标；原始 slot 的按钮和链接保持可操作。
- 宿主给容器明确高度、稳定 rowKey 和可理解的 `aria-label`。这不是虚拟列表；全部原始行均会渲染。重复区域只用于视觉连续性。

[NvScreenScrollArea](./screen-scroll-area) 用于手动翻阅与溢出箭头；本组件用于自动轮巡。独立中性宿主 `/#screen/data` 并列展示两者。
