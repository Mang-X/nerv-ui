---
title: NvScreenStatusLight 状态灯
---

<script setup>
import { ref } from 'vue'
import { NvScreenInput, NvScreenSelect, NvScreenStatusLight } from '@nerv-iip/ui'
const tone = ref('run')
const label = ref('欢迎来坐坐')
const tones = ['run', 'idle', 'alarm', 'cyan', 'green', 'amber', 'red']
const toneOptions = tones.map((item) => ({ label: item, value: item }))
</script>

# NvScreenStatusLight 状态灯

10px 呼吸光点搭配宿主提供的状态文字。`run`、`idle`、`alarm` 分别与 `green`、`amber`、`red` 同色；别名不生成文字，也不决定业务含义。请始终提供明确 `label`，避免只靠颜色表意。

## 示例

<ScreenDemo>
  <div class="status-light-doc">
    <NvScreenSelect v-model="tone" :options="toneOptions" placeholder="灯颜色" />
    <NvScreenInput v-model="label" ariaLabel="灯文字" />
    <NvScreenStatusLight :tone="tone" :label="label" />
  </div>
</ScreenDemo>

```vue
<NvScreenStatusLight tone="run" label="阅读空间开放" />
<NvScreenStatusLight tone="green" label="阅读空间开放" />
<NvScreenStatusLight tone="cyan" label="尚未统计" />
```

## API

### NvScreenStatusLight 属性

| 属性    | 说明           | 类型                                                                  | 默认    |
| ------- | -------------- | --------------------------------------------------------------------- | ------- |
| `tone`  | 别名或原始颜色 | `'run' \| 'idle' \| 'alarm' \| 'cyan' \| 'green' \| 'amber' \| 'red'` | `'run'` |
| `label` | 光点旁文字     | `string`                                                              | 无      |

## 设计说明

减少动态效果时停止呼吸，光点与文字保留。这是基础小灯；大主灯、状态墙、取数和异常规则由各自 owner 提供，不由此组件推断。

<style>
.status-light-doc { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; color: var(--nv-scr-text); }
.status-light-doc .nv-scr-sel { width: 160px; }
.status-light-doc .nv-scr-in { flex: 1; min-width: 200px; }
</style>
