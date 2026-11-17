---
title: NvMobileEmpty 空状态
---

<script setup>
import { NvMobileButton, NvMobileEmpty } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'
</script>

# NvMobileEmpty 空状态

列表或区域没有内容时的占位说明，默认带虚线卡片框，也可切换为列表内嵌样式。

## 示例

<Demo block>
  <NvMobileEmpty
    title="暂无工单"
    description="今天还没有新的生产工单，创建后会显示在这里。"
  />
</Demo>

<Demo block>
  <NvMobileEmpty
    size="sm"
    :bordered="false"
    title="没有匹配记录"
    description="试试更换关键词，或清除筛选条件。"
  />
</Demo>

<Demo block>
  <NvMobileEmpty title="还没有消息">
    <template #icon>
      <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 6h16v12H4zM4 7l8 6 8-6"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linejoin="round"
        />
      </svg>
    </template>
    <NvMobileButton variant="secondary" size="md">刷新消息</NvMobileButton>
  </NvMobileEmpty>
</Demo>

## API

### NvMobileEmpty 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `title` | 主标题 | `string` | — |
| `description` | 补充说明 | `string` | — |
| `icon` | 图标组件，缺省为收件箱图标 | `Component` | — |
| `bordered` | 显示虚线卡片框；列表内嵌时可关闭 | `boolean` | `true` |
| `size` | 尺寸，`sm` 收紧内边距与图标 | `sm \| md` | `md` |

### NvMobileEmpty 插槽

| 插槽 | 说明 |
| --- | --- |
| `icon` | 替换默认图标 |
| `title` | 自定义标题 |
| `description` | 自定义说明 |
| `default` | 操作区，仅在传入时渲染 |
