---
layout: page
title: NvMobileErrorRetry 错误重试
---

<script setup>
import { NvMobileErrorRetry, NvMobileButton } from '@nerv-ui/ui-mobile'
import { ref } from 'vue'

const pending = ref(false)
const recovered = ref(false)
function onRetry() {
  pending.value = true
  window.setTimeout(() => {
    pending.value = false
    recovered.value = true
  }, 1200)
}
function reset() {
  recovered.value = false
}
</script>

<MobileDoc>

<template #phone>

  <section>
    <p class="nv-mdoc-label">基础用法</p>
    <NvMobileErrorRetry
      v-if="!recovered"
      message="记录列表加载失败，请检查网络后重试"
      :pending="pending"
      test-id="doc-list-error"
      @retry="onRetry"
    />
    <div v-else class="rounded-lg border border-border bg-card px-4 py-3 text-sm">
      <p class="text-muted-foreground">已恢复：12 条待处理记录</p>
      <NvMobileButton variant="outline" size="sm" class="mt-2" @click="reset">重置示例</NvMobileButton>
    </div>
  </section>
</template>

# NvMobileErrorRetry 错误重试

列表或数据加载失败时的错误面板：已分类的错误文案加一个重试操作。组件只做展示，错误分类与请求由上层负责；读操作（GET）幂等，重试始终安全，所以面板恒提供重试。

## 示例

`message` 传已分类的错误文案，`pending` 在重试进行中禁用按钮，`retry` 事件交给宿主发起 refetch。`test-id` 保留页面自己的断言锚点。

```vue
<script setup>
import { NvMobileErrorRetry } from '@nerv-ui/ui-mobile'
import { ref } from 'vue'

const pending = ref(false)
function onRetry() {
  pending.value = true
  refetch().finally(() => (pending.value = false))
}
</script>

<template>
  <NvMobileErrorRetry message="记录列表加载失败" :pending="pending" @retry="onRetry" />
</template>
```

## API

### NvMobileErrorRetry 属性

| 属性       | 说明                                       | 类型      | 默认           |
| ---------- | ------------------------------------------ | --------- | -------------- |
| `message`  | 已分类的错误文案（上层请求/组合层给出）     | `string`  | —              |
| `pending`  | 重试进行中禁用按钮                          | `boolean` | `false`        |
| `test-id`  | 根 `data-testid` 锚点                       | `string`  | `'list-error'` |

### 事件

| 事件    | 说明             | 参数 |
| ------- | ---------------- | ---- |
| `retry` | 点击重试按钮触发 | 无   |

</MobileDoc>
