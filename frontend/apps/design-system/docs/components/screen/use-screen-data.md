---
title: useScreenData 大屏取数
---

<script setup>
import { useScreenData } from '@nerv-iip/ui'
let sequence = 0
const { data, error, loading, lastUpdated, isStale, refresh } = useScreenData(async () => {
  sequence += 1
  if (sequence % 4 === 0) throw new Error('暂未取到空间动态')
  return `城市书房 · 第 ${sequence} 次更新`
}, { intervalMs: 3000 })
</script>

# useScreenData 大屏取数

轮询、页面隐藏时跳过轮询、恢复可见时补取，以及失败保留上一次数据。数据访问由宿主注入的 `() => Promise<T>` 完成；不依赖业务 API、SDK 或缓存。

<ScreenDemo>
  <div style="display:grid;gap:8px">
    <span>{{ data ?? '等待首次数据' }}</span>
    <span>取数中：{{ loading }} · 数据滞留：{{ isStale }} · 本次失败：{{ !!error }}</span>
    <span>最近成功：{{ lastUpdated === undefined ? '—' : new Date(lastUpdated).toLocaleTimeString() }}</span>
    <button type="button" @click="refresh">刷新</button>
  </div>
</ScreenDemo>

首次失败且没有 `initialData` 时，`data` 和 `lastUpdated` 仍为 `undefined`，`isStale` 为 `false`。成功后失败保留数据和成功时间，标记 `error` 与 `isStale`；下次成功清除错误和滞留标记。`initialData` 不是一次成功，不会填写成功时间；即使为 `0`，失败后也会标记滞留。

宿主决定失败时继续显示还是撤下旧内容，例如 `data && (!error || retainPrevious)`；组件库保留数据不等于业务必须继续展示。可用 [NvScreenFreshness](./screen-freshness) 呈现各来源的状态与文字。

## 固定来源与切换身份

每个独立来源用自己的实例。切换来源时由宿主以 `key` 重建持有 helper 的组件，并在 setup 中捕获固定来源与 fetcher：

```vue
<!-- Host.vue：selectedSource 为宿主选择的来源对象 -->
<SourceView :key="selectedSource.id" :source="selectedSource" />
```

```vue
<!-- SourceView.vue -->
<script setup lang="ts">
import { useScreenData } from '@nerv-iip/ui'
const props = defineProps<{ source: { id: string; fetch: () => Promise<string> } }>()
const fixedSource = props.source
const { data, error, lastUpdated } = useScreenData(() => fixedSource.fetch())
</script>
<template>
  <p>{{ fixedSource.id }} · {{ data ?? '等待首次数据' }}</p>
</template>
```

旧实例的在途请求仍可能完成，但不会进入新实例的可见状态。不要只用 `watch(id, refresh)` 宣称隔离：在途时 `refresh()` 直接返回，会跳过新请求，原请求随后仍会写回同一实例。单实例 scope 重置、generation、AbortSignal 与取消请求均不属于当前 API。

## 生命周期

- 默认立即取一次，每 15 秒安排下一次轮询。`immediate: false` 仅跳过 start 时的立即请求，仍自动启动定时轮询。
- `refresh()` 为手动请求，在途时直接返回，不排队、不合并等待承诺，也不重复发起。
- `stop()` 只清定时器并移除 visibility 监听；不 abort、不冻结在途晚回。`start()` 可重启，重复调用不会增加定时器或监听。
- scope dispose 自动执行 stop，仍不取消在途请求。
- 隐藏期间定时 tick 不请求，恢复可见立即补取；在途保护同样适用。手动 refresh 及 start 的立即请求不受 hidden gate 限制。
- SSR 不自动启动轮询。

## API

`useScreenData<T>(fetcher: () => Promise<T>, options?: UseScreenDataOptions<T>): UseScreenDataReturn<T>`

| Option        | 类型      | 默认    | 说明                     |
| ------------- | --------- | ------- | ------------------------ |
| `intervalMs`  | `number`  | `15000` | 轮询间隔，毫秒           |
| `immediate`   | `boolean` | `true`  | start 时是否立即取一次   |
| `initialData` | `T`       | —       | 初始数据，不填写成功时间 |

| 返回             | 类型                       | 说明                                 |
| ---------------- | -------------------------- | ------------------------------------ |
| `data`           | `Ref<T \| undefined>`      | 最近成功数据或 initialData，失败保留 |
| `error`          | `Ref<unknown>`             | 最近错误，成功后清除                 |
| `loading`        | `Ref<boolean>`             | 是否有在途请求                       |
| `lastUpdated`    | `Ref<number \| undefined>` | 最近成功时间戳，毫秒                 |
| `isStale`        | `Ref<boolean>`             | 失败且有数据时为 true                |
| `refresh`        | `() => Promise<void>`      | 手动取一次，在途时跳过               |
| `start` / `stop` | `() => void`               | 幂等启停轮询与 visibility 监听       |

两类公开类型均从主桶 `@nerv-iip/ui` 导出。独立宿主 `/#screen/data` 提供手动失败、暂缓完成、独立请求计数、身份切换与滚动操作；完整文档站运行另属 #10。
