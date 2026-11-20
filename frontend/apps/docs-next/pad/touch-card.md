---
title: NvTouchCard 触屏卡片
---

<script setup>
import { ref } from 'vue'
import { NvTouchCard } from '@nerv-ui-next/pad'
import '@nerv-ui-next/pad/styles.css'

const clicks = ref(0)

function countPress() {
  clicks.value += 1
}
</script>

# NvTouchCard 触屏卡片

平板端的内容容器，支持描边、浮起与透明三种形态，可整卡点击。

## 示例

<Demo>
  <NvTouchCard title="记录分组" subtitle="本周共 12 条记录" style="width: 320px">
    <p style="margin: 0">按分组汇总记录数量与最近一次更新。</p>
    <template #footer>
      <span style="font-size: 14px; opacity: 0.72">更新于 08:20</span>
    </template>
  </NvTouchCard>
  <NvTouchCard title="资源摘要" subtitle="共 6 项资源" variant="solid" style="width: 320px">
    <p style="margin: 0">展示资源占用、可用数量与当前状态。</p>
  </NvTouchCard>
</Demo>

<Demo>
  <NvTouchCard title="透明形态" variant="ghost" padding="md" style="width: 320px">
    <p style="margin: 0">用于已有背景的容器内，不额外绘制表面。</p>
  </NvTouchCard>
  <NvTouchCard variant="outline" padding="md" style="width: 320px">
    <p style="margin: 0">不带标题时只渲染内容区，内边距随 `padding` 变化。</p>
  </NvTouchCard>
</Demo>

<Demo block>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <NvTouchCard
      title="可点击卡片"
      subtitle="整卡可聚焦，Enter 与空格都能触发"
      interactive
      @click="countPress"
    >
      <p style="margin: 0">点击次数：<span v-text="clicks"></span></p>
      <template #header-actions>
        <span style="font-size: 14px; opacity: 0.72">交互示例</span>
      </template>
    </NvTouchCard>
    <NvTouchCard title="禁用卡片" subtitle="变暗且不响应交互" interactive disabled>
      <p style="margin: 0">用于暂时不可进入的分组或资源。</p>
    </NvTouchCard>
  </div>
</Demo>

## API

### NvTouchCard 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `variant` | 视觉形态：`outline` 保留细边框，`solid` 使用浮起表面，`ghost` 透明 | `outline \| solid \| ghost` | `outline` |
| `title` | 内建头部的标题 | `string` | — |
| `subtitle` | 标题下方的补充说明 | `string` | — |
| `padding` | 内边距尺度；`lg` 用于全屏操作面 | `md \| lg` | `lg` |
| `interactive` | 整卡可点击：焦点环与指针反馈 | `boolean` | `false` |
| `disabled` | 变暗并阻止卡片本身的交互 | `boolean` | `false` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `title` | 自定义标题 |
| `header-actions` | 标题行右侧的操作区 |
| `subtitle` | 自定义补充说明 |
| `default` | 卡片正文 |
| `footer` | 卡片底部操作区 |
