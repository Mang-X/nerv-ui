<script setup lang="ts">
import { Select } from '@ui-sdk/vue/select'

// Model bindings (v-model:value / v-model:open) arrive through $attrs and are
// forwarded as-is: ui-sdk primitives treat an attached `onUpdate:*` listener as
// a controller, so we must not attach one the caller didn't ask for.
defineOptions({ inheritAttrs: false })
</script>

<template>
  <Select v-bind="$attrs">
    <slot />
  </Select>
</template>
