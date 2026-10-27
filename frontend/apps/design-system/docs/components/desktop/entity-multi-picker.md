---
title: NvEntityMultiPicker 可搜索多选
---

<script setup>
import { NvEntityMultiPicker } from '@nerv-iip/ui'
import { ref } from 'vue'

const selected = ref(['旧日庭院'])
const options = [
  { value: '0', label: '晨光书房' },
  { value: 'garden', label: '河岸花园' },
  { value: 'gallery', label: '街角画廊' },
]
</script>

# NvEntityMultiPicker

在 [`NvEntityPicker`](./entity-picker.md) 的搜索列表上增加受控数组选择。选中后出现可移除标签；已选项不再列在候选中。组件只负责交互，目录请求、搜索词、分页时序、权限和最终值均由宿主决定。

<Demo>
  <div style="max-width: 360px">
    <NvEntityMultiPicker
      v-model="selected"
      :options="options"
      title="选择去处"
      aria-label="想去的地方"
      :show-code="false"
    />
  </div>
</Demo>

## 公共合同

| 属性或事件                                                            | 类型                                | 作用                                                                                                          |
| --------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `modelValue` / `update:modelValue`                                    | `readonly string[]` / `string[]`    | 宿主拥有已选值；组件发出新数组，不修改传入数组，也不乐观提交。值按原字符串比较，`'0'`、逗号等字符不会被解析。 |
| `options`                                                             | `EntityPickerOption[]`              | 当前候选页；每项 `value: string`、`label: string`，可带 `code`、`hint`。同 key 新 label 会刷新已选标签。      |
| `title`、`ariaLabel`、`id`、`ariaDescribedby`                         | `string`                            | 选择器名称、字段标识和错误提示关联。                                                                          |
| `placeholder`、`searchPlaceholder`、`emptyText`、`selectionEmptyText` | `string`                            | 未选、搜索、候选空态和标签空态文案。                                                                          |
| `disabled`、`invalid`、`loading`、`showCode`                          | `boolean`                           | 输入和展示状态；`invalid` 转发至触发器的 `aria-invalid`。                                                     |
| `serverSearch`、`search` / `update:search`、`totalCount`、`load-more` | `boolean`、`string`、`number`、事件 | 沿用 `NvEntityPicker` 的服务端搜索和列表滚动分页合同。宿主负责查询、去抖、晚回隔离和追加当前结果。            |

当前页已选项从候选中去掉，传给底层列表的剩余总数也相应扣除，避免只命中已选项时误提示还有下一页。

标签只缓存**当前仍被选中**的已见名称。换词或换页时保留；新结果返回同 key 时更新；宿主移除该 key 后清退。未见过的历史值显示原值，表示名称未知，不推断其状态或资格。卸载组件会清空这份临时缓存；需要跨挂载保留名称时，宿主应提供已选项的当前 `options` 或另行保存名称。

旧逗号字符串应在宿主转为数组，再在提交边界转回；公共组件不按逗号拆值。独立演示页 `/#entity-multi-picker` 有本地清单与宿主管理搜索页的两个实例。

<!-- @include: ../../../../../DESIGN/components/entity-multi-picker.md -->
