---
title: 空间登录与修改密码
---

<script setup lang="ts">
import { ref } from 'vue'
import { NvButton } from '@nerv-iip/ui'
import LoginDemo from '../../../../playground/src/login/LoginDemo.vue'
const space = ref<'library' | 'studio'>('library')
</script>

# 空间登录与修改密码

## 示例

<Demo>
  <LoginDemo :space="space">
    <template #navigation>
      <NvButton variant="ghost" :aria-pressed="space === 'library'" @click="space = 'library'">晨光书房</NvButton>
      <NvButton variant="ghost" :aria-pressed="space === 'studio'" @click="space = 'studio'">周末画室</NvButton>
      <a href="/">返回文档首页</a>
    </template>
  </LoginDemo>
</Demo>

<!--@include: ../../../../../DESIGN/components/login-recipe.md-->

## API

文档通过 `LoginDemo` 的 `navigation` 插槽提供本页空间切换与返回文档首页的链接，`space` 由本页受控传入。playground 不传插槽时仍使用原来的 hash 导航；空间变化继续使旧确认失效。

`LoginRecipe.vue` 是可复制组合示例，不是库主桶导出。props 为 `modelValue: LoginDraft`、`surface: LoginSurface`、`mode: LoginMode`、`context: string`、`brand: string`，可选 `submit: SubmitLogin`、`readonly`、`disabled`、`logoutNotice: 'failed' | 'timed-out' | ''`。类型定义在同目录 `contract.ts`。

事件为 `update:modelValue`（完整草稿）、`confirmed`（无 payload）、`cancel`（无 payload）。hint slot 放安全说明。真实认证、redirect、强制改密与校验均由宿主提供。本页只展示显式确认，不建立会话或保存密码。
