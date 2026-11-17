---
layout: page
title: NvMobileDropdownMenu 下拉筛选
---

<script setup>
import { NvMobileDropdownMenu, NvMobileDropdownMenuItem, NvCell } from '@nerv-iip/ui-mobile'
import { ref } from 'vue'

const status = ref('')
const center = ref('')
const sort = ref('newest')

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待开始', value: 'pending' },
  { label: '进行中', value: 'running' },
  { label: '已完成', value: 'done' },
  { label: '已暂停', value: 'paused' },
]
const centerOptions = [
  { label: '全部分组', value: '' },
  { label: 'Alpha 组', value: 'alpha' },
  { label: 'Beta 组', value: 'beta' },
  { label: 'Gamma 组', value: 'gamma' },
  { label: 'Delta 组', value: 'delta' },
]
const sortOptions = [
  { label: '最新创建', value: 'newest' },
  { label: '交期最近', value: 'due' },
  { label: '优先级高', value: 'priority' },
]

const rows = [
  { code: 'REC-2406-0421', product: '季度回顾草稿', center: 'Alpha 02' },
  { code: 'REC-2406-0426', product: '设计评审纪要', center: 'Beta 01' },
  { code: 'REC-2406-0433', product: '发布检查清单', center: 'Gamma 03' },
]
</script>

<MobileDoc>

<template #phone>

  <section>
    <p class="nv-mdoc-label">筛选栏</p>
    <div class="overflow-hidden rounded-xl border border-border">
      <NvMobileDropdownMenu>
        <NvMobileDropdownMenuItem v-model="status" title="状态" :options="statusOptions" />
        <NvMobileDropdownMenuItem v-model="center" title="分组" :options="centerOptions" />
        <NvMobileDropdownMenuItem v-model="sort" title="排序" :options="sortOptions" />
      </NvMobileDropdownMenu>
      <NvCell
        v-for="r in rows"
        :key="r.code"
        :title="r.product"
        :note="r.code"
        :value="r.center"
      />
    </div>
  </section>
</template>

# NvMobileDropdownMenu 下拉筛选

横向筛选栏（Arco NvMobileDropdownMenu 形态）。多个触发标签带下拉箭头，点击其一在栏下方展开选项面板；选中后回填触发标签文案并触发事件。同一时刻只允许一个面板展开，点击遮罩或再次点击触发器关闭。面板向下滑入，遵循 `prefers-reduced-motion`。

## 示例

`NvMobileDropdownMenu` 作为容器协调「同时只开一个」，每个 `NvMobileDropdownMenuItem` 用 `v-model` 绑定当前选中值，`title` 为未选时的回退标签。

```vue
<script setup>
import { NvMobileDropdownMenu, NvMobileDropdownMenuItem } from '@nerv-iip/ui-mobile'
import { ref } from 'vue'

const status = ref('')
const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '进行中', value: 'running' },
  { label: '已完成', value: 'done' },
]
</script>

<template>
  <NvMobileDropdownMenu>
    <NvMobileDropdownMenuItem v-model="status" title="状态" :options="statusOptions" />
  </NvMobileDropdownMenu>
</template>
```

## API

### NvMobileDropdownMenuItem 属性

| 属性      | 说明               | 类型               | 默认 |
| --------- | ------------------ | ------------------ | ---- |
| `title`   | 未选中时的回退标签 | `string`           | —    |
| `options` | 选项列表           | `DropdownOption[]` | —    |
| `v-model` | 当前选中值         | `string \| number` | —    |

`DropdownOption`：`{ label: string; value: string \| number }`

### 事件

| 事件     | 说明           | 回调参数                    |
| -------- | -------------- | --------------------------- |
| `change` | 选中某项时触发 | `(value: string \| number)` |

</MobileDoc>
