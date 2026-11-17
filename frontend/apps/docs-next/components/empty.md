---
title: NvEmpty 空状态
---

<script setup>
import { NvEmpty, NvButton } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'
</script>

# NvEmpty 空状态

列表或区域无内容时的占位说明，支持标题、描述、图标替换与操作区。

## 示例

<Demo block>
  <NvEmpty title="暂无工单" description="今天还没有新的生产工单，创建后会显示在这里。" />
</Demo>

<Demo block>
  <NvEmpty
    size="sm"
    title="没有匹配结果"
    description="试试更换关键词，或清除筛选条件。"
  />
</Demo>

<Demo block>
  <NvEmpty size="sm">
    <template #icon>
      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="M16.5 16.5l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </template>
    <template #title>没有搜索到工单</template>
    <template #description>关键词 "WO-9999" 暂无对应记录。</template>
    <NvButton size="sm" variant="outline">清除筛选</NvButton>
  </NvEmpty>
</Demo>

## API

### NvEmpty 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `title` | 主标题；`title` 插槽优先 | `string` | — |
| `description` | 补充说明；`description` 插槽优先 | `string` | — |
| `size` | 尺寸，`sm` 收紧内边距与图标 | `sm \| md` | `md` |

### NvEmpty 插槽

| 插槽 | 说明 |
| --- | --- |
| `icon` | 替换默认收件箱图标 |
| `title` | 自定义标题内容 |
| `description` | 自定义描述内容 |
| `default` | 操作区，仅在传入时渲染 |
