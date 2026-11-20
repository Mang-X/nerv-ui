---
title: NvTree 层级树
---

<script setup>
import { ref } from 'vue'
import { NvTree } from '@nerv-ui-next/desktop'
import '@nerv-ui-next/desktop/styles.css'

const items = [
  {
    value: 'plant',
    label: '一号区域',
    children: [
      {
        value: 'workshop-a',
        label: '研发部',
        children: [
          { value: 'line-1', label: '前端组' },
          { value: 'line-2', label: '后端组' },
          { value: 'line-3', label: '测试组（停用）', disabled: true },
        ],
      },
      {
        value: 'workshop-b',
        label: '设计部',
        children: [
          { value: 'lab-1', label: '交互设计组' },
          { value: 'lab-2', label: '视觉设计组' },
        ],
      },
    ],
  },
  {
    value: 'plant-2',
    label: '二号区域',
    children: [
      { value: 'warehouse', label: '文档中心' },
      { value: 'shipping', label: '归档区' },
    ],
  },
]

const single = ref('line-1')
const expanded = ref(['plant', 'workshop-a'])
const multi = ref(['line-1', 'line-2'])
</script>

# NvTree 层级树

可展开收起的多级结构，方向键在行间移动，支持单选、多选与节点级禁用。

## 示例

<Demo block>
  <div style="max-width: 420px; width: 100%">
    <NvTree
      v-model:value="single"
      v-model:expanded="expanded"
      :items="items"
      mode="single"
      aria-label="组织架构"
    />
    <p style="margin: 12px 0 0; font-size: 13px; color: var(--vp-c-text-2)">
      当前选中：{{ single ?? '无' }}；已展开：{{ expanded.join('、') || '无' }}
    </p>
  </div>
</Demo>

<Demo block>
  <div style="max-width: 420px; width: 100%">
    <NvTree
      v-model:value="multi"
      :default-expanded="['plant', 'plant-2']"
      :items="items"
      mode="multiple"
      aria-label="多选结构"
    />
    <p style="margin: 12px 0 0; font-size: 13px; color: var(--vp-c-text-2)">
      已选 {{ multi.length }} 项：{{ multi.join('、') || '无' }}
    </p>
  </div>
</Demo>

<Demo block>
  <div style="max-width: 420px; width: 100%">
    <NvTree :items="items" mode="none" :default-expanded="['plant']" aria-label="仅展开结构" />
  </div>
</Demo>

## API

### NvTree 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `items` | 完整层级数据，含未展开的分支 | `NvTreeItem[]` | — |
| `mode` | 可选择项数量：不选、单选、多选 | `none \| single \| multiple` | `single` |
| `value` | 受控选中值（`v-model:value`） | `string \| string[] \| null` | — |
| `defaultValue` | 非受控初始选中值 | `string \| string[] \| null` | — |
| `expanded` | 受控展开分支（`v-model:expanded`） | `string[]` | — |
| `defaultExpanded` | 非受控初始展开分支 | `string[]` | — |
| `activation` | `automatic` 方向键移动即选中；`manual` 等待 Enter 或点击 | `automatic \| manual` | `manual` |
| `expandOnPress` | 点击分支行即展开或收起 | `boolean` | `true` |
| `current` | 代表当前页面的条目值 | `string \| null` | — |
| `disabled` | 禁用整棵树 | `boolean` | `false` |
| `focusableWhenDisabled` | 禁用时仍可获取焦点 | `boolean` | — |
| `keepMounted` | 收起的分支仍保留在 DOM | `boolean` | — |
| `hiddenUntilFound` | 使用原生 `hidden="until-found"` | `boolean` | — |
| `controller` | 外部控制器实例 | `TreeController` | — |

### NvTree 事件

| 事件 | 说明 |
| --- | --- |
| `update:value` | 选中值变化，参数随 `mode` 为 `string`、`string[]` 或 `null` |
| `update:expanded` | 展开分支变化，参数为 `string[]` |

### NvTree 插槽

| 插槽 | 说明 |
| --- | --- |
| `label` | 自定义行内容，参数为 `{ item: NvTreeItem }`，缺省渲染展开箭头与文案 |

### NvTreeItem

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `value` | 唯一标识，同时用于选中与展开 | `string` |
| `label` | 行文案 | `string` |
| `children` | 子条目 | `NvTreeItem[]` |
| `disabled` | 禁用该条目 | `boolean` |
