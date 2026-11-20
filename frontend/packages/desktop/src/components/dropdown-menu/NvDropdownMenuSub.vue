<script setup lang="ts">
import { MenuSub } from '@ui-sdk/vue/menu'
defineOptions({ inheritAttrs: false })
</script>

<template>
  <MenuSub v-bind="$attrs">
    <slot />
  </MenuSub>
</template>
