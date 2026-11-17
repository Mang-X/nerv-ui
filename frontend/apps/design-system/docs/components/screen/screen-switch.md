---
title: NvScreenSwitch 开关
---

<script setup>
import { ref } from 'vue'
import { NvScreenSwitch } from '@nerv-iip/ui'

const auto = ref(true)
const alarm = ref(false)
</script>

# NvScreenSwitch 开关

大屏开关:关态是一口下沉的细线轨道,开态填青色带柔光并把手柄滑到另一端。按下手柄微微压扁(无回弹)。状态同时由填充与手柄位置承载 —— 绝不只靠颜色,`aria-checked` 对辅助技术保持诚实。通过 `v-model`(布尔)绑定,基于独立的 `--nv-scr-*` 令牌。

## 基础用法

`v-model` 绑定布尔值。

<ScreenDemo>
  <div style="display:flex;align-items:center;gap:24px">
    <label style="display:flex;align-items:center;gap:10px;color:var(--nv-scr-text-2);font-size:14px">
      <NvScreenSwitch v-model="auto" /> 到访提醒
    </label>
    <label style="display:flex;align-items:center;gap:10px;color:var(--nv-scr-text-2);font-size:14px">
      <NvScreenSwitch v-model="alarm" /> 活动提醒
    </label>
  </div>
</ScreenDemo>

```vue
<script setup>
const auto = ref(true)
</script>

<template><NvScreenSwitch v-model="auto" /> 到访提醒</template>
```

## 禁用态

`disabled` 整体淡出并禁止切换,开、关两态均可禁用。

<ScreenDemo>
  <div style="display:flex;align-items:center;gap:24px">
    <NvScreenSwitch :model-value="true" disabled />
    <NvScreenSwitch :model-value="false" disabled />
  </div>
</ScreenDemo>

```vue
<NvScreenSwitch :model-value="true" disabled />
<NvScreenSwitch :model-value="false" disabled />
```

## 属性

| 属性       | 说明     | 类型      | 默认    |
| ---------- | -------- | --------- | ------- |
| `v-model`  | 开关状态 | `boolean` | `false` |
| `disabled` | 禁用     | `boolean` | `false` |

## 键盘与事件

使用原生 button 的 click 激活通道：鼠标、Space、Enter 每次激活只更新一次 `update:modelValue`（boolean）。不叠加自定义 keydown 切换。`disabled` 同时使用原生属性和处理器 guard。请通过可见 label 或 `aria-label` / `aria-labelledby` 提供名称；提醒、声音等业务动作由宿主实现。
