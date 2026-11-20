---
title: NvCombobox 组合框
---

<script setup>
import { ref } from 'vue'
import { NvCombobox } from '@nerv-ui-next/desktop'
import '@nerv-ui-next/desktop/styles.css'

const products = [
  { value: 'p1', label: '示例选项 NX-220' },
  { value: 'p2', label: '示例选项 NX-310' },
  { value: 'p3', label: '示例选项 NX-415' },
  { value: 'p4', label: '示例选项 NX-530' },
  { value: 'p5', label: '示例选项 NX-640' },
  { value: 'p6', label: '示例选项 NX-720', keywords: ['示例', '选项'] },
  { value: 'p7', label: '示例选项 NX-810', disabled: true },
]

const single = ref('p2')
const multiple = ref(['p1', 'p3'])
const custom = ref(null)

const loader = async (query) => {
  await new Promise((r) => setTimeout(r, 250))
  return products.filter((p) => p.label.includes(query) || query === '')
}
</script>

# NvCombobox 组合框

可搜索的选择器，单值或多值，选项可静态传入或异步加载。

## 示例

<Demo>
  <NvCombobox
    v-model:value="single"
    :items="products"
    placeholder="搜索选项…"
    clearable
    style="width: 260px"
  />
  <span style="font-size: 13px; color: var(--vp-c-text-2)">选中：{{ single ?? '—' }}</span>
</Demo>

<Demo>
  <NvCombobox
    v-model:value="multiple"
    :items="products"
    multiple
    :max-selected="3"
    placeholder="最多选 3 项"
    style="width: 300px"
  />
</Demo>

已选 {{ multiple.length }} 项：{{ multiple.join('、') || '—' }}

<Demo>
  <NvCombobox
    v-model:value="custom"
    :items="products"
    allow-custom-value
    placeholder="可输入自定义值"
    style="width: 260px"
  />
  当前值：{{ custom ?? '—' }}
</Demo>

<Demo>
  <NvCombobox
    :load-options="loader"
    placeholder="异步搜索选项…"
    loading-text="正在检索…"
    empty-text="没有匹配的选项"
    style="width: 280px"
  />
  <NvCombobox :items="products" :filter="false" placeholder="不过滤：始终显示全部" style="width: 280px" />
</Demo>

<Demo>
  <NvCombobox :items="products" placeholder="禁用" disabled style="width: 240px" />
  <NvCombobox :items="products" :show-trigger="false" placeholder="无下拉触发器" style="width: 240px" />
</Demo>

## API

### NvCombobox 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 受控值（`v-model:value`）；`multiple` 时为数组 | `string \| string[] \| null` | — |
| `defaultValue` | 非受控初始值 | `string \| string[] \| null` | — |
| `multiple` | 多选，绑定值变为数组 | `boolean` | `false` |
| `maxSelected` | 多选时最多可选数量 | `number` | — |
| `items` | 选项数据；标签在列表打开前即可解析 | `{ value, label, keywords?, disabled? }[]` | — |
| `loadOptions` | 随查询加载选项；设置后忽略 `items`，由加载器负责过滤 | `(query, context) => Promise<Item[] \| { items, hasMore }>` | — |
| `debounce` | 输入停顿多久后调用 `loadOptions`（ms） | `number` | `200` |
| `loadOnMount` | 挂载时先按初始查询加载一次 | `boolean` | `true` |
| `open` | 受控展开状态（`v-model:open`） | `boolean` | — |
| `defaultOpen` | 非受控初始展开状态 | `boolean` | — |
| `query` | 受控查询文本（`v-model:query`） | `string` | — |
| `defaultQuery` | 非受控初始查询文本 | `string` | — |
| `filter` | 输入如何缩小列表；`false` 保留全部选项 | `ListFilter<string> \| false` | — |
| `autoHighlight` | 自动高亮首个/唯一匹配项 | `'always' \| boolean` | — |
| `allowCustomValue` | 允许将无匹配的文本作为值 | `boolean` | — |
| `loop` | 键盘导航首尾循环 | `boolean` | — |
| `placeholder` | 搜索框占位文本 | `string` | `搜索…` |
| `ariaLabel` | 搜索字段的无障碍名称 | `string` | `搜索选项` |
| `disabled` | 禁用 | `boolean` | `false` |
| `readOnly` | 只读 | `boolean` | `false` |
| `required` | 必填 | `boolean` | `false` |
| `name` | 提交时的字段名 | `string` | — |
| `form` | 关联表单 id | `string` | — |
| `clearable` | 有值时显示清除按钮 | `boolean` | `false` |
| `clearLabel` | 清除按钮的无障碍名称 | `string` | `清除` |
| `triggerLabel` | 展开按钮的无障碍名称 | `string` | `展开选项` |
| `emptyText` | 无匹配时的提示文案 | `string` | `无匹配选项` |
| `loadingText` | 异步加载中的提示文案 | `string` | `搜索中…` |
| `showTrigger` | 显示内置下拉箭头触发器 | `boolean` | `true` |

### NvCombobox 事件

| 事件 | 说明 |
| --- | --- |
| `update:value` | 选中值变化，参数为 `string \| string[] \| null` |
| `update:open` | 展开状态变化，参数为 `boolean` |
| `update:query` | 查询文本变化，参数为 `string` |

### NvCombobox 插槽

无插槽；搜索框、清除按钮与选项列表由组件内置。
