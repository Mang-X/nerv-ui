<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, provide } from 'vue'
import { styles } from './Descriptions.styles'
import { nvDescriptionsInjectionKey, type NvDescriptionsContext } from './descriptions-context'
import type { NvDescriptionsProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvDescriptionsProps>(), {
  columns: 3,
  layout: 'horizontal',
  bordered: false,
  labelWidth: 88,
})

const context: NvDescriptionsContext = {
  layout: computed(() => props.layout),
  bordered: computed(() => props.bordered),
  columns: computed(() => Math.max(1, Math.floor(props.columns))),
  labelWidth: computed(() => props.labelWidth),
}
provide(nvDescriptionsInjectionKey, context)

const sx = computed(() => stylex.props(styles.root, props.bordered ? styles.bordered : styles.gap))
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${context.columns.value}, minmax(0, 1fr))`,
}))
</script>

<template>
  <dl
    v-bind="$attrs"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, gridStyle, $attrs.style]"
  >
    <slot />
  </dl>
</template>
