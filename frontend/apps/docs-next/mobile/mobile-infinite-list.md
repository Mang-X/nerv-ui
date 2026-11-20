---
title: NvMobileInfiniteList 触底加载
---

<script setup>
import { ref } from 'vue'
import { NvMobileInfiniteList } from '@nerv-ui-next/mobile'
import '@nerv-ui-next/mobile/styles.css'

const items = ref(Array.from({ length: 12 }, (_, i) => `第 ${i + 1} 条`))
const loading = ref(false)
const finished = ref(false)

function load() {
  setTimeout(() => {
    const next = items.value.length
    items.value.push(...[1, 2, 3, 4].map((n) => `第 ${next + n} 条`))
    loading.value = false
    if (items.value.length >= 40) finished.value = true
  }, 600)
}
</script>

# NvMobileInfiniteList 触底加载

滚到距底部 `offset` 像素内时发一次 `load`。加载中显示提示行，`finished` 后显示到底文案。

判定用 `IntersectionObserver` 盯底部哨兵，而不是每次 scroll 都算一遍布局——长列表上后者会卡。

## 示例

<Demo block>
  <div style="height: 280px; border: 1px solid var(--vp-c-divider); border-radius: 8px">
    <NvMobileInfiniteList
      v-model:loading="loading"
      :finished="finished"
      @load="load"
    >
      <div v-for="item in items" :key="item" style="padding: 12px; border-bottom: 1px solid var(--vp-c-divider)">
        {{ item }}
      </div>
    </NvMobileInfiniteList>
  </div>
</Demo>

## API

| 属性 / 事件 | 说明 |
| --- | --- |
| `loading` | 受控加载态（`v-model:loading`）。组件只发请求，由调用方决定何时结束。 |
| `finished` | 数据已取完：不再触发加载，显示到底文案。 |
| `paused` | 暂停自动加载，但不显示成已到底。 |
| `offset` | 距底部多少像素触发，默认 `80`。 |
| `finishedText` / `loadingText` | 提示文案。 |
| 默认插槽 | 列表内容。 |
| `load` | 需要加载更多。 |
