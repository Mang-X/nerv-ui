<script setup lang="ts">
import { MenuGroup } from '@ui-sdk/vue/menu'
defineOptions({ inheritAttrs: false })
</script>

<template>
  <MenuGroup v-bind="$attrs">
    <slot />
  </MenuGroup>
</template>
