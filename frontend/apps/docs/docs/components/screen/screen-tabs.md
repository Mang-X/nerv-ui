---
title: NvScreenTabs 标签页
---

<script setup>
import { ref } from 'vue'
import { NvScreenTabs } from '@nerv-ui/ui'

const tab = ref('output')
const items = [
  { label: '阅读空间', value: 'output' },
  { label: '展览空间', value: 'quality' },
  { label: '交流空间', value: 'energy' },
  { label: '休憩空间', value: 'device' },
]
</script>

# NvScreenTabs 标签页

大屏标签页:一排标签压在细基线上,激活项发青光,底部一道下划线随之平滑滑动(按索引驱动)。方向键在标签间移动。通过 `v-model` 绑定当前项 `value`,基于独立的 `--nv-scr-*` 令牌。

## 示例

`items` 传 `{ label, value }`,`v-model` 持有激活的 `value`;未绑定时默认首项。

<ScreenDemo>
  <div style="width:480px">
    <NvScreenTabs v-model="tab" :items="items" />
    <div style="margin-top:16px;color:var(--nv-scr-text-2);font-size:14px">
      当前视图:{{ items.find(i => i.value === tab)?.label }}
    </div>
  </div>
</ScreenDemo>

```vue
<script setup>
const tab = ref('output')
const items = [
  { label: '阅读空间', value: 'output' },
  { label: '展览空间', value: 'quality' },
  { label: '交流空间', value: 'energy' },
  { label: '休憩空间', value: 'device' },
]
</script>

<template>
  <NvScreenTabs v-model="tab" :items="items" />
</template>
```

## API

### NvScreenTabs 属性

| 属性       | 说明                                | 类型                                           | 默认         |
| ---------- | ----------------------------------- | ---------------------------------------------- | ------------ |
| `v-model`  | 激活项的 `value`,未绑定时自动取首项 | `string \| number`                             | —            |
| `items`    | 标签列表                            | `{ label: string; value: string \| number }[]` | 内置示例视图 |
| `disabled` | 整组禁用                            | `boolean`                                      | `false`      |

## 设计说明

挂载时，仅在未禁用且模型为 `undefined`、列表非空时初始化为首项；受控宿主会收到一次 update。禁用挂载不初始化、不发事件。之后启用、重排或空列表恢复都不会自动补默认值；模型仍由宿主或用户选择驱动，已定义的数字 `0` / 字符串 `'0'` 保持身份。

鼠标点击、← / → 都会更新 `v-model` 并把焦点移到对应按钮；Tab 只进入当前项。`disabled` 默认 `false`，为 `true` 时整组不响应输入且不进入 Tab 顺序。按钮的原生 Space / Enter 激活沿用 click 通道。

`value` 严格区分数字 `0` 与字符串 `'0'`。重排保留值身份；删除已选项或清空数组不会替宿主改写模型，选择指示隐藏，非空列表的首项仍可由 Tab 进入，供用户重新选择。恢复包含当前值的选项后恢复选择指示。选项值应在列表内唯一。

Tabs 各项为等宽槽位，下划线按槽位索引定位；长标签省略，完整名称仍在按钮文本中。它与 Segmented 的真实宽度测量合同不同。
