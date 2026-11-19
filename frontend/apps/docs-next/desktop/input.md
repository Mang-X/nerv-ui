---
title: NvInput 输入框
---

<script setup>
import { ref } from 'vue'
import { NvInput } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const clearableText = ref('可清除的内容')
</script>

# NvInput 输入框

单行文本输入框，支持前置/后置内容、清除按钮与校验失败态。

## 示例

<Demo>
  <NvInput aria-label="工位编码" placeholder="请输入" style="width: 240px" />
  <NvInput aria-label="工位编码 小号" size="sm" placeholder="小号" style="width: 160px" />
  <NvInput aria-label="工位编码 中号" size="md" placeholder="中号" style="width: 200px" />
  <NvInput aria-label="工位编码 大号" size="lg" placeholder="大号" style="width: 240px" />
</Demo>

<Demo>
  <NvInput v-model="clearableText" aria-label="可清除的备注" clearable placeholder="可一键清除" style="width: 240px" />
  <NvInput aria-label="禁用的输入框" placeholder="禁用" disabled style="width: 200px" />
  <NvInput aria-label="只读的输入框" placeholder="只读" read-only default-value="只读内容" style="width: 200px" />
  <NvInput aria-label="校验失败的输入框" placeholder="校验失败" invalid style="width: 200px" />
</Demo>

<Demo>
  <NvInput aria-label="搜索关键词" placeholder="搜索关键词" style="width: 260px">
    <template #prefix>
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="M16 16l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </template>
  </NvInput>
  <NvInput aria-label="金额" type="number" placeholder="0" style="width: 200px">
    <template #suffix>元</template>
  </NvInput>
  <NvInput v-model="clearableText" aria-label="自定义清除按钮的输入框" clearable clear-label="清空输入" placeholder="自定义清除按钮名称" style="width: 260px" />
</Demo>

当前输入：{{ clearableText || '—' }}

## API

### NvInput 属性

| 属性           | 说明                                         | 类型             | 默认    |
| -------------- | -------------------------------------------- | ---------------- | ------- |
| `modelValue`   | 绑定值（`v-model`）                          | `string`         | —       |
| `defaultValue` | 非受控初始值                                 | `string`         | —       |
| `type`         | 原生输入类型                                 | `string`         | `text`  |
| `placeholder`  | 占位文本                                     | `string`         | —       |
| `disabled`     | 禁用                                         | `boolean`        | `false` |
| `readOnly`     | 只读                                         | `boolean`        | `false` |
| `required`     | 必填                                         | `boolean`        | `false` |
| `invalid`      | 校验失败态，设置 `aria-invalid` 与危险色描边 | `boolean`        | `false` |
| `clearable`    | 有内容时显示内置清除按钮                     | `boolean`        | `false` |
| `clearLabel`   | 清除按钮的无障碍名称                         | `string`         | `清除`  |
| `size`         | 尺寸                                         | `sm \| md \| lg` | `md`    |

未列出的属性会透传给底层输入元素（如 `autocomplete`、`maxlength`）。

### 事件

| 事件                | 说明                        |
| ------------------- | --------------------------- |
| `update:modelValue` | 输入值变化，参数为 `string` |

### 插槽

| 插槽     | 说明                             |
| -------- | -------------------------------- |
| `prefix` | 输入框左侧内容，点击可聚焦输入框 |
| `suffix` | 输入框右侧内容，点击可聚焦输入框 |
