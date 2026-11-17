<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Descriptions.styles'
import { useNvDescriptionsContext } from './descriptions-context'
import type { NvDescriptionsItemProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvDescriptionsItemProps>(), {
  value: undefined,
  span: 1,
})

const context = useNvDescriptionsContext()
const vertical = computed(() => context?.layout.value === 'vertical')
const bordered = computed(() => context?.bordered.value ?? false)

const sx = computed(() =>
  stylex.props(
    styles.item,
    vertical.value && styles.itemVertical,
    bordered.value && styles.itemBordered,
  ),
)
const labelSx = computed(() => stylex.props(styles.label))
const valueSx = computed(() => stylex.props(styles.value))

const spanStyle = computed(() => {
  const columns = context?.columns.value ?? props.span
  const span = Math.min(Math.max(1, Math.floor(props.span)), columns)
  return span > 1 ? { gridColumn: `span ${span}` } : undefined
})

const labelWidthStyle = computed(() => {
  if (vertical.value) return undefined
  const width = context?.labelWidth.value ?? 88
  return { flexBasis: typeof width === 'number' ? `${width}px` : width }
})
</script>

<template>
  <div
    v-bind="omitClassStyle($attrs)"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, spanStyle, $attrs.style]"
  >
    <dt :class="labelSx.className" :style="[labelSx.style, labelWidthStyle]">{{ label }}</dt>
    <dd :class="valueSx.className" :style="valueSx.style">
      <slot>{{ value }}</slot>
    </dd>
  </div>
</template>
