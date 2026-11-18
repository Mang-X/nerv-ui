<script setup lang="ts">
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '@ui-sdk/vue/collapsible'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Collapse.styles'
import type { MobileCollapseProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MobileCollapseProps>(), {
  // Undefined, not false: an explicit false would make the ui-sdk collapsible
  // permanently controlled and the trigger could never open it.
  open: undefined,
  defaultOpen: false,
  title: undefined,
  description: undefined,
  disabled: false,
  keepMounted: false,
  icon: undefined,
  ariaLabel: undefined,
})

const emit = defineEmits<{
  'update:open': [open: boolean]
  'open-change': [open: boolean]
}>()

const triggerSx = computed(() => stylex.props(styles.trigger, focus.subtle))
const panelSx = computed(() => stylex.props(styles.panel))

function onOpenChange(open: boolean) {
  emit('update:open', open)
  emit('open-change', open)
}
</script>

<template>
  <Collapsible
    v-slot="{ state }"
    v-bind="$attrs"
    :open="open"
    :default-open="defaultOpen"
    :disabled="disabled"
    :class="[stylex.props(styles.root).className, $attrs.class]"
    :style="[stylex.props(styles.root).style, $attrs.style]"
    @open-change="onOpenChange"
  >
    <CollapsibleTrigger
      :aria-label="ariaLabel ?? title"
      :class="triggerSx.className"
      :style="triggerSx.style"
    >
      <span v-if="icon || $slots.icon" :class="stylex.props(styles.icon).className">
        <slot name="icon">
          <component :is="icon" aria-hidden="true" :size="20" />
        </slot>
      </span>
      <span :class="stylex.props(styles.body).className">
        <span v-if="title || $slots.title" :class="stylex.props(styles.title).className">
          <slot name="title">{{ title }}</slot>
        </span>
        <span v-if="description || $slots.description" :class="stylex.props(styles.description).className">
          <slot name="description">{{ description }}</slot>
        </span>
      </span>
      <slot name="extra" />
      <span
        :class="stylex.props(styles.chevron, state.open && styles.chevronOpen).className"
        aria-hidden="true"
      >
        <NvIcon name="chevron-down" :size="20" />
      </span>
    </CollapsibleTrigger>
    <CollapsiblePanel
      :keep-mounted="keepMounted"
      :hidden-until-found="keepMounted"
      :class="panelSx.className"
      :style="panelSx.style"
    >
      <div :class="stylex.props(styles.panelInner).className">
        <slot />
      </div>
    </CollapsiblePanel>
  </Collapsible>
</template>
