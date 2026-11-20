---
title: NvMobileDropdownMenu 筛选栏
---

<script setup>
import { ref } from 'vue'
import { NvMobileDropdownMenu, NvMobileDropdownMenuItem } from '@nerv-ui-next/mobile'
import '@nerv-ui-next/mobile/styles.css'

const line = ref('a')
const status = ref(undefined)
</script>

# NvMobileDropdownMenu 筛选栏

一行并排的筛选下拉，同时只有一项展开。展开态由整条栏持有，所以「点到另一个就收起上一个」是结构决定的，不靠每个条目互相通知。

每一项都是一个 `Select`——选择、键盘、外部点击关闭都由 `@ui-sdk/vue/select` 承担。

## 示例

<Demo block>
  <div style="width: 100%">
    <NvMobileDropdownMenu label="列表筛选">
      <NvMobileDropdownMenuItem
        v-model="line"
        title="全部产线"
        :options="[
          { label: '全部产线', value: 'a' },
          { label: 'A 线', value: 'line-a' },
          { label: 'B 线', value: 'line-b' },
        ]"
      />
      <NvMobileDropdownMenuItem
        v-model="status"
        title="全部状态"
        :options="[
          { label: '运行', value: 'running' },
          { label: '待机', value: 'idle' },
          { label: '故障', value: 'fault' },
        ]"
      />
    </NvMobileDropdownMenu>
  </div>
</Demo>

产线：{{ line }}，状态：{{ status ?? '全部' }}

## API

### NvMobileDropdownMenu

| 属性 | 说明 |
| --- | --- |
| `label` | 整条筛选栏的无障碍名称。 |

### NvMobileDropdownMenuItem

| 属性 / 事件 | 说明 |
| --- | --- |
| `title` | 未选中任何值时的按钮文字。 |
| `options` | `{ label, value }[]`。 |
| `modelValue` | 受控选中值（`v-model`）。 |
| `label` | 该项的无障碍名称；不给就用当前显示文字。 |
| `change` | 选中值变化。 |
