---
title: NvNoticeBar 通知条
---

<script setup>
import { ref } from 'vue'
import { NvMobileButton, NvNoticeBar } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'

const visible = ref(true)
</script>

# NvNoticeBar 通知条

页面内嵌的提示条，用于说明、告警与操作引导。

## 示例

<Demo>
  <div style="display: flex; flex-direction: column; gap: 12px; width: 100%">
    <NvNoticeBar text="今日盘点任务将在 18:00 截止。" />
    <NvNoticeBar variant="danger" text="工位 ST-04 上报设备报警，请及时处理。" />
    <NvNoticeBar variant="neutral" text="系统将于今晚 22:00 进行例行维护。" />
  </div>
</Demo>

<Demo>
  <div style="display: flex; flex-direction: column; gap: 12px; width: 100%">
    <NvNoticeBar
      v-if="visible"
      text="这条通知可以关闭。"
      closable
      @close="visible = false"
    />
    <NvMobileButton v-else size="md" variant="secondary" @click="visible = true">
      恢复通知条
    </NvMobileButton>
    <NvNoticeBar variant="danger" text="库存低于安全线" closable>
      <template #action>
        <NvMobileButton size="md" variant="link">去补货</NvMobileButton>
      </template>
    </NvNoticeBar>
  </div>
</Demo>

## API

### NvNoticeBar 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `text` | 通知文字 | `string` | — |
| `variant` | 语义变体 | `info \| danger \| neutral` | `info` |
| `icon` | 自定义图标组件 | `Component` | 按变体取内置图标 |
| `closable` | 显示关闭按钮 | `boolean` | `false` |
| `closeLabel` | 关闭按钮的无障碍标签 | `string` | `关闭` |

### 事件

| 事件 | 说明 |
| --- | --- |
| `close` | 点击关闭按钮 |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 通知文字，替代 `text` |
| `icon` | 自定义左侧图标 |
| `action` | 文字与关闭按钮之间的操作区 |
