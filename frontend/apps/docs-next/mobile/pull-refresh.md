---
title: NvPullRefresh 下拉刷新
---

<script setup>
import { ref } from 'vue'
import { NvMobileButton, NvPullRefresh } from '@nerv-ui-next/mobile'
import '@nerv-ui-next/mobile/styles.css'

const refreshing = ref(false)
const lastRefresh = ref('尚未刷新')

function onRefresh() {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
    lastRefresh.value = new Date().toLocaleTimeString()
  }, 1200)
}
</script>

# NvPullRefresh 下拉刷新

包裹可滚动内容的下拉刷新容器，达到阈值后触发 `refresh`，由调用方结束加载。

## 示例

<Demo block>
  <NvPullRefresh :refreshing="refreshing" @refresh="onRefresh">
    <div style="padding: 8px 0; font-size: 13px">
      <p style="margin: 0 0 8px">在触屏资源上向下拖动即可触发刷新。</p>
      <p style="margin: 0">最近刷新：<span v-text="lastRefresh"></span></p>
    </div>
  </NvPullRefresh>
  <div style="margin-top: 12px">
    <NvMobileButton variant="secondary" :loading="refreshing" @click="onRefresh">模拟一次刷新</NvMobileButton>
  </div>
</Demo>

## API

### NvPullRefresh 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `refreshing` | 是否正在刷新（`v-model:refreshing`）；不传则为非受控 | `boolean` | — |
| `threshold` | 触发刷新所需的拖动距离（px） | `number` | `56` |
| `maxPull` | 内容跟随手指的最大位移（px） | `number` | `96` |
| `pullText` | 未达阈值时的提示文案 | `string` | `下拉刷新` |
| `releaseText` | 达到阈值后的提示文案 | `string` | `松开刷新` |
| `refreshingText` | 刷新中的提示文案 | `string` | `正在刷新` |
| `disabled` | 禁用下拉 | `boolean` | `false` |

### NvPullRefresh 事件

| 事件 | 说明 |
| --- | --- |
| `update:refreshing` | 刷新状态变化，参数为 `boolean` |
| `refresh` | 拖动越过阈值并松手时触发 |

### NvPullRefresh 暴露方法

| 方法 | 说明 |
| --- | --- |
| `finish()` | 结束非受控刷新状态；受控模式下由调用方自行结束 |

### NvPullRefresh 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 可滚动的内容 |
