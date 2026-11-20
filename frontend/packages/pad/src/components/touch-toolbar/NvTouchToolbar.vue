<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import * as stylex from '@stylexjs/stylex'
import { computed, useAttrs } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './TouchToolbar.styles'
import type { TouchToolbarItem, TouchToolbarProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TouchToolbarProps>(), {
  disabled: false,
  position: 'static',
  elevated: false,
  ariaLabel: '工具条',
})

const emit = defineEmits<{ action: [item: TouchToolbarItem] }>()

const attrs = useAttrs()
const forwardedAttrs = computed(() => omitClassStyle(attrs))

function pick(item: TouchToolbarItem) {
  if (props.disabled || item.disabled) return
  emit('action', item)
}

const rootSx = computed(() =>
  stylex.props(
    styles.root,
    props.position === 'fixed' && styles.fixed,
    props.elevated && styles.elevated,
  ),
)
const itemSx = computed(() => stylex.props(styles.item, focus.ring))
const activeItemSx = computed(() => stylex.props(styles.item, styles.active, focus.ring))
const iconSx = computed(() => stylex.props(styles.icon))
const labelSx = computed(() => stylex.props(styles.label))
</script>

<template>
  <nav
    v-bind="forwardedAttrs"
    :aria-label="ariaLabel"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <Button
      v-for="item in items"
      :key="item.value"
      type="button"
      :disabled="disabled || item.disabled"
      :aria-current="item.active ? 'true' : undefined"
      :class="[item.active ? activeItemSx.className : itemSx.className]"
      :style="item.active ? activeItemSx.style : itemSx.style"
      @click="pick(item)"
    >
      <span v-if="$slots.icon" :class="iconSx.className" :style="iconSx.style">
        <slot name="icon" :item="item" />
      </span>
      <span :class="labelSx.className" :style="labelSx.style">{{ item.label }}</span>
    </Button>
    <slot />
  </nav>
</template>
