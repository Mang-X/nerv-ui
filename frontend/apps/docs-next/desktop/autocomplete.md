---
title: NvAutocomplete 联想输入
---

<script setup>
import { ref } from 'vue'
import { NvAutocomplete } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const products = [
  '铝合金支架 NX-220',
  '不锈钢法兰 NX-310',
  '铜制接头 NX-415',
  '尼龙衬套 NX-530',
  '铸铁底座 NX-640',
  '橡胶密封圈 NX-720',
]

const text = ref('NX')
const custom = ref('')
</script>

# NvAutocomplete 联想输入

文本输入附带建议列表，建议只用于补全文本，键入的任意字符始终有效。

## 示例

<Demo>
  <NvAutocomplete v-model:value="text" :items="products" clearable style="width: 280px" />
  当前输入：{{ text || '—' }}
</Demo>

<Demo>
  <NvAutocomplete
    v-model:value="custom"
    :items="products"
    inline-complete
    open-on-focus
    placeholder="行内补全 + 聚焦即展开"
    style="width: 300px"
  />
  当前输入：{{ custom || '—' }}
</Demo>

<Demo>
  <NvAutocomplete v-model:value="text" :items="products" filter="startsWith" placeholder="前缀匹配" style="width: 260px" />
  <NvAutocomplete v-model:value="custom" :items="products" filter="fuzzy" placeholder="模糊匹配" style="width: 260px" />
</Demo>

<Demo>
  <NvAutocomplete :items="products" :filter="false" :open-on-focus="true" open placeholder="禁用过滤" style="width: 260px" />
  <NvAutocomplete :items="products" placeholder="禁用" disabled style="width: 240px" />
  <NvAutocomplete :items="['无可选项']" placeholder="无匹配建议" empty-text="没有匹配的选项" style="width: 240px" />
</Demo>

## API

### NvAutocomplete 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 受控文本（`v-model:value`）；建议只帮助补全 | `string` | — |
| `defaultValue` | 非受控初始文本 | `string` | — |
| `open` | 受控展开状态（`v-model:open`） | `boolean` | — |
| `defaultOpen` | 非受控初始展开状态 | `boolean` | — |
| `items` | 建议字符串列表 | `string[]` | — |
| `filter` | 输入如何缩小建议 | `contains \| startsWith \| fuzzy \| false` | — |
| `inlineComplete` | 用首个匹配建议补全文本，剩余部分保持选中 | `boolean` | — |
| `autoHighlight` | 自动高亮首个建议 | `boolean` | — |
| `openOnFocus` | 聚焦时展开建议 | `boolean` | — |
| `submitOnSelect` | 无高亮建议时按 Enter 触发提交 | `boolean` | — |
| `placeholder` | 占位文本 | `string` | `输入以联想…` |
| `ariaLabel` | 字段的无障碍名称 | `string` | `联想输入` |
| `disabled` | 禁用 | `boolean` | `false` |
| `readOnly` | 只读 | `boolean` | `false` |
| `required` | 必填 | `boolean` | `false` |
| `name` | 提交时的字段名 | `string` | — |
| `form` | 关联表单 id | `string` | — |
| `clearable` | 有文本时显示清除按钮 | `boolean` | `false` |
| `clearLabel` | 清除按钮的无障碍名称 | `string` | `清除` |
| `emptyText` | 无匹配建议时的文案 | `string` | `无匹配建议` |

### NvAutocomplete 事件

| 事件 | 说明 |
| --- | --- |
| `update:value` | 文本变化，参数为 `string` |
| `update:open` | 展开状态变化，参数为 `boolean` |

### NvAutocomplete 插槽

无插槽；搜索框、清除按钮与建议列表由组件内置。
