---
title: NvMobileTag 标签
---

<script setup>
import { ref } from 'vue'
import { NvMobileTag } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'

const tags = ref(['待处理', '已审核', '已关闭'])
</script>

# NvMobileTag 标签

状态与分类的短标记，可选可移除。

## 示例

<Demo>
  <NvMobileTag>默认</NvMobileTag>
  <NvMobileTag variant="brand">品牌</NvMobileTag>
  <NvMobileTag variant="danger">危险</NvMobileTag>
  <NvMobileTag variant="outline">描边</NvMobileTag>
</Demo>

<Demo>
  <NvMobileTag size="sm">小号</NvMobileTag>
  <NvMobileTag size="md">中号</NvMobileTag>
  <NvMobileTag round>圆角</NvMobileTag>
</Demo>

<Demo>
  <NvMobileTag
    v-for="(tag, index) in tags"
    :key="tag"
    variant="brand"
    closable
    @close="tags.splice(index, 1)"
  >
    {{ tag }}
  </NvMobileTag>
</Demo>

剩余标签：{{ tags.length }} 个（点右侧 × 可移除）

## API

### NvMobileTag 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `variant` | 视觉变体 | `neutral \| brand \| danger \| outline` | `neutral` |
| `size` | 尺寸 | `sm \| md` | `sm` |
| `round` | 胶囊圆角 | `boolean` | `false` |
| `closable` | 显示移除按钮 | `boolean` | `false` |
| `closeLabel` | 移除按钮的无障碍标签 | `string` | `移除标签` |

### 事件

| 事件 | 说明 |
| --- | --- |
| `close` | 点击移除按钮 |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 标签文字 |
| `close-icon` | 自定义移除图标 |
