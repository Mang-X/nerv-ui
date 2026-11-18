<script setup lang="ts">
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Sidebar.styles'
import { useNvSidebarContext } from './sidebar-context'

defineOptions({ inheritAttrs: false })

const context = useNvSidebarContext()
const collapsed = computed(() => context?.collapsed.value ?? false)
const collapsible = computed(() => context?.collapsible.value ?? false)

const headerSx = computed(() =>
  stylex.props(styles.header, collapsed.value && styles.headerCollapsed),
)
const contentSx = computed(() => stylex.props(styles.headerContent))
const toggleSx = computed(() => stylex.props(styles.toggle, focus.ring))

function toggleIconSx(isCollapsed: boolean) {
  return stylex.props(styles.toggleIcon, isCollapsed && styles.toggleIconCollapsed)
}
</script>

<template>
  <div
    v-bind="$attrs"
    :class="[headerSx.className, $attrs.class]"
    :style="[headerSx.style, $attrs.style]"
  >
    <div v-if="!collapsed" :class="contentSx.className" :style="contentSx.style">
      <slot />
    </div>
    <button
      v-if="collapsible"
      type="button"
      :aria-label="collapsed ? '展开侧栏' : '收起侧栏'"
      :class="toggleSx.className"
      :style="toggleSx.style"
      @click="context?.toggle()"
    >
      <slot name="toggle">
        <NvIcon name="collapse-left-panel"
          :size="16"
          :class="toggleIconSx(collapsed).className"
          :style="toggleIconSx(collapsed).style"
        />
      </slot>
    </button>
  </div>
</template>
