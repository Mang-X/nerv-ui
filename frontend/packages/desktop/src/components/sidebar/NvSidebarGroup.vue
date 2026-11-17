<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Sidebar.styles'
import { useNvSidebarContext } from './sidebar-context'
import type { NvSidebarGroupProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvSidebarGroupProps>(), { label: undefined })

const context = useNvSidebarContext()
const collapsed = computed(() => context?.collapsed.value ?? false)

const groupSx = computed(() => stylex.props(styles.group))
const labelSx = computed(() => stylex.props(styles.groupLabel))
</script>

<template>
  <div
    v-bind="$attrs"
    :class="[groupSx.className, $attrs.class]"
    :style="[groupSx.style, $attrs.style]"
  >
    <div
      v-if="!collapsed && ($slots.label || label)"
      :class="labelSx.className"
      :style="labelSx.style"
    >
      <slot name="label">{{ label }}</slot>
    </div>
    <slot />
  </div>
</template>
