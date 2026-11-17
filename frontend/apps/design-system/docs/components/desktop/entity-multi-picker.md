---
title: NvEntityMultiPicker 可搜索多选
---

<script setup>
import { NvEntityMultiPicker } from '@nerv-iip/ui'
import { ref } from 'vue'
import EntitySearchExample from '../../.vitepress/examples/EntitySearchExample.vue'

const selected = ref(['旧日庭院'])
const options = [
  { value: '0', label: '晨光书房' },
  { value: 'garden', label: '河岸花园' },
  { value: 'gallery', label: '街角画廊' },
]
</script>

# NvEntityMultiPicker

在 [`NvEntityPicker`](./entity-picker.md) 的搜索列表上增加受控数组选择。选中后出现可移除标签；已选项不再列在候选中。组件只负责交互，目录请求、搜索词、分页时序、权限和最终值均由宿主决定。

## 示例

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

搜索词和当前候选窗口由本例宿主持有：从完整 24 项内存目录过滤，先显示 8 项，再由列表滚动触发 `load-more` 追加下一批。换词会重置窗口，已选标签保持；可搜索 `SPACE-017` 验证初始窗口之外的候选。单选族页面复用同一示例源码。本例同步查询内存，不模拟网络延迟、去抖或迟到响应；这些时序仍由真实接入宿主负责。

<Demo block>
  <EntitySearchExample />
</Demo>

<<< @/.vitepress/examples/EntitySearchExample.vue

## API

| 属性或事件                                                            | 类型                                | 作用                                                                                                            |
| --------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `modelValue` / `update:modelValue`                                    | `readonly string[]` / `string[]`    | 宿主拥有已选值；组件发出新数组，不修改传入数组，也不乐观提交。值按原字符串比较，`'0'`、逗号等字符不会被解析。   |
| `options`                                                             | `EntityPickerOption[]`              | 当前候选页；每项 `value: string`、`label: string`，可带 `code`、`hint`。同 key 新选项会刷新已选标签与辅助信息。 |
| `title`、`ariaLabel`、`id`、`ariaDescribedby`                         | `string`                            | 选择器名称、字段标识和错误提示关联。                                                                            |
| `placeholder`、`searchPlaceholder`、`emptyText`、`selectionEmptyText` | `string`                            | 未选、搜索、候选空态和标签空态文案。                                                                            |
| `disabled`、`invalid`、`loading`、`showCode`                          | `boolean`                           | 输入和展示状态；`invalid` 转发至触发器的 `aria-invalid`。                                                       |
| `serverSearch`、`search` / `update:search`、`totalCount`、`load-more` | `boolean`、`string`、`number`、事件 | 沿用 `NvEntityPicker` 的服务端搜索和列表滚动分页合同。宿主负责查询、去抖、晚回隔离和追加当前结果。              |

当前页已选项从候选中去掉，传给底层列表的剩余总数也相应扣除，避免只命中已选项时误提示还有下一页。

## 设计说明

标签只缓存**当前仍被选中**的已见选项信息。选入时宿主同步接受新数组并切页，组件仍保留选中时的名称；宿主拒绝提案时不保留。换词或换页时保留，新结果返回同 key 时更新，宿主移除该 key 后清退。未见过的历史值显示原值，表示名称未知，不推断其状态或资格。卸载组件会清空这份临时缓存；需要跨挂载保留名称时，宿主应提供已选项的当前 `options` 或另行保存名称。

已选标签与移除按钮共用可辨名称：优先使用可区分的 `code`，其次使用可区分的 `hint`；按最终身份文字检查同名项；即使文字分别来自 `code` 和 `hint`，只要碰撞就回退完整 `value`。回退后若与另一项的辅助文字再次碰撞，该项也回退完整值，直到可分别识别，以免两个移除动作同名。`showCode` 控制候选列表编码行，不隐藏已选项辨识信息。技术值按等宽小字显示且不会省略；宿主应优先提供人读编码或辅助信息。禁用时选择、移除与清空都不可操作，也没有悬停或聚焦的操作反馈。

旧逗号字符串应在宿主转为数组，再在提交边界转回；公共组件不按逗号拆值。独立演示页 `/#entity-multi-picker` 有本地清单与宿主管理搜索页的两个实例。

<!-- @include: ../../../../../DESIGN/components/entity-multi-picker.md -->
