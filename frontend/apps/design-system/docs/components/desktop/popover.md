---
title: Popover 结构与焦点
---

<script setup>
import PopoverExample from '../../.vitepress/examples/PopoverExample.vue'
</script>

# Popover 结构与焦点

打开阅读提示，读完后关闭，再次打开。反馈只记录本页动作，刷新后重新开始，不执行服务端保存。

<Demo>
  <PopoverExample />
</Demo>

## 公开组合与焦点

`Popover`、`PopoverTrigger`、`PopoverContent`、`PopoverHeader`、`PopoverTitle`、`PopoverDescription` 均从 `@nerv-iip/ui` 主桶导入。后三件提供标题区、标题和描述的结构样式；当前 Reka 将内容的可访问名称关联到原触发入口；结构标题与描述作为内容中的可读文字，不替换该默认关联。

内容通过既有 portal 呈现。宿主在 portal 内容挂 `vp-raw`，以视口最大宽度和碰撞留白约束边缘，不修改基础组件或叠层机制。`Popover` 的受控打开状态只由本页持有。

可用鼠标打开，也可 Tab 到“查看阅读提示”并按 Enter 打开。按“读完提示”会关闭并更新本页反馈；再次打开后可按 Esc 关闭。自动聚焦和关闭后返回原触发入口沿用现有 Reka 合同，不拦截其默认焦点事件。单元中的模拟键盘事件不能替代真实浏览器键盘验收。

## 学习代码

<<< @/.vitepress/examples/PopoverExample.vue
