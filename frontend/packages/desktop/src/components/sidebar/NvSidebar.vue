<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, provide, ref } from 'vue'
import { styles } from './Sidebar.styles'
import { nvSidebarInjectionKey, type NvSidebarContext } from './sidebar-context'
import type { NvSidebarProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvSidebarProps>(), {
  // Explicit `undefined` keeps the prop uncontrolled when omitted; Vue's
  // Boolean casting would otherwise turn an absent optional boolean into false.
  collapsed: undefined,
  defaultCollapsed: false,
  collapsible: true,
  width: 240,
  collapsedWidth: 64,
  label: '侧边栏',
})

const emit = defineEmits<{
  'update:collapsed': [collapsed: boolean]
  collapsedChange: [collapsed: boolean]
}>()

const innerCollapsed = ref(props.defaultCollapsed)

const collapsed = computed(() => props.collapsible && (props.collapsed ?? innerCollapsed.value))
const collapsible = computed(() => props.collapsible)

function toggle() {
  const next = !collapsed.value
  if (props.collapsed === undefined) innerCollapsed.value = next
  emit('update:collapsed', next)
  emit('collapsedChange', next)
}

const context: NvSidebarContext = { collapsed, collapsible, toggle }
provide(nvSidebarInjectionKey, context)

const rootSx = computed(() => stylex.props(styles.root))
const widthStyle = computed(() => ({
  width: cssSize(collapsed.value ? props.collapsedWidth : props.width),
}))

function cssSize(value: string | number): string {
  // 纯数字字符串（例如模板里写 width="220"）也要补单位：`width: 220` 是非法
  // 声明会被整条丢弃，收起/展开看起来就像「点了没反应」。
  if (typeof value === 'number') return `${value}px`
  return /^\d+(\.\d+)?$/.test(value.trim()) ? `${value.trim()}px` : value
}
</script>

<template>
  <nav
    v-bind="$attrs"
    :aria-label="label"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, widthStyle, $attrs.style]"
  >
    <slot />
  </nav>
</template>
