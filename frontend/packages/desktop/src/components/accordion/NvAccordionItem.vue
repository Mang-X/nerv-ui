<script setup lang="ts">
import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from '@ui-sdk/vue/accordion'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Accordion.styles'
import type { NvAccordionItemProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvAccordionItemProps>(), {
  disabled: false,
  keepMounted: false,
  title: undefined,
})

const itemSx = computed(() => stylex.props(styles.item))
const headerSx = computed(() => stylex.props(styles.header))
const triggerSx = computed(() => stylex.props(styles.trigger))
const titleSx = computed(() => stylex.props(styles.title))
const panelSx = computed(() => stylex.props(styles.panel))
const panelInnerSx = computed(() => stylex.props(styles.panelInner))

function chevronSx(open: boolean) {
  return stylex.props(styles.chevron, open && styles.chevronOpen)
}
</script>

<template>
  <AccordionItem
    v-bind="omitClassStyle($attrs)"
    :value="value"
    :disabled="disabled"
    :class="[itemSx.className, $attrs.class]"
    :style="[itemSx.style, $attrs.style]"
  >
    <AccordionHeader :class="headerSx.className" :style="headerSx.style">
      <AccordionTrigger v-slot="{ state }" :class="triggerSx.className" :style="triggerSx.style">
        <span :class="titleSx.className" :style="titleSx.style">
          <slot name="trigger">{{ title }}</slot>
        </span>
        <NvIcon name="chevron-down"
          :size="16"
          :class="chevronSx(state.open).className"
          :style="chevronSx(state.open).style"
        />
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionPanel :keep-mounted="keepMounted" :class="panelSx.className" :style="panelSx.style">
      <div :class="panelInnerSx.className" :style="panelInnerSx.style">
        <slot />
      </div>
    </AccordionPanel>
  </AccordionItem>
</template>
