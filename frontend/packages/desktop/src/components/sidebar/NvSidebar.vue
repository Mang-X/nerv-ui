<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, provide, ref } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { nvSidebarInjectionKey, type NvSidebarContext } from './sidebar-context'
import { SidebarRoot } from './sidebar-parts'
import { styles } from './Sidebar.styles'
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

// 非受控模式下的本地副本；受控时以 prop 为准。收起态归原语所有，这里只是
// 它的输入之一——宽度要在外面算，所以必须能同步读到。
const innerCollapsed = ref(props.defaultCollapsed)

const collapsed = computed(() => props.collapsible && (props.collapsed ?? innerCollapsed.value))
const collapsible = computed(() => props.collapsible)

// 收起态由原语写进 `data-collapsed` / `aria-expanded`；子树按同一份状态排版。
const context: NvSidebarContext = { collapsed, collapsible }
provide(nvSidebarInjectionKey, context)

function onCollapsedChange(next: boolean) {
  if (props.collapsed === undefined) innerCollapsed.value = next
  emit('update:collapsed', next)
  emit('collapsedChange', next)
}

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
  <SidebarRoot
    v-bind="omitClassStyle($attrs)"
    :collapsed="collapsed"
    :collapsible="collapsible"
    :aria-label="label"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, widthStyle, $attrs.style]"
    @collapsed-change="onCollapsedChange"
  >
    <slot />
  </SidebarRoot>
</template>
