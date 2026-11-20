---
title: NvScreenSwitch 大屏开关
---

<script setup>
import { ref } from 'vue'
import { NvScreenSwitch } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'

const auto = ref(true)
</script>

# NvScreenSwitch 大屏开关

行为来自 `@ui-sdk/vue/switch`：`aria-checked`、键盘、受控/非受控与隐藏的原生 input 都由原语承担。开态同时改填充与手柄位置，不是只靠颜色。

## 示例

<Demo>
  <div class="nv-screen-stage" style="padding: 40px; gap: 24px">
    <NvScreenSwitch v-model:checked="auto" aria-label="自动巡检" />
    <NvScreenSwitch default-checked disabled aria-label="已锁定的巡检开关" />
  </div>
</Demo>

当前：{{ auto ? '开' : '关' }}

## API

| 属性 | 说明 |
| --- | --- |
| `checked` | 受控态（`v-model:checked`）。 |
| `defaultChecked` | 非受控初始值。 |
| `disabled` | 禁用。 |
