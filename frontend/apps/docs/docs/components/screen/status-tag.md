---
title: NvScreenStatusTag 状态标签
---

<script setup>
import { ref } from 'vue'
import { NvScreenInput, NvScreenSelect, NvScreenStatusTag } from '@nerv-iip/ui'
const tone = ref('run')
const label = ref('欢迎来坐坐')
const tones = ['run', 'idle', 'alarm', 'cyan', 'green', 'amber', 'red']
const toneOptions = tones.map((item) => ({ label: item, value: item }))
</script>

# NvScreenStatusTag 状态标签

圆点、文字与淡色边框共同表达状态。文字通过 **label prop** 提供，本组件没有用于替换标签的默认 slot。`run`、`idle`、`alarm` 分别映射到绿色、琥珀色、红色，原始颜色名也可直接使用。颜色同义不等于文字含义相同。

## 示例

<ScreenDemo>
  <div class="status-tag-doc">
    <NvScreenSelect v-model="tone" :options="toneOptions" placeholder="标签颜色" />
    <NvScreenInput v-model="label" ariaLabel="标签文字" />
    <NvScreenStatusTag :tone="tone" :label="label" />
  </div>
</ScreenDemo>

```vue
<NvScreenStatusTag tone="run" label="阅读空间开放" />
<NvScreenStatusTag tone="green" label="阅读空间开放" />
<NvScreenStatusTag tone="cyan" label="尚未统计" />
```

## API

### NvScreenStatusTag 属性

| 属性    | 说明                         | 类型                                                                  | 默认                   |
| ------- | ---------------------------- | --------------------------------------------------------------------- | ---------------------- |
| `tone`  | 别名或原始颜色               | `'run' \| 'idle' \| 'alarm' \| 'cyan' \| 'green' \| 'amber' \| 'red'` | `'run'`                |
| `label` | 标签文字，由宿主提供状态含义 | `string`                                                              | `'运行中'`，保留旧默认 |

## 设计说明

独立接入时显式传入中性文字；不要用默认“运行中”代表未知。文字随 prop 更新，状态不靠颜色单独识别。长标签须有足够宿主宽度，标签本身不自动推断缩写或业务规则。

<style>
.status-tag-doc { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; color: var(--nv-scr-text); }
.status-tag-doc .nv-scr-sel { width: 160px; }
.status-tag-doc .nv-scr-in { flex: 1; min-width: 200px; }
</style>
