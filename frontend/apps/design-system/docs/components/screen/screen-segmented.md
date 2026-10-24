---
title: NvScreenSegmented 分段控制
---

<script setup>
import { ref } from 'vue'
import { NvScreenSegmented } from '@nerv-iip/ui'

const range = ref('today')
const shift = ref('a')
const shifts = [
  { label: '上午', value: 'a' },
  { label: '下午', value: 'b' },
  { label: '晚间', value: 'c' },
]
</script>

# NvScreenSegmented 分段控制

大屏分段控制(今日 / 近7天 / 近30天):细线框出的轨道,激活项填青色带淡辉光,段间骑一道内嵌分隔线。选择由键盘驱动(← / →),并以 radio 组语义暴露。通过 `v-model` 绑定,基于独立的 `--nv-scr-*` 令牌。

## 基础用法

`options` 传 `{ label, value }`,`v-model` 持有选中值;未绑定时默认首项。

<ScreenDemo>
  <NvScreenSegmented v-model="range" />
</ScreenDemo>

```vue
<script setup>
const range = ref('today')
</script>

<template>
  <!-- 默认选项:今日 / 近7天 / 近30天 -->
  <NvScreenSegmented v-model="range" />
</template>
```

## 自定义选项

传入 `options` 覆盖默认时间段,例如到访时段。

<ScreenDemo>
  <NvScreenSegmented v-model="shift" :options="shifts" />
</ScreenDemo>

```vue
<script setup>
const shift = ref('a')
const shifts = [
  { label: '上午', value: 'a' },
  { label: '下午', value: 'b' },
  { label: '晚间', value: 'c' },
]
</script>

<template>
  <NvScreenSegmented v-model="shift" :options="shifts" />
</template>
```

## 属性

| 属性       | 说明                                | 类型                                           | 默认                    |
| ---------- | ----------------------------------- | ---------------------------------------------- | ----------------------- |
| `v-model`  | 选中项的 `value`,未绑定时自动取首项 | `string \| number`                             | —                       |
| `options`  | 分段选项                            | `{ label: string; value: string \| number }[]` | `今日 / 近7天 / 近30天` |
| `disabled` | 整组禁用                            | `boolean`                                      | `false`                 |

## 受控选择与动态选项

鼠标点击、← / → 都会更新 `v-model` 并把焦点移到对应按钮；Tab 只进入当前项。`disabled` 默认 `false`，为 `true` 时整组不响应输入且不进入 Tab 顺序。按钮的原生 Space / Enter 激活沿用 click 通道。

`value` 严格区分数字 `0` 与字符串 `'0'`。重排保留值身份；删除已选项或清空数组不会替宿主改写模型，选择指示隐藏，非空列表的首项仍可由 Tab 进入，供用户重新选择。恢复包含当前值的选项后恢复选择指示。选项值应在列表内唯一。

Segmented 按当前按钮的真实 offset 宽度和位置测量滑块；标签、选项、容器尺寸或字体引起的宽度变化会重测，卸载后断开 observer 与 resize 监听。
