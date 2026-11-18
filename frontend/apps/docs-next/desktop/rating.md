---
title: NvRating 评分
---

<script setup>
import { ref } from 'vue'
import { NvRating } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const score = ref(3)
const halfScore = ref(2.5)
const empty = ref(null)
</script>

# NvRating 评分

星级评分控件，支持半星步进、再次点击清除与只读展示。

## 示例

<Demo>
  <NvRating v-model:value="score" aria-label="综合评分" />
  <span style="font-size: 13px; color: var(--vp-c-text-2)">{{ score ?? '未评分' }}</span>
</Demo>

<Demo>
  <NvRating v-model:value="halfScore" :step="0.5" aria-label="半星评分" />
  当前 {{ halfScore ?? '未评分' }} 星
</Demo>

<Demo>
  <NvRating v-model:value="empty" deselectable aria-label="可取消评分" />
  点击同一星取消：{{ empty ?? '已清除' }}
</Demo>

<Demo>
  <NvRating :max="10" :default-value="7" aria-label="十分制" />
  <NvRating :default-value="4" read-only aria-label="只读评分" />
  <NvRating :default-value="2" disabled aria-label="禁用评分" />
</Demo>

<Demo>
  <NvRating
    v-model:value="score"
    :max="5"
    :get-value-label="(v, max) => `评分 ${v} / ${max} 星`"
    aria-label="自定义标签评分"
  />
</Demo>

## API

### NvRating 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 受控评分（`v-model:value`）；`null` 表示未评分 | `number \| null` | — |
| `defaultValue` | 非受控初始评分 | `number \| null` | — |
| `max` | 星数 | `number` | `5` |
| `step` | 最小变化，按星的比例；`0.5` 为半星 | `number` | `1` |
| `deselectable` | 再次点击已选星可清除评分 | `boolean` | — |
| `disabled` | 禁用 | `boolean` | — |
| `readOnly` | 只读展示 | `boolean` | — |
| `required` | 必填 | `boolean` | — |
| `name` | 提交时的字段名 | `string` | — |
| `form` | 关联表单 id | `string` | — |
| `loop` | 方向键从末星绕回首星 | `boolean` | `false` |
| `ariaLabel` | 评分组的无障碍名称 | `string` | — |
| `getValueLabel` | 为每颗星生成无障碍名称，默认 `"<n> 星"` | `(value, max) => string` | — |

### NvRating 事件

| 事件 | 说明 |
| --- | --- |
| `update:value` | 评分变化，参数为 `number \| null` |

### NvRating 插槽

无插槽；星形图标由组件内置。
