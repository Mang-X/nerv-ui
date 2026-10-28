---
title: 空间登录与修改密码
---

<script setup lang="ts">
import LoginDemo from '../../../../playground/src/login/LoginDemo.vue'
</script>

# 空间登录与修改密码

<Demo><LoginDemo /></Demo>

<!--@include: ../../../../../DESIGN/components/login-recipe.md-->

## 宿主合同

`LoginRecipe.vue` 是可复制组合示例，不是库主桶导出。props 为 `modelValue: LoginDraft`、`surface: LoginSurface`、`mode: LoginMode`、`context: string`、`brand: string`，可选 `submit: SubmitLogin`、`readonly`、`disabled`、`logoutNotice: 'failed' | 'timed-out' | ''`。类型定义在同目录 `contract.ts`。

事件为 `update:modelValue`（完整草稿）、`confirmed`（无 payload）、`cancel`（无 payload）。hint slot 放安全说明。真实认证、redirect、强制改密与校验均由宿主提供。本页只展示显式确认，不建立会话或保存密码。
