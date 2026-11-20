<script setup lang="ts">
import { MenuTrigger } from '@ui-sdk/vue/menu'
import type { NvDropdownMenuTriggerProps } from './types'

// 触发器不自带外观：调用方把 NvButton 之类放进来即可，
// 与 shadcn 的 `DropdownMenuTrigger asChild` 同义。
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvDropdownMenuTriggerProps>(), { disabled: false })
</script>

<template>
  <MenuTrigger v-bind="$attrs" :disabled="disabled">
    <slot />
  </MenuTrigger>
</template>
