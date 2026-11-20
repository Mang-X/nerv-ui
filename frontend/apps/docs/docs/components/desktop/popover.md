---
title: Popover 结构与焦点
---

<script setup>
import PopoverExample from '../../.vitepress/examples/PopoverExample.vue'
</script>

# Popover 结构与焦点

打开阅读提示，读完后关闭，再次打开。反馈只记录本页动作，刷新后重新开始，不执行服务端保存。

## 示例

<Demo>
  <PopoverExample />
</Demo>

<<< @/.vitepress/examples/PopoverExample.vue

## 设计说明

`Popover`、`PopoverTrigger`、`PopoverContent`、`PopoverHeader`、`PopoverTitle`、`PopoverDescription` 均从 `@nerv-ui/ui` 主桶导入。后三件提供标题区、标题和描述的结构样式；当前 Reka 将内容的可访问名称关联到原触发入口；结构标题与描述作为内容中的可读文字，不替换该默认关联。

内容通过既有 portal 呈现。宿主在 portal 内容挂 `vp-raw`，以视口最大宽度和碰撞留白约束边缘，不修改基础组件或叠层机制。`Popover` 的受控打开状态只由本页持有。

可用鼠标打开，也可 Tab 到「查看阅读提示」并按 Enter 打开。按「读完提示」会关闭并更新本页反馈；再次打开后可按 Esc 关闭。自动聚焦和关闭后返回原触发入口沿用现有 Reka 合同，不拦截其默认焦点事件。

## API

### Popover 家族

| 组件                 | 说明                                       |
| -------------------- | ------------------------------------------ |
| `Popover`            | 根容器；转发 Reka `PopoverRoot` 属性与事件 |
| `PopoverTrigger`     | 触发器；常用 `as-child` 包裹自定义按钮     |
| `PopoverAnchor`      | 自定义锚点位置                             |
| `PopoverContent`     | 浮层内容（经 Portal 渲染）                 |
| `PopoverHeader`      | 头部区块                                   |
| `PopoverTitle`       | 标题                                       |
| `PopoverDescription` | 描述                                       |

### 属性

`Popover` 接受 Reka `PopoverRootProps`：

| 属性                    | 说明                       | 类型                        | 默认    |
| ----------------------- | -------------------------- | --------------------------- | ------- |
| `open` / `defaultOpen`  | 受控 / 非受控开关          | `boolean`                   | `false` |
| `modal`                 | 是否模态（锁定外层交互）   | `boolean`                   | `false` |
| `disableOutsidePointerEvents` | 关闭层外指针事件       | `boolean`                   | `false` |

`PopoverContent` 接受 Reka `PopoverContentProps`（`side`、`sideOffset`、`align`、`alignOffset`、`avoidCollisions`、`collisionBoundary`、`collisionPadding` 等）并附加本组件 `class`：

| 属性         | 说明               | 类型                                  | 默认     |
| ------------ | ------------------ | ------------------------------------- | -------- |
| `side`       | 优先弹出方向       | `'top' \| 'right' \| 'bottom' \| 'left'` | —        |
| `sideOffset` | 与锚点的距离（px） | `number`                              | `4`      |
| `align`      | 对齐方式           | `'start' \| 'center' \| 'end'`        | `center` |
| `class`      | 追加 Tailwind 类   | `HTMLAttributes['class']`             | —        |

### 事件

| 事件                | 所属              | 说明                                     |
| ------------------- | ----------------- | ---------------------------------------- |
| `update:open`       | `Popover`         | 开关状态变化（配合 `v-model:open`）      |
| `openAutoFocus`     | `PopoverContent`  | 打开后自动聚焦（`.prevent` 可拦截）      |
| `closeAutoFocus`    | `PopoverContent`  | 关闭后焦点回触发器（`.prevent` 可拦截）  |
| `escapeKeyDown`     | `PopoverContent`  | 按 Esc 触发                              |
| `pointerDownOutside` | `PopoverContent` | 点击层外触发                             |
| `interactOutside`   | `PopoverContent`  | 任意层外交互                             |

### 插槽

| 插槽      | 所属             | 说明                                     |
| --------- | ---------------- | ---------------------------------------- |
| `default` | `Popover`        | 整组内容（含触发器与内容），暴露 `open`  |
| `default` | `PopoverContent` | 浮层主体                                 |
