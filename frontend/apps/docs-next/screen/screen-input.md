---
title: NvScreenInput 大屏输入框
---

<script setup>
import { ref } from 'vue'
import { NvScreenInput } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'

const keyword = ref('')
</script>

# NvScreenInput 大屏输入框

大屏筛选区的输入框，默认无清除按钮，可显式开启。

## 示例

<Demo>
  <div class="nv-screen-stage" style="flex-direction: column">
    <NvScreenInput v-model="keyword" aria-label="搜索记录或文件项" placeholder="搜索记录或文件项" />
    <NvScreenInput v-model="keyword" size="lg" aria-label="大号输入框" placeholder="大号输入框" />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="flex-direction: column">
    <NvScreenInput v-model="keyword" aria-label="可清除输入" placeholder="可清除" clearable />
    <NvScreenInput aria-label="禁用输入" placeholder="禁用" disabled />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="flex-direction: column">
    <NvScreenInput v-model="keyword" aria-label="带前后缀输入" placeholder="带前后缀">
      <template #prefix>
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" stroke-width="2" />
          <path d="M16 16l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </template>
      <template #suffix>
        <span style="font-size: 13px">项</span>
      </template>
    </NvScreenInput>
  </div>
</Demo>

## API

### NvScreenInput 属性

| 属性          | 说明                   | 类型       | 默认    |
| ------------- | ---------------------- | ---------- | ------- |
| `modelValue`  | 绑定值                 | `string`   | `''`    |
| `placeholder` | 占位文本               | `string`   | —       |
| `size`        | 尺寸，高度为 56 / 64px | `md \| lg` | `md`    |
| `disabled`    | 禁用                   | `boolean`  | `false` |
| `readOnly`    | 只读                   | `boolean`  | `false` |
| `required`    | 必填                   | `boolean`  | `false` |
| `name`        | 原生字段名             | `string`   | —       |
| `type`        | 原生输入类型           | `string`   | `text`  |
| `clearable`   | 显示清除按钮           | `boolean`  | `false` |

### 事件

| 事件                | 说明                        |
| ------------------- | --------------------------- |
| `update:modelValue` | 输入值变化，参数为 `string` |

### 插槽

| 插槽     | 说明           |
| -------- | -------------- |
| `prefix` | 输入框左侧内容 |
| `suffix` | 输入框右侧内容 |
