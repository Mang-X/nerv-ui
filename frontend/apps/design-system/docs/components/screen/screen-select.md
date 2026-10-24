---
title: NvScreenSelect 下拉选择
---

<script setup>
import { ref } from 'vue'
import { NvScreenSelect } from '@nerv-iip/ui'

const line = ref('line-a')
const shift = ref('')

const lines = [
  { label: '街角书房', value: 'line-a' },
  { label: '河岸展厅', value: 'line-b' },
  { label: '城市客厅', value: 'line-c' },
  { label: '屋顶花园', value: 'line-d' },
]
const shifts = [
  { label: '上午 09:00 - 12:00', value: 'a' },
  { label: '下午 14:00 - 17:00', value: 'b' },
  { label: '晚间 18:00 - 20:00', value: 'c' },
]
</script>

# NvScreenSelect 下拉选择

大屏下拉:暗色触发器落下一块发光选项面板,选中行显青色并带勾,面板浮在青色阴影上。键盘可驱动(↑ / ↓ / Enter / Esc),具备 listbox 语义,点击外部即收起。通过 `v-model` 绑定选项 `value`,基于独立的 `--nv-scr-*` 令牌。

## 基础用法

`options` 传 `{ label, value }` 列表,`v-model` 持有选中的 `value`。

<ScreenDemo>
  <div style="width:260px">
    <NvScreenSelect v-model="line" :options="lines" />
  </div>
</ScreenDemo>

```vue
<script setup>
const line = ref('line-a')
const lines = [
  { label: '街角书房', value: 'line-a' },
  { label: '河岸展厅', value: 'line-b' },
  { label: '城市客厅', value: 'line-c' },
  { label: '屋顶花园', value: 'line-d' },
]
</script>

<template>
  <NvScreenSelect v-model="line" :options="lines" />
</template>
```

## 占位与禁用

未选中时显示 `placeholder`;`disabled` 整体淡出。

<ScreenDemo>
  <div style="display:flex;gap:16px">
    <div style="width:240px">
      <NvScreenSelect v-model="shift" :options="shifts" placeholder="请选择时段" />
    </div>
    <div style="width:200px">
      <NvScreenSelect :options="lines" disabled placeholder="区域锁定" />
    </div>
  </div>
</ScreenDemo>

```vue
<NvScreenSelect v-model="shift" :options="shifts" placeholder="请选择时段" />
<NvScreenSelect :options="lines" disabled placeholder="区域锁定" />
```

## 属性

| 属性          | 说明             | 类型                                           | 默认           |
| ------------- | ---------------- | ---------------------------------------------- | -------------- |
| `v-model`     | 选中项的 `value` | `string \| number`                             | —              |
| `options`     | 选项列表         | `{ label: string; value: string \| number }[]` | 内置示例产线   |
| `placeholder` | 未选中时的占位   | `string`                                       | `'请选择产线'` |
| `disabled`    | 禁用             | `boolean`                                      | `false`        |

## 浮层、键盘与动态选项

Enter / Space / ↓ / ↑ 打开；打开后 ↑ / ↓ 移动活动项，Enter / Space 选择。Esc 关闭并保留触发器焦点，Tab 关闭并继续浏览器的焦点顺序；外点关闭时保留外部目标焦点。选值后回到触发器。禁用会关闭已开的浮层，所有选择动作均受禁用 guard 约束。

面板通过 Teleport 到 body，按触发器的 viewport 矩形使用 fixed 定位，内滚与窗口 resize 后重锚。底部不足时向上展开，宽度和最大高度受视口边界约束；不依赖舞台的 CSS 缩放坐标，不会被 Panel 的 overflow 裁切。宿主应加载现有公共 CSS。

选项值严格区分数字 `0` 与字符串 `'0'`，每个值应唯一。动态重排按值保留活动项；删除已选项时显示 placeholder 并保留父模型原值，空数组可安全打开/关闭；恢复选项后可继续选择。组件不取数、不推断缺失值含义。关闭或卸载后移除监听与 observer。

零 props 的产线选项和 placeholder 是保留兼容的历史默认值；通用场景显式提供 options 和 placeholder。独立中性入口为 `/#screen/controls`。
