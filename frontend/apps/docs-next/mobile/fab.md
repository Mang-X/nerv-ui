---
title: NvFab 悬浮操作按钮
---

<script setup>
import { ref } from 'vue'
import { NvFab } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'

const clicks = ref(0)
</script>

# NvFab 悬浮操作按钮

移动端的悬浮主操作入口，默认可固定在视口右下角，示例中改为静态排布以免遮挡页面。

## 示例

<Demo>
  <NvFab position="static" aria-label="新建记录" @click="clicks++">
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M12 5v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  </NvFab>
  <span style="font-size: 13px">已点击 <span v-text="clicks"></span> 次</span>
</Demo>

<Demo>
  <NvFab position="static" size="md" label="批量提交" aria-label="批量提交" @click="clicks++" />
  <NvFab position="static" disabled label="不可用" aria-label="不可用" />
</Demo>

<Demo block>
  <p style="margin: 0 0 8px; font-size: 13px; opacity: 0.8">
    `position` 默认为 `bottom-right`，在真实移动页面中会固定到视口右下角并抬升 `offset` 像素。
  </p>
</Demo>

## API

### NvFab 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `icon` | 图标组件；无标签时单独显示 | `Component` | — |
| `ariaLabel` | 无障碍名称；无 `label` 时使用 | `string` | — |
| `label` | 可见文字标签 | `string` | — |
| `position` | 定位方式 | `bottom-right \| bottom-center \| bottom-left \| static` | `bottom-right` |
| `size` | 尺寸，`lg` 为 56px 圆钮 | `md \| lg` | `lg` |
| `offset` | 距底部边缘的距离（px），已叠加安全区 | `number` | `24` |
| `disabled` | 禁用 | `boolean` | `false` |

### NvFab 事件

| 事件 | 说明 |
| --- | --- |
| `click` | 点击按钮，参数为原生 `MouseEvent` |

### NvFab 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 自定义按钮内容；提供后覆盖 `icon` 与 `label` |
