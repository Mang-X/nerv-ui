<script setup lang="ts">
import { Resizable, ResizableHandle, ResizablePanel } from '@ui-sdk/vue/resizable'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { focus } from '../../theme/shared.stylex'
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
const handleSx = computed(() =>
  stylex.props(
    styles.handle,
    focus.ring,
    props.orientation === 'vertical' && styles.handleVertical,
  ),
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
    <ResizableHandle :aria-label="label" :class="handleSx.className" :style="handleSx.style" />
    <ResizablePanel :class="panelSx.className" :style="panelSx.style">
      <slot name="end" />
    </ResizablePanel>
  </Resizable>
</template>
