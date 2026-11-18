---
title: NvTouchInput 触屏输入框
---

<script setup>
import { ref } from 'vue'
import { NvTouchInput } from '@nerv-ui/pad'
import '@nerv-ui/pad/styles.css'

const keyword = ref('')
const code = ref('R-2026-0042')
const email = ref('team@example.com')
</script>

# NvTouchInput 触屏输入框

面向平板的大触控单行输入框，控件高度 64px，可带标签、提示、前后缀与清除按钮。

## 示例

<Demo block>
  <NvTouchInput
    v-model="keyword"
    label="搜索记录"
    placeholder="输入记录编号或关键字"
    clearable
    hint="输入内容后，右侧按钮可一键清除"
  />
</Demo>

<Demo block>
  <NvTouchInput v-model="code" label="记录编号" required>
    <template #prefix>#</template>
    <template #suffix>已同步</template>
  </NvTouchInput>
</Demo>

<Demo block>
  <NvTouchInput
    v-model="email"
    label="联系邮箱"
    type="email"
    input-mode="email"
    hint="格式不正确时会显示危险色边框与提示"
    invalid
  />
</Demo>

<Demo block>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <NvTouchInput label="资源名称" placeholder="暂不可编辑" disabled />
    <NvTouchInput label="只读字段" model-value="R-2026-0042" read-only hint="只读时仍可聚焦与复制" />
  </div>
</Demo>

## API

### NvTouchInput 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `modelValue` | 绑定值（`v-model`） | `string` | — |
| `defaultValue` | 非受控初始值 | `string` | `''` |
| `type` | 原生输入类型 | `string` | `text` |
| `placeholder` | 占位文案 | `string` | — |
| `label` | 输入框上方的标签 | `string` | — |
| `hint` | 输入框下方的提示；`invalid` 时使用危险色 | `string` | — |
| `name` | 原生字段名 | `string` | — |
| `autocomplete` | 原生自动完成提示 | `string` | — |
| `inputMode` | 软键盘形态 | `text \| search \| tel \| url \| email \| numeric \| decimal \| none` | — |
| `disabled` | 禁用 | `boolean` | `false` |
| `readOnly` | 只读 | `boolean` | `false` |
| `required` | 必填 | `boolean` | `false` |
| `invalid` | 标记校验失败：`aria-invalid` 加危险色边框 | `boolean` | `false` |
| `clearable` | 有内容时显示内建清除按钮 | `boolean` | `false` |
| `clearLabel` | 清除按钮的无障碍名称 | `string` | `清除` |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 输入值变化，参数为 `string` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `prefix` | 输入框前的短文本或图标，按下会聚焦输入框 |
| `suffix` | 输入框后的短文本或图标，按下会聚焦输入框 |
| `hint` | 自定义下方提示内容 |
