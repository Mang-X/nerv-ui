<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Sidebar.styles'
import { useNvSidebarContext } from './sidebar-context'
import type { NvSidebarItemProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvSidebarItemProps>(), {
  active: false,
  disabled: false,
  href: undefined,
  label: undefined,
})

const context = useNvSidebarContext()
const collapsed = computed(() => context?.collapsed.value ?? false)
const showText = computed(() => !collapsed.value)

const itemSx = computed(() =>
  stylex.props(styles.item, focus.subtle, collapsed.value && styles.itemCollapsed),
)
const iconSx = computed(() => stylex.props(styles.itemIcon))
const labelSx = computed(() => stylex.props(styles.itemLabel))

// A collapsed rail hides the text, so keep the accessible name reachable.
const accessibleLabel = computed(() => (props.label && collapsed.value ? props.label : undefined))
</script>

<template>
  <a
    v-if="href && !disabled"
    v-bind="omitClassStyle($attrs)"
    :href="href"
    :aria-current="active ? 'page' : undefined"
    :aria-label="accessibleLabel"
    :title="accessibleLabel"
    :data-active="active || undefined"
    :class="[itemSx.className, $attrs.class]"
    :style="[itemSx.style, $attrs.style]"
  >
    <span v-if="$slots.icon" :class="iconSx.className" :style="iconSx.style">
      <slot name="icon" />
    </span>
    <span v-if="showText" :class="[labelSx.className]" :style="labelSx.style">
      <slot>{{ label }}</slot>
    </span>
  </a>
  <button
    v-else
    v-bind="omitClassStyle($attrs)"
    type="button"
    :disabled="disabled"
    :aria-current="active ? 'page' : undefined"
    :aria-label="accessibleLabel"
    :title="accessibleLabel"
    :data-active="active || undefined"
    :data-disabled="disabled || undefined"
    :class="[itemSx.className, $attrs.class]"
    :style="[itemSx.style, $attrs.style]"
  >
    <span v-if="$slots.icon" :class="iconSx.className" :style="iconSx.style">
      <slot name="icon" />
    </span>
    <span v-if="showText" :class="labelSx.className" :style="labelSx.style">
      <slot>{{ label }}</slot>
    </span>
  </button>
</template>
