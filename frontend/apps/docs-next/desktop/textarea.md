---
title: NvTextarea 文本域
---

<script setup>
import { ref } from 'vue'
import { NvTextarea } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const content = ref('可以随内容自动增高的多行输入。')
</script>

# NvTextarea 文本域

多行文本输入，支持固定行数、自动增高与校验失败态。

## 示例

<Demo>
  <NvTextarea aria-label="备注" placeholder="请输入备注" style="width: 320px" />
  <NvTextarea aria-label="固定五行文本" placeholder="固定 5 行" :rows="5" style="width: 320px" />
</Demo>

<Demo>
  <div style="display: flex; flex-direction: column; gap: 8px; width: 320px">
    <NvTextarea v-model="content" aria-label="自动增高文本" auto-resize placeholder="自动增高" />
    <span style="font-size: 13px; color: var(--vp-c-text-2)">字符数：{{ content.length }}</span>
  </div>
</Demo>

<Demo>
  <NvTextarea aria-label="禁用的文本域" placeholder="禁用" disabled style="width: 240px" />
  <NvTextarea aria-label="只读的文本域" placeholder="只读" read-only default-value="只读内容" style="width: 240px" />
  <NvTextarea aria-label="校验失败的文本域" placeholder="校验失败" invalid style="width: 240px" />
</Demo>

## API

### NvTextarea 属性

| 属性           | 说明                                         | 类型      | 默认    |
| -------------- | -------------------------------------------- | --------- | ------- |
| `modelValue`   | 绑定值（`v-model`）                          | `string`  | —       |
| `defaultValue` | 非受控初始值                                 | `string`  | —       |
| `placeholder`  | 占位文本                                     | `string`  | —       |
| `disabled`     | 禁用                                         | `boolean` | `false` |
| `readOnly`     | 只读                                         | `boolean` | `false` |
| `required`     | 必填                                         | `boolean` | `false` |
| `invalid`      | 校验失败态，设置 `aria-invalid` 与危险色描边 | `boolean` | `false` |
| `autoResize`   | 随内容自动增高                               | `boolean` | `false` |
| `rows`         | 非自动增高时可见的行数                       | `number`  | `3`     |

未列出的属性会透传给底层文本域元素（如 `maxlength`、`name`）。

### 事件

| 事件                | 说明                      |
| ------------------- | ------------------------- |
| `update:modelValue` | 文本变化，参数为 `string` |
