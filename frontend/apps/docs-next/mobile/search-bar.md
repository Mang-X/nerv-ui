---
title: NvSearchBar 搜索栏
---

<script setup>
import { ref } from 'vue'
import { NvSearchBar } from '@nerv-ui-next/mobile'
import '@nerv-ui-next/mobile/styles.css'

const keyword = ref('')
const submitted = ref('—')
</script>

# NvSearchBar 搜索栏

带搜索图标与清除按钮的移动端搜索输入，回车触发 `search`。

## 示例

<Demo>
  <div style="width: 100%">
    <NvSearchBar
      v-model="keyword"
      aria-label="搜索文件项或记录"
      placeholder="搜索文件项、记录"
      show-cancel
      @search="submitted = $event"
      @cancel="keyword = ''"
    />
  </div>
</Demo>

<Demo>
  <NvSearchBar aria-label="禁用搜索" placeholder="禁用状态" disabled />
  <NvSearchBar aria-label="只读搜索" placeholder="只读状态" readonly />
</Demo>

最近搜索：{{ submitted }}

## API

### NvSearchBar 属性

| 属性           | 说明                 | 类型      | 默认       |
| -------------- | -------------------- | --------- | ---------- |
| `modelValue`   | 绑定值               | `string`  | —          |
| `defaultValue` | 非受控初始值         | `string`  | `''`       |
| `placeholder`  | 占位文本             | `string`  | `搜索`     |
| `disabled`     | 禁用                 | `boolean` | `false`    |
| `readonly`     | 只读                 | `boolean` | `false`    |
| `showCancel`   | 显示取消按钮         | `boolean` | `false`    |
| `cancelText`   | 取消按钮文字         | `string`  | `取消`     |
| `clearLabel`   | 清除按钮的无障碍标签 | `string`  | `清除搜索` |

### 事件

| 事件                | 说明                        |
| ------------------- | --------------------------- |
| `update:modelValue` | 输入值变化，参数为 `string` |
| `search`            | 回车提交，参数为当前输入值  |
| `cancel`            | 点击取消按钮                |

### 插槽

| 插槽     | 说明               |
| -------- | ------------------ |
| `cancel` | 自定义取消按钮内容 |
