<script setup lang="ts">
import { Resizable, ResizableHandle, ResizablePanel } from '@ui-sdk/vue/resizable'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Resizable.styles'
import type { NvResizableProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvResizableProps>(), {
  orientation: 'horizontal',
  defaultSize: 30,
  minSize: 20,
  maxSize: undefined,
  collapsible: false,
  collapsedSize: undefined,
  step: undefined,
  largeStep: undefined,
  label: '调整面板大小',
})

const rootSx = computed(() => stylex.props(styles.root))
const panelSx = computed(() => stylex.props(styles.panel))
// 焦点环由样式内部用 `:focus-visible` 表达（不再组合 focus.ring，
// 那会把手柄自己的 background 过渡覆盖掉）。
const handleSx = computed(() =>
  stylex.props(
    styles.handle,
    props.orientation === 'vertical' && styles.handleVertical,
  ),
)
// 夹持手柄：两段短横条，让「可拖动」这件事一眼可见。
const gripSx = computed(() =>
  stylex.props(styles.grip, props.orientation === 'vertical' && styles.gripVertical),
)
const gripBarSx = computed(() =>
  stylex.props(styles.gripBar, props.orientation === 'vertical' && styles.gripBarVertical),
)
</script>

<template>
  <Resizable
    v-bind="omitClassStyle($attrs)"
    :orientation="orientation"
    :step="step"
    :large-step="largeStep"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <ResizablePanel
      :default-size="defaultSize"
      :min-size="minSize"
      :max-size="maxSize"
      :collapsible="collapsible"
      :collapsed-size="collapsedSize"
      :class="panelSx.className"
      :style="panelSx.style"
    >
      <slot name="start" />
    </ResizablePanel>
    <ResizableHandle :aria-label="label" :class="handleSx.className" :style="handleSx.style">
      <span :class="gripSx.className" :style="gripSx.style" aria-hidden="true">
        <span :class="gripBarSx.className" :style="gripBarSx.style" />
        <span :class="gripBarSx.className" :style="gripBarSx.style" />
      </span>
    </ResizableHandle>
    <ResizablePanel :class="panelSx.className" :style="panelSx.style">
      <slot name="end" />
    </ResizablePanel>
  </Resizable>
</template>
