---
title: NvScreenToolbar 大屏工具栏
---

<script setup>
import { ref } from 'vue'
import { NvScreenButton, NvScreenSegmented, NvScreenStatusTag, NvScreenToolbar } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'

const range = ref('today')
const options = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
]
const clicks = ref(0)
</script>

# NvScreenToolbar 大屏工具栏

大屏页顶的筛选与操作条，默认左侧放主控件、右侧放次级操作，也可横向滚动或换行。

## 示例

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenToolbar aria-label="看板工具栏">
      <NvScreenSegmented v-model:value="range" :options="options" aria-label="时间范围" />
      <NvScreenStatusTag label="实时数据" tone="success" />
      <template #end>
        <NvScreenButton variant="secondary" size="md" @click="clicks++">刷新</NvScreenButton>
        <NvScreenButton variant="primary" size="md" @click="clicks++">导出</NvScreenButton>
      </template>
    </NvScreenToolbar>
    <span style="font-size: 13px; opacity: 0.7">操作次数：<span v-text="clicks"></span></span>
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenToolbar overflow="scroll" aria-label="可滚动工具栏">
      <NvScreenButton variant="outline" size="md" v-for="index in 6" :key="index">
        筛选 <span v-text="index"></span>
      </NvScreenButton>
    </NvScreenToolbar>
    <NvScreenToolbar disabled aria-label="禁用工具栏">
      <NvScreenButton variant="outline" size="md">筛选</NvScreenButton>
      <template #end>
        <NvScreenButton variant="primary" size="md">执行</NvScreenButton>
      </template>
    </NvScreenToolbar>
  </div>
</Demo>

## API

### NvScreenToolbar 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `label` | 工具栏的无障碍名称 | `string` | `工具栏` |
| `disabled` | 整体变暗，例如查询进行中 | `boolean` | `false` |
| `overflow` | `wrap` 允许换行；`scroll` 保持单行并横向滚动 | `wrap \| scroll` | `wrap` |

### NvScreenToolbar 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 左侧主控件组 |
| `end` | 右侧次级操作组，渲染时自动加分隔线 |
