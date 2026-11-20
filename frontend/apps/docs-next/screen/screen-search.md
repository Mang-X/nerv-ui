---
title: NvScreenSearch 大屏搜索框
---

<script setup>
import { ref } from 'vue'
import { NvScreenSearch } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'

const query = ref('')
</script>

# NvScreenSearch 大屏搜索框

行为来自 `@ui-sdk/vue/input`：受控/非受控、清空按钮与原生 `type=search` 都由原语承担。搜索图标只作装饰。

## 示例

<Demo>
  <div class="nv-screen-stage" style="padding: 40px; width: 420px">
    <NvScreenSearch v-model:model-value="query" label="搜索工单" placeholder="工单号 / 产线 / 设备" />
  </div>
</Demo>

当前输入：{{ query || '—' }}

## API

| 属性 | 说明 |
| --- | --- |
| `label` | 输入框的无障碍名称。大屏上常没有可见标签，所以这里不是可选装饰。 |
| `placeholder` | 占位文字；未给 `label` 时会被当作名称兜底。 |
| `disabled` | 禁用。 |

> 未给 `label` 时用 placeholder 兜底只是为了避免匿名控件；placeholder 会随内容变化，
> 真正稳定的名字应显式提供。
