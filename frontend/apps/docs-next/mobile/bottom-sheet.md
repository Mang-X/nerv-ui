---
title: NvBottomSheet 底部面板
---

<script setup>
import { ref } from 'vue'
import { NvBottomSheet, NvMobileButton } from '@nerv-ui-next/mobile'
import '@nerv-ui-next/mobile/styles.css'

const filterOpen = ref(false)
const plainOpen = ref(false)
</script>

# NvBottomSheet 底部面板

从底部弹出的模态面板，用于筛选、操作确认等移动端场景。

## 示例

<Demo>
  <NvMobileButton @click="filterOpen = true">打开筛选面板</NvMobileButton>
  <NvBottomSheet
    v-model:open="filterOpen"
    title="筛选条件"
    description="按状态和日期收窄任务列表"
  >
    <div style="display: flex; flex-direction: column; gap: 12px">
      <span>状态：全部</span>
      <span>日期：最近 7 天</span>
    </div>
    <template #footer>
      <div style="display: flex; gap: 12px">
        <NvMobileButton block variant="secondary" @click="filterOpen = false">重置</NvMobileButton>
        <NvMobileButton block @click="filterOpen = false">应用</NvMobileButton>
      </div>
    </template>
  </NvBottomSheet>
</Demo>

<Demo>
  <NvMobileButton variant="secondary" @click="plainOpen = true">无标题面板</NvMobileButton>
  <NvBottomSheet v-model:open="plainOpen" aria-label="操作面板">
    <div style="display: flex; flex-direction: column; gap: 12px">
      <NvMobileButton block variant="secondary">选项一</NvMobileButton>
      <NvMobileButton block variant="secondary">选项二</NvMobileButton>
    </div>
  </NvBottomSheet>
</Demo>

## API

### NvBottomSheet 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `open` | 是否打开 | `boolean` | `false` |
| `title` | 面板标题 | `string` | — |
| `description` | 标题下方的描述 | `string` | — |
| `ariaLabel` | 无标题时的无障碍标签 | `string` | `底部面板` |
| `modal` | 模态行为 | `boolean \| 'trap-focus'` | `true` |
| `dismissible` | 允许 Esc 等方式关闭 | `boolean` | `true` |
| `closeOnOutsidePress` | 点击遮罩关闭 | `boolean` | `true` |
| `showClose` | 显示右上角关闭按钮 | `boolean` | `true` |
| `closeLabel` | 关闭按钮的无障碍标签 | `string` | `关闭` |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:open` | 打开状态变化，参数为 `boolean` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 面板主体 |
| `title` | 自定义标题 |
| `description` | 自定义描述 |
| `footer` | 底部操作区 |
