<script setup lang="ts">
import { Popover } from '@ui-sdk/vue/popover'
import type { NvPopoverProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvPopoverProps>(), { open: undefined,
  defaultOpen: false,
  modal: false,
  openOnHover: false,
  // 默认不抢焦点：气泡卡片常承载按钮/表单，自动聚焦会让首个按钮一打开就亮聚焦环。
  initialFocus: 'none',
})

</script>

<template>
  <Popover
    v-bind="$attrs"
    :open="open"
    :default-open="defaultOpen"
    :modal="modal"
    :open-on-hover="openOnHover"
    :delay="delay"
    :close-delay="closeDelay"
    :initial-focus="initialFocus"
  >
    <slot />
  </Popover>
</template>
