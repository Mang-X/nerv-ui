---
title: NvScreenScaler 大屏缩放容器
---

<script setup>
import { NvScreenScaler } from '@nerv-ui/screen'
import '@nerv-ui/screen/styles.css'
</script>

# NvScreenScaler 大屏缩放容器

按 1920×1080 设计稿等比缩放内容，适配不同分辨率的播放屏。

## 示例

<Demo>
  <div style="width: 100%">
    <NvScreenScaler aria-label="缩放容器示例">
      <div
        style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; border: 1px solid #1e3a8a; background: #081226; color: #dbeafe; font-size: 28px"
      >
        1920 × 1080 设计稿内容
      </div>
    </NvScreenScaler>
  </div>
</Demo>

<Demo>
  <div style="width: 100%">
    <NvScreenScaler :design-width="960" :design-height="540" aria-label="自定义设计稿尺寸">
      <div
        style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; border: 1px dashed #334155; background: #0b1220; color: #cbd5e1; font-size: 20px"
      >
        960 × 540
      </div>
    </NvScreenScaler>
  </div>
</Demo>

## API

### NvScreenScaler 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `designWidth` | 设计稿宽度 | `number` | `1920` |
| `designHeight` | 设计稿高度 | `number` | `1080` |
| `ariaLabel` | 容器的无障碍标签 | `string` | `数据大屏` |

### 事件

| 事件 | 说明 |
| --- | --- |
| `scale-change` | 缩放比例变化，参数为当前 `scale` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 按设计稿尺寸绘制的舞台内容，作用域为 `{ scale }` |
