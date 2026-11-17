---
title: NvMobileErrorRetry 错误重试
---

<script setup>
import { ref } from 'vue'
import { NvMobileErrorRetry } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'

const loading = ref(false)
const retries = ref(0)
let timer

function retry() {
  retries.value += 1
  loading.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    loading.value = false
  }, 1200)
}
</script>

# NvMobileErrorRetry 错误重试

加载失败时的错误占位，提供带加载态的重试按钮，可在请求进行中禁用重复点击。

## 示例

<Demo block>
  <NvMobileErrorRetry
    description="生产数据加载超时，请检查网络后重试。"
    :loading="loading"
    @retry="retry"
  />
  <span style="font-size: 13px">已重试 <span v-text="retries"></span> 次</span>
</Demo>

<Demo block>
  <NvMobileErrorRetry
    size="sm"
    title="明细加载失败"
    retry-text="重新加载"
    description="可以稍后再试，或返回列表。"
    @retry="retry"
  />
</Demo>

## API

### NvMobileErrorRetry 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `title` | 标题 | `string` | `加载失败` |
| `description` | 补充说明 | `string` | — |
| `retryText` | 重试按钮文案 | `string` | `重试` |
| `loading` | 重试进行中，禁用按钮并显示加载图标 | `boolean` | `false` |
| `size` | 尺寸 | `sm \| md` | `md` |

### NvMobileErrorRetry 事件

| 事件 | 说明 |
| --- | --- |
| `retry` | 点击重试按钮 |

### NvMobileErrorRetry 插槽

| 插槽 | 说明 |
| --- | --- |
| `icon` | 替换默认警告图标 |
| `title` | 自定义标题 |
| `description` | 自定义说明 |
| `default` | 替换整个重试按钮 |
