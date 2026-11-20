---
title: NvMobileStepper 步进器
---

<script setup>
import { ref } from 'vue'
import { NvMobileStepper } from '@nerv-ui-next/mobile'
import '@nerv-ui-next/mobile/styles.css'

const qty = ref(3)
const bounded = ref(1)
</script>

# NvMobileStepper 步进器

增减按钮加中间可编辑的数字框。夹值、步长、键盘与输入框里的数字编辑全部来自 `@ui-sdk/vue/number-input`。

## 示例

<Demo block>
  <div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start">
    <NvMobileStepper v-model="qty" label="数量" :min="0" :max="99" />
    <NvMobileStepper v-model="bounded" label="箱数" :min="1" :max="5" step="1" />
    <NvMobileStepper label="已锁定" :model-value="2" disabled />
  </div>
</Demo>

数量：{{ qty }}，箱数：{{ bounded }}

## API

| 属性 | 说明 |
| --- | --- |
| `modelValue` | 受控值（`v-model`）。 |
| `min` / `max` | 夹值边界。 |
| `step` | 每按一次的增减量。 |
| `disabled` | 禁用。 |
| `label` | 数字框的无障碍名称。不加可见标签时必须给——否则框里只有一个数字，读屏读不出它是什么。 |
