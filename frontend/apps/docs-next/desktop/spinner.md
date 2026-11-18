---
title: NvSpinner 加载指示器
---

<script setup>
import { NvSpinner } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'
</script>

# NvSpinner 加载指示器

表示正在进行的短时加载，默认向辅助技术播报"加载中"。

## 示例

<Demo>
  <NvSpinner size="sm" />
  <NvSpinner size="md" />
  <NvSpinner size="lg" />
</Demo>

<Demo>
  <NvSpinner label="正在同步记录" />
  <NvSpinner label="正在上传文件" decorative />
</Demo>

<Demo>
  <span style="display: inline-flex; align-items: center; gap: 8px; color: var(--vp-c-text-2)">
    <NvSpinner size="sm" />
    正在加载第 2 页数据…
  </span>
</Demo>

## API

### NvSpinner 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `size` | 尺寸 | `sm \| md \| lg` | `md` |
| `label` | 旋转期间播报的无障碍名称 | `string` | `加载中` |
| `decorative` | 纯装饰时隐藏于辅助技术 | `boolean` | `false` |

### NvSpinner 插槽

无插槽；图标由组件内置。
