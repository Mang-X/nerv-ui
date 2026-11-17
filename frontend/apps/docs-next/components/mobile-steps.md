---
title: NvMobileSteps 步骤条
---

<script setup>
import { ref } from 'vue'
import { NvMobileSteps } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'

const current = ref(1)

const items = [
  { title: '创建', description: '已提交工单' },
  { title: '审核', description: '进行中' },
  { title: '下料', description: '待开始' },
  { title: '完成' },
]

const verticalItems = [
  { title: '接单', description: '10:02 已完成' },
  { title: '领料', description: '10:18 已完成' },
  { title: '加工', description: '进行中', status: 'active' },
  { title: '质检', description: '异常：尺寸超差', status: 'error' },
  { title: '入库' },
]
</script>

# NvMobileSteps 步骤条

展示流程所处阶段，支持横向、纵向两种排布，可开启点击切换当前步骤。

## 示例

<Demo block>
  <NvMobileSteps v-model:current="current" :items="items" clickable />
</Demo>

<Demo block>
  <NvMobileSteps :items="verticalItems" direction="vertical" />
</Demo>

<Demo block>
  <NvMobileSteps :items="items" direction="vertical" :current="2" clickable />
</Demo>

## API

### NvMobileSteps 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `items` | 步骤项，必填 | `MobileStepItem[]` | — |
| `current` | 受控当前步骤下标（`v-model:current`） | `number` | — |
| `defaultCurrent` | 非受控初始下标 | `number` | `0` |
| `direction` | 排布方向 | `horizontal \| vertical` | `horizontal` |
| `clickable` | 允许点击标记切换当前步骤 | `boolean` | `false` |
| `ariaLabel` | 步骤组的无障碍名称 | `string` | `步骤` |

### MobileStepItem

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `title` | 步骤标题 | `string` |
| `description` | 步骤补充说明 | `string` |
| `status` | 显式状态；缺省时按 `current` 推导 | `'wait' \| 'process' \| 'active' \| 'done' \| 'error'` |

### NvMobileSteps 事件

| 事件 | 说明 |
| --- | --- |
| `update:current` | 当前步骤变化，参数为 `number` |
| `change` | 当前步骤变化，参数为 `number` |
