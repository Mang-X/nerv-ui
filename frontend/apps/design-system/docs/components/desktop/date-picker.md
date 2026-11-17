---
title: NvDatePicker 日期选择器
---

<script setup>
import {
  NvDatePicker,
  NvDateRangePicker,
  NvSelect,
  NvSelectContent,
  NvSelectItem,
  NvSelectTrigger,
  NvSelectValue,
} from '@nerv-iip/ui'
import { ref } from 'vue'
import BaseDatesExample from '../../.vitepress/examples/BaseDatesExample.vue'

const planDate = ref('2026-06-18')
const emptyDate = ref()
const range = ref({ start: '2026-06-10', end: '2026-06-18' })
const locale = ref('zh-CN')
</script>

# NvDatePicker 日期选择器

通过日历浮层选择单个日期。`NvDatePicker` 以 `outline` 触发器配合品牌着色的日历单元。

## 示例

<Demo>
  <div style="max-width: 240px">
    <NvDatePicker v-model="planDate" placeholder="选择日期" />
  </div>
</Demo>

```vue
<NvDatePicker v-model="planDate" placeholder="选择日期" />
```

可选 `locale` 仅控制已选日期的展示：`2026-06-18` 在 `zh-CN` 下显示 `2026/6/18`，在 `en-US` 下显示 `6/18/2026`。响应式切换 locale 不改变模型；选择仍回传 `YYYY-MM-DD`，清除仍回传空串。日期按日历日期处理，不随宿主时区偏移。省略 `locale` 时保留原有 ISO 显示；日历标题、星期与操作文案沿用现有中文。

<Demo>
  <div style="display:flex;flex-direction:column;gap:12px;max-width:240px">
    <NvSelect v-model="locale">
      <NvSelectTrigger aria-label="日期显示语言">
        <NvSelectValue placeholder="日期显示语言" />
      </NvSelectTrigger>
      <NvSelectContent>
        <NvSelectItem value="zh-CN">简体中文</NvSelectItem>
        <NvSelectItem value="en-US">English (US)</NvSelectItem>
      </NvSelectContent>
    </NvSelect>
    <NvDatePicker v-model="planDate" :locale="locale" clearable />
  </div>
</Demo>

```vue
<NvDatePicker v-model="planDate" :locale="locale" clearable />
```

<Demo>
  <div style="display:flex;flex-direction:column;gap:12px;max-width:240px">
    <NvDatePicker v-model="emptyDate" placeholder="计划开工日期" />
    <NvDatePicker :model-value="'2026-06-18'" :disabled="true" />
  </div>
</Demo>

```vue
<NvDatePicker v-model="emptyDate" placeholder="计划开工日期" />
<NvDatePicker v-model="planDate" disabled />
```

宽度完全由调用方的 `class` 给：`NvDatePicker` 与 `NvDateRangePicker` 都不自带任何断点宽度，所以外层字段壳声明的宽度和触发器渲染出来的宽度必然一致，不会互相覆盖。窄屏占满、到断点收成固定宽度是本组件的通行写法（与筛选条里的搜索框、下拉框同一套）。

**壳与控件的断点值必须一致**：壳给 `sm:w-44`、控件只给 `sm:w-36` 时，控件是 144px——`2026-09-15` 加上清除叉放不下，会被 `truncate` 截掉一截还压在叉上。改宽度时两边一起改。

`clearable` 打开后，触发按钮上出现清除叉，日历浮层底部也多一个「清除」。清除回传**空字符串**（不是 `null`），所以「选一次再退回全部」不需要刷新页面。给选了日期的格子留宽度时按「`YYYY-MM-DD`（约 72px）＋ 日历图标 16px ＋ 清除叉 20px ＋ 两侧内边距 32px ＋ 叉那一档让位 56px」估，`sm:w-48`（192px）够。

<Demo>
  <div style="display:flex;gap:12px;flex-wrap:wrap">
    <div style="max-width: 200px">
      <NvDatePicker v-model="planDate" placeholder="选择日期" clearable class="w-full sm:w-48" />
    </div>
  </div>
</Demo>

```vue
<NvDatePicker v-model="planDate" placeholder="选择日期" clearable class="w-full sm:w-48" />
```

`NvDateRangePicker` 选择起止区间：首次点击定起点，再次点击定终点（自动排序），悬停可实时预览跨度。模型是 `{ start, end }` 字符串对象。

<Demo>
  <div style="max-width: 280px">
    <NvDateRangePicker v-model="range" placeholder="选择日期范围" />
  </div>
</Demo>

```vue
<script setup>
import { NvDateRangePicker } from '@nerv-iip/ui'
import { ref } from 'vue'

const range = ref({ start: '2026-06-10', end: '2026-06-18' })
</script>

<template>
  <NvDateRangePicker v-model="range" placeholder="选择日期范围" />
</template>
```

本组合通过公开主桶消费基础日期件，打开内部真实 Calendar / RangeCalendar；与上方 Nv 日期件分别展示。

<Demo>
  <BaseDatesExample />
</Demo>

<<< ../../.vitepress/examples/BaseDatesExample.vue

选择单日后回传 `string | null` 的 `update:modelValue` 与 `apply`，并关闭浮层；清除回传 null 与 `clear`。范围模型为 `DateRangeValue`（`from` / `to`），部分选择更新当前值，双端齐全才 `apply` 并关闭；清除整个范围回传 null 与 `clear`。null 表示未选择，不表示未知状态。

页面完整显示当前日期与双端、待选终点及采用/清除反馈。「外部替换」及「恢复初始安排」只替换本页模型，不冒充选择事件；禁用时两个日期入口均不可打开，启用后可继续操作。所有状态在本页内存中，刷新重置，无保存或后端能力。

范围日历内部为两个月，窄屏按现有 producer 纵向排列；内容较长时请滚动到末端「清除」。本例不覆盖内部布局。

## API

### NvDatePicker

| 属性               | 说明                                  | 类型                      | 默认       |
| ------------------ | ------------------------------------- | ------------------------- | ---------- |
| `v-model`          | 绑定日期（`YYYY-MM-DD` 字符串）       | `string \| null`          | `null`     |
| `id`               | 触发按钮 ID，用于关联字段标签         | `string`                  | —          |
| `locale`           | 已选日期的显示 locale，省略时显示 ISO | `string`                  | —          |
| `placeholder`      | 未选中占位文本                        | `string`                  | `选择日期` |
| `disabled`         | 是否禁用                              | `boolean`                 | `false`    |
| `clearable`        | 是否允许清除已选日期（回传空串）      | `boolean`                 | `false`    |
| `aria-invalid`     | 字段是否处于校验失败状态              | `boolean`                 | `false`    |
| `aria-describedby` | 关联字段错误说明元素的 ID             | `string`                  | —          |
| `class`            | 触发按钮宽度                          | `HTMLAttributes['class']` | —          |

### NvDateRangePicker

| 属性          | 说明           | 类型                                                     | 默认           |
| ------------- | -------------- | -------------------------------------------------------- | -------------- |
| `v-model`     | 绑定区间       | `{ start: string \| null, end: string \| null } \| null` | `null`         |
| `placeholder` | 未选中占位文本 | `string`                                                 | `选择日期范围` |
| `disabled`    | 是否禁用       | `boolean`                                                | `false`        |
| `class`       | 触发按钮宽度   | `HTMLAttributes['class']`                                | —              |
