<script setup lang="ts">
import { Menu } from '@ui-sdk/vue/menu'

// `v-model:open` 经 $attrs 透传：原语把挂上的 `onUpdate:*` 监听当作控制器，
// 不能替调用方补一个它没要的。
defineOptions({ inheritAttrs: false })
</script>

<template>
  <Menu v-bind="$attrs">
    <slot />
  </Menu>
</template>
