---
title: NvCombobox / NvSearchSelect 联想与搜索选择
---

<script setup>
import { NvCombobox, NvSearchSelect, NvField, NvFieldLabel } from '@nerv-ui/ui'
import { ref } from 'vue'

const device = ref('')
const deviceSuggestions = [
  { value: 'RES-A-01', label: '资源 A-01', hint: 'RES-A-01' },
  { value: 'RES-A-02', label: '资源 A-02', hint: 'RES-A-02' },
  { value: 'RES-B-01', label: '资源 B-01', hint: 'RES-B-01' },
]

const technician = ref('')
const technicianOptions = [
  { value: 'u1', label: '张三', hint: 'E001' },
  { value: 'u2', label: '李四', hint: 'E002' },
  { value: 'u3', label: '王五', hint: 'E003' },
]
</script>

# NvCombobox / NvSearchSelect 联想与搜索选择

两个用于**减少手动输入**的输入控件，都基于 Popover（浮层挂载在外层，避免被 Sheet 或对话框的 `overflow` 裁剪），自带过滤与键盘导航（↑ ↓ 移动、↵ 选择、Esc 关闭）。

## 何时使用

| 控件                          | 语义                              | 是否允许自由录入 | 典型场景                                     |
| ----------------------------- | --------------------------------- | ---------------- | -------------------------------------------- |
| **NvCombobox** 输入联想框     | 文本输入即过滤建议，值 = 输入文本 | ✅ 允许          | 资源编号、标签（有历史候选、也可能新填）   |
| **NvSearchSelect** 弹出选择框 | 按钮触发可搜索的弹出单选          | ❌ 仅选不填      | 成员目录、状态原因、处理结果（固定集合）   |

- 值可能不在集合内（会新登记资源、标签因分组而异）→ **NvCombobox**。
- 值必须来自固定集合（人员目录、编码字典）→ **NvSearchSelect**。
- 集合极小（≤5 且稳定）且无需搜索 → 用 [`NvSelect`](/components/desktop/select)。

## 示例

`NvCombobox` 输入即过滤 `suggestions`；命中建议可一键填入，也可继续输入未在建议中的自定义值。仅在存在匹配建议时展开弹层，避免自由录入时反复弹出空态。本例将资源编号同时放入 `hint`，因此编号与名称都可用于检索。

<Demo>
  <div style="max-width: 320px">
    <NvField>
      <NvFieldLabel for="cb-device">资源编号</NvFieldLabel>
      <NvCombobox
        id="cb-device"
        v-model="device"
        :suggestions="deviceSuggestions"
        placeholder="搜索资源或直接输入，如 RES-A-01"
      />
    </NvField>
    <p style="margin-top: 8px; font-size: 13px; color: var(--vp-c-text-2)">当前值：{{ device || '（空）' }}</p>
  </div>
</Demo>

```vue
<NvCombobox
  v-model="device"
  :suggestions="[{ value: 'RES-A-01', label: '资源 A-01', hint: 'RES-A-01' }]"
  placeholder="搜索资源或直接输入"
/>
```

`NvSearchSelect` 从固定集合里选一个；触发按钮展示所选标签，弹层顶部带搜索框，比长下拉更好定位。`options` 支持 `hint`（如成员编号）辅助识别。字段校验失败时可传 `aria-invalid` 与 `aria-describedby`；组件会将它们转发到实际获得焦点的触发按钮。

<Demo>
  <div style="max-width: 320px">
    <NvField>
      <NvFieldLabel for="ss-tech">指派成员</NvFieldLabel>
      <NvSearchSelect
        id="ss-tech"
        v-model="technician"
        :options="technicianOptions"
        placeholder="未指派"
        search-placeholder="搜索成员姓名 / 编号…"
      />
    </NvField>
    <p style="margin-top: 8px; font-size: 13px; color: var(--vp-c-text-2)">当前值：{{ technician || '（未选）' }}</p>
  </div>
</Demo>

```vue
<NvSearchSelect
  v-model="technician"
  :options="[{ value: 'u1', label: '张三', hint: 'E001' }]"
  placeholder="未指派"
  search-placeholder="搜索成员姓名 / 编号…"
/>
```

## API

### NvCombobox 属性

| 属性            | 说明                                           | 类型                      | 默认         |
| --------------- | ---------------------------------------------- | ------------------------- | ------------ |
| `modelValue`    | 受控值（`v-model`）；自由录入时 = 输入文本     | `string`                  | —            |
| `suggestions`   | 建议候选（必填）                               | `ComboboxSuggestion[]`    | —            |
| `placeholder`   | 输入占位                                       | `string`                  | `''`         |
| `emptyText`     | 无匹配建议时的弹层空态                         | `string`                  | `无匹配建议` |
| `disabled`      | 是否禁用                                       | `boolean`                 | `false`      |
| `id`            | 透传到 `<input>`                               | `string`                  | —            |
| `class`         | 追加到 `<input>` 的 Tailwind 类                | `HTMLAttributes['class']` | —            |

`ComboboxSuggestion`：`{ value: string; label?: string; hint?: string }`。

### NvCombobox 事件

| 事件                | 说明                       | 载荷     |
| ------------------- | -------------------------- | -------- |
| `update:modelValue` | 输入或选建议时回写当前文本 | `string` |

### NvSearchSelect 属性

| 属性                | 说明                                                  | 类型                      | 默认       |
| ------------------- | ----------------------------------------------------- | ------------------------- | ---------- |
| `modelValue`        | 受控值（`v-model`）；从 `options` 中选一个            | `string`                  | —          |
| `options`           | 候选集合（必填）                                      | `SearchSelectOption[]`    | —          |
| `placeholder`       | 未选时触发按钮的占位文案                              | `string`                  | `请选择`   |
| `searchPlaceholder` | 弹层内搜索框占位                                      | `string`                  | `搜索…`   |
| `emptyText`         | 过滤后无匹配的空态                                    | `string`                  | `无匹配项` |
| `disabled`          | 是否禁用                                              | `boolean`                 | `false`    |
| `loading`           | 加载中（触发按钮显示「加载中…」）                     | `boolean`                 | `false`    |
| `id`                | 透传到触发 `<button>`                                 | `string`                  | —          |
| `ariaLabel`         | 触发按钮的可访问名称                                  | `string`                  | —          |
| `ariaInvalid`       | 校验失败态（`aria-invalid`）                          | `boolean`                 | —          |
| `ariaDescribedby`   | 字段错误提示的 id，转发到触发按钮                     | `string`                  | —          |
| `searchAriaLabel`   | 弹层内搜索框的可访问名称（缺省从 `ariaLabel` 派生）   | `string`                  | —          |
| `class`             | 追加到触发按钮的 Tailwind 类                          | `HTMLAttributes['class']` | —          |

`SearchSelectOption`：`{ value: string; label: string; hint?: string }`。

### NvSearchSelect 事件

| 事件                | 说明             | 载荷     |
| ------------------- | ---------------- | -------- |
| `update:modelValue` | 选中某项时回写   | `string` |
