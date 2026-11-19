---
title: NvProgress 进度条
---

<script setup>
import { ref } from 'vue'
import { NvProgress } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const percent = ref(42)
const uploading = ref(68)
</script>

# NvProgress 进度条

展示任务完成程度；`value` 为 `null` 时转为不确定态循环动画。

## 示例

<Demo block>
  <NvProgress :value="percent" label="本记录完成率" show-value />
</Demo>

<Demo block>
  <NvProgress :value="uploading" label="文件上传" show-value />
  <div style="display: flex; gap: 8px; margin-top: 12px">
    <button type="button" @click="uploading = Math.max(0, uploading - 10)">−10%</button>
    <button type="button" @click="uploading = Math.min(100, uploading + 10)">+10%</button>
  </div>
</Demo>

<Demo>
  <NvProgress size="sm" :value="30" label="小号进度" />
  <NvProgress size="md" :value="62" label="中号进度" />
  <NvProgress size="lg" :value="88" label="大号进度" />
</Demo>

<Demo block>
  <NvProgress :value="null" label="正在连接资源" />
  <NvProgress :value="null" size="sm" label="同步中（无具体进度）" />
</Demo>

<Demo block>
  <NvProgress :value="12" :min="0" :max="20" label="抽查样本 12 / 20" show-value />
</Demo>

## API

### NvProgress 属性

| 属性        | 说明                                | 类型             | 默认    |
| ----------- | ----------------------------------- | ---------------- | ------- |
| `value`     | 完成程度；`null` 渲染不确定态进度条 | `number \| null` | `null`  |
| `min`       | 最小值                              | `number`         | `0`     |
| `max`       | 最大值                              | `number`         | `100`   |
| `label`     | 进度条上方的可见标签                | `string`         | —       |
| `showValue` | 在标签行末尾显示格式化后的数值      | `boolean`        | `false` |
| `size`      | 尺寸                                | `sm \| md \| lg` | `md`    |

### NvProgress 插槽

无插槽；标签与数值由组件渲染。
