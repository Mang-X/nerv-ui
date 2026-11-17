<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './ScreenToolbar.styles'
import type { ScreenToolbarProps } from './types'

const props = withDefaults(defineProps<ScreenToolbarProps>(), {
  ariaLabel: '工具栏',
  disabled: false,
  overflow: 'wrap',
})

const rootSx = computed(() =>
  stylex.props(
    styles.root,
    props.overflow === 'scroll' ? styles.scroll : styles.wrap,
    props.disabled && styles.disabled,
  ),
)

const groupSx = computed(() => stylex.props(styles.group))
const spacerSx = computed(() => stylex.props(styles.spacer))
const separatorSx = computed(() => stylex.props(styles.separator))
</script>

<template>
  <div
    role="toolbar"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || undefined"
    :inert="disabled || undefined"
    :class="rootSx.className"
    :style="rootSx.style"
  >
    <div :class="groupSx.className" :style="groupSx.style">
      <slot />
    </div>
    <span :class="spacerSx.className" :style="spacerSx.style" aria-hidden="true" />
    <template v-if="$slots.end">
      <span :class="separatorSx.className" :style="separatorSx.style" aria-hidden="true" />
      <div :class="groupSx.className" :style="groupSx.style">
        <slot name="end" />
      </div>
    </template>
  </div>
</template>
