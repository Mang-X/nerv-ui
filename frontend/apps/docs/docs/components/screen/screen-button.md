---
title: NvScreenButton 按钮
---

<script setup>
import { NvScreenButton } from '@nerv-iip/ui'
</script>

# NvScreenButton 按钮

大屏操作按钮,深底上的三种权重:`primary` 青色渐变、顶部内高光和接触阴影,`secondary` 靛蓝细描边压在淡底上,`ghost` 仅一道细线。聚焦落高对比青色环,按下时轻微收缩，无位置偏移(无回弹)。基于独立的 `--nv-scr-*` 工业蓝令牌。

## 示例

### 三种权重

主操作用 `primary`,次操作用 `secondary`,弱化项用 `ghost`。

<ScreenDemo>
  <NvScreenButton>保存安排</NvScreenButton>
  <NvScreenButton variant="secondary">暂停</NvScreenButton>
  <NvScreenButton variant="ghost">重置</NvScreenButton>
</ScreenDemo>

```vue
<NvScreenButton>保存安排</NvScreenButton>
<NvScreenButton variant="secondary">暂停</NvScreenButton>
<NvScreenButton variant="ghost">重置</NvScreenButton>
```

### 禁用态

`disabled` 时降低不透明度并禁止指针,三种权重一致。

<ScreenDemo>
  <NvScreenButton disabled>保存安排</NvScreenButton>
  <NvScreenButton variant="secondary" disabled>暂停</NvScreenButton>
  <NvScreenButton variant="ghost" disabled>重置</NvScreenButton>
</ScreenDemo>

```vue
<NvScreenButton disabled>保存安排</NvScreenButton>
```

## API

### NvScreenButton 属性

| 属性       | 说明                                  | 类型                                  | 默认        |
| ---------- | ------------------------------------- | ------------------------------------- | ----------- |
| `variant`  | 按钮权重                              | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` |
| `disabled` | 禁用                                  | `boolean`                             | `false`     |
| `type`     | 透传给原生 `<button>`,可提交/重置表单 | `'button' \| 'submit' \| 'reset'`     | `'button'`  |

### 插槽

| 插槽      | 说明                    |
| --------- | ----------------------- |
| `default` | 按钮文本,缺省为「确定」 |

## 设计说明

通过默认 slot 提供内容，使用原生 click 监听；Space / Enter 由浏览器生成一次 click。`disabled` 阻止原生激活，`type` 默认仍为 `'button'`。`size` 为 `'default' | 'sm'`，默认 `'default'`，紧凑尺寸适合密集工具栏。业务保存与计数留在宿主。
