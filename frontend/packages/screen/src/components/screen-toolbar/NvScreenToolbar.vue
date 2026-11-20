<script setup lang="ts">
import { Toolbar, ToolbarGroup } from '@ui-sdk/vue/toolbar'
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
  <!-- role / 方向键在组内移动由 ui-sdk Toolbar 提供，不再自己写 role="toolbar" -->
  <Toolbar
    :aria-label="ariaLabel"
    :disabled="disabled"
    :class="rootSx.className"
    :style="rootSx.style"
  >
    <ToolbarGroup :class="groupSx.className" :style="groupSx.style">
      <slot />
    </ToolbarGroup>
    <span :class="spacerSx.className" :style="spacerSx.style" aria-hidden="true" />
    <template v-if="$slots.end">
      <span :class="separatorSx.className" :style="separatorSx.style" aria-hidden="true" />
      <ToolbarGroup :class="groupSx.className" :style="groupSx.style">
        <slot name="end" />
      </ToolbarGroup>
    </template>
  </Toolbar>
</template>
