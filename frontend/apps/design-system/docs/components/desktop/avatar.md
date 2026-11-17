---
title: Avatar 图像与回退
---

<script setup>
import AvatarExample from '../../.vitepress/examples/AvatarExample.vue'
</script>

# Avatar 图像与回退

切换本地有效图片、无法加载的图片和无图片，再切回有效图片查看恢复。示例只使用本页状态与仓内素材，不连接账号或远程头像服务。

## 示例

<Demo>
  <AvatarExample />
</Demo>

<<< @/.vitepress/examples/AvatarExample.vue

## 设计说明

`Avatar`、`AvatarImage`、`AvatarFallback` 均从 `@nerv-iip/ui` 主桶导入。`Avatar` 提供加载状态上下文；`AvatarImage` 接受 `src` 和图片替代说明；`AvatarFallback` 在图片未成功加载时提供文字回退。切换来源时重新建立组合，也保证无图片时使用新的回退上下文。

当前 Reka 通过独立的 `Image` 预加载器判断加载成功或失败，成功后才显示图片。图片失败与未提供图片时，文字「阅友」和旁边的阅读伙伴说明仍可读取。三个图片来源按钮可通过 Tab 聚焦、Enter 或空格切换；按下状态表示当前来源。素材复用仓内 playground 的中性 `media/portrait.svg`；坏 src 故意指向不存在的本地资源。
