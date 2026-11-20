---
title: NvMobileInput 输入框
---

<script setup>
import { ref } from 'vue'
import { NvMobileInput } from '@nerv-ui-next/mobile'
import '@nerv-ui-next/mobile/styles.css'

const keyword = ref('')
const phone = ref('')
</script>

# NvMobileInput 输入框

移动端单行输入框，内置清除按钮，可按 `inputmode` 选择数字、电话等软键盘。

## 示例

<Demo>
  <NvMobileInput v-model="keyword" aria-label="工号或姓名" placeholder="请输入工号或姓名" clearable />
  <NvMobileInput v-model="phone" inputmode="tel" aria-label="手机号" placeholder="手机号" clearable />
</Demo>

<Demo>
  <NvMobileInput aria-label="不可编辑字段" placeholder="不可编辑" disabled />
  <NvMobileInput aria-label="校验失败示例" placeholder="校验失败示例" invalid default-value="格式不正确" />
  <NvMobileInput aria-label="只读字段" placeholder="只读" readonly default-value="只读内容" />
</Demo>

<Demo>
  <NvMobileInput v-model="keyword" aria-label="按姓名搜索" placeholder="带前后缀" clearable>
    <template #prefix>
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="M16 16l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </template>
    <template #suffix>
      <span style="font-size: 12px">单位</span>
    </template>
  </NvMobileInput>
</Demo>

## API

### NvMobileInput 属性

| 属性           | 说明                 | 类型                                                                  | 默认    |
| -------------- | -------------------- | --------------------------------------------------------------------- | ------- |
| `modelValue`   | 绑定值               | `string`                                                              | —       |
| `defaultValue` | 非受控初始值         | `string`                                                              | —       |
| `type`         | 原生输入类型         | `string`                                                              | `text`  |
| `placeholder`  | 占位文本             | `string`                                                              | —       |
| `name`         | 原生字段名           | `string`                                                              | —       |
| `autocomplete` | 原生自动填充提示     | `string`                                                              | —       |
| `inputmode`    | 软键盘类型           | `none \| text \| tel \| url \| email \| numeric \| decimal \| search` | —       |
| `disabled`     | 禁用                 | `boolean`                                                             | `false` |
| `readonly`     | 只读                 | `boolean`                                                             | `false` |
| `required`     | 必填                 | `boolean`                                                             | `false` |
| `invalid`      | 校验失败态           | `boolean`                                                             | `false` |
| `clearable`    | 显示清除按钮         | `boolean`                                                             | `true`  |
| `clearLabel`   | 清除按钮的无障碍标签 | `string`                                                              | `清除`  |

### 事件

| 事件                | 说明                        |
| ------------------- | --------------------------- |
| `update:modelValue` | 输入值变化，参数为 `string` |

### 插槽

| 插槽     | 说明           |
| -------- | -------------- |
| `prefix` | 输入框左侧内容 |
| `suffix` | 输入框右侧内容 |
