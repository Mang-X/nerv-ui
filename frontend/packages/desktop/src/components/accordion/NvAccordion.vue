<script setup lang="ts">
import { Accordion } from '@ui-sdk/vue/accordion'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Accordion.styles'
import type { NvAccordionProps } from './types'

// v-model:value arrives through $attrs (value prop + `onUpdate:value` listener)
// and must be forwarded untouched: ui-sdk treats an attached `onUpdate:*`
// listener as a controller, so the wrapper must never attach one itself.
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvAccordionProps>(), {
  multiple: false,
  collapsible: true,
  disabled: false,
  keepMounted: false,
  hiddenUntilFound: false,
})

const sx = computed(() => stylex.props(styles.root))
</script>

<template>
  <Accordion
    v-bind="$attrs"
    :value="value"
    :default-value="defaultValue"
    :multiple="multiple"
    :collapsible="collapsible"
    :disabled="disabled"
    :keep-mounted="keepMounted"
    :hidden-until-found="hiddenUntilFound"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <slot />
  </Accordion>
</template>
