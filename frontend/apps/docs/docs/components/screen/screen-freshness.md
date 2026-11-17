---
title: NvScreenFreshness 数据新鲜度
---

<script setup>
import { NvScreenFreshness } from '@nerv-iip/ui'
</script>

# NvScreenFreshness 数据新鲜度

用于大屏稳定页脚，显示某一个数据源的实时、滞留或等待状态。组件只负责状态视觉；调用方必须按各自数据源传入完整文案和最后更新时间，不要把不同轮询源合并成一个状态。

## 示例

<ScreenDemo>
  <div style="display:flex; gap:28px; align-items:center; flex-wrap:wrap">
    <NvScreenFreshness tone="live" label="实时 · 最后更新 10:24:08" />
    <NvScreenFreshness tone="stale" label="数据滞留 · 最后更新 10:18:01" />
    <NvScreenFreshness tone="wait" label="等待首次数据" />
  </div>
</ScreenDemo>

```vue
<NvScreenFreshness tone="live" label="实时 · 最后更新 10:24:08" />
<NvScreenFreshness tone="stale" label="数据滞留 · 最后更新 10:18:01" />
```

## API

### NvScreenFreshness 属性

| 属性    | 说明                             | 类型                    | 默认   |
| ------- | -------------------------------- | ----------------------- | ------ |
| `tone`  | 当前数据源的新鲜度状态           | `live \| stale \| wait` | `wait` |
| `label` | 包含状态和最后更新时间的完整文案 | `string`                | 必填   |

## 设计说明

状态始终由圆点和文字共同表达，不依赖颜色单独传达。实时圆点的呼吸动效在 `prefers-reduced-motion` 下停止。

每个来源分别提供自己的 `tone` 和完整 `label`，不要用任一来源的最近成功时间冒充其它来源的新鲜度。组件不会启动计时、推断过期阈值或请求数据。

使用 [useScreenData](./use-screen-data) 时，首次失败且无数据可显示 `wait` 与“尚无数据 · 本次未取到”；有数据的失败可显示 `stale` 与该来源保留的成功时间；恢复成功再显示 `live`。`initialData` 不代表成功，不应伪造更新时间。继续展示或撤下失败前的内容由宿主决定。

独立宿主 `/#screen/data` 展示各来源独立状态、失败保留与恢复。来源切换使用带 key 的宿主容器和固定 fetcher，不给本展示组件增加请求框架。
