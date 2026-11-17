---
title: NvTouchButton 触控按钮
---

<script setup>
import { NvTouchButton } from '@nerv-iip/ui'
import { CheckCircleIcon, PauseIcon, BellRingIcon } from '@lucide/vue'
</script>

# NvTouchButton 触控按钮

Pad 大触控按钮：**≥56px** 触控目标、动作语义色、按下整体缩放 0.97 的强反馈。区别于 PC 紧凑的 NvButton 与移动贴近原生的 NvMobileButton——它为"戴手套也点得准、一眼看到该点哪"而放大。

## 示例

### 变体

按动作语义选色：`brand` 完成、`success` 提交、`warning` 暂停、`destructive` 危险、`outline` / `ghost` 次级。

<Demo>
  <NvTouchButton variant="success"><template #leading><CheckCircleIcon aria-hidden="true" /></template>提交</NvTouchButton>
  <NvTouchButton variant="brand">完成</NvTouchButton>
  <NvTouchButton variant="warning"><template #leading><PauseIcon aria-hidden="true" /></template>暂停</NvTouchButton>
  <NvTouchButton variant="outline"><template #leading><BellRingIcon aria-hidden="true" /></template>呼叫</NvTouchButton>
  <NvTouchButton variant="ghost">复位</NvTouchButton>
</Demo>

```vue
<NvTouchButton variant="success">
  <template #leading><CheckCircleIcon /></template>
  提交
</NvTouchButton>
<NvTouchButton variant="warning">暂停</NvTouchButton>
```

### 尺寸

`md` 44px、`lg` 56px（默认）、`xl` 72px——Pad 主操作用 `xl`，副操作用 `lg`。加 `block` 占满整行。

<Demo>
  <NvTouchButton size="md">md · 44px</NvTouchButton>
  <NvTouchButton size="lg">lg · 56px</NvTouchButton>
  <NvTouchButton size="xl">xl · 72px</NvTouchButton>
</Demo>

<Demo block>
  <NvTouchButton variant="success" size="xl" block>整宽提交</NvTouchButton>
</Demo>

### 加载态

`loading` 时显示环形加载器并设置 `aria-busy` / `aria-disabled`；默认原生按钮同时禁用，阻止键盘重复激活。`as="a"` 的加载/禁用态阻止链接激活。显式 `disabled` 在加载结束后仍保留。

<Demo>
  <NvTouchButton variant="brand" size="lg" loading>提交中</NvTouchButton>
  <NvTouchButton size="lg" disabled>禁用</NvTouchButton>
  <NvTouchButton as-child loading><a href="#touch-actions">阅读记录</a></NvTouchButton>
</Demo>

`asChild` 接受一个真实交互子元素或透传 attrs/slots 的组件；加载状态传到该宿主，环形加载器位于宿主内部，并替代 `leading` 内容。加载结束恢复 `leading`，保留子元素内容、href 和事件；显式禁用继续生效。组件层 DOM 回归见 [#43](https://github.com/Mang-X/nerv-ui/issues/43)，2026-10-28 已完成 Chromium 真实 Tab / Enter / Space 的加载拦截、显式禁用保留与恢复验证（anchor、button、函数组件数组内容）。外部最小消费夹具缺少 Tailwind 转换，完整加载器视觉与触控尺寸未验证，不能由键盘结果推定。

## API

### NvTouchButton 属性

| 属性       | 说明         | 类型                                                                        | 默认      |
| ---------- | ------------ | --------------------------------------------------------------------------- | --------- |
| `variant`  | 动作语义变体 | `brand \| default \| success \| warning \| destructive \| outline \| ghost` | `default` |
| `size`     | 触控尺寸     | `md \| lg \| xl`                                                            | `lg`      |
| `block`    | 是否整宽     | `boolean`                                                                   | `false`   |
| `loading`  | 加载态       | `boolean`                                                                   | `false`   |
| `disabled` | 禁用         | `boolean`                                                                   | `false`   |

### 插槽

| 插槽      | 说明         |
| --------- | ------------ |
| `leading` | 文本前的图标 |
| `default` | 按钮文本     |
