<script setup lang="ts">
import { MenuRadioGroup } from '@ui-sdk/vue/menu'
import type { NvDropdownMenuRadioGroupProps } from './types'

defineOptions({ inheritAttrs: false })

defineProps<NvDropdownMenuRadioGroupProps>()
</script>

<template>
  <MenuRadioGroup v-bind="$attrs" :value="value" :default-value="defaultValue">
    <slot />
  </MenuRadioGroup>
</template>
