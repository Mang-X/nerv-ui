<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Fab.styles'
import type { MobileFabProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MobileFabProps>(), {
  icon: undefined,
  ariaLabel: undefined,
  label: undefined,
  position: 'bottom-right',
  size: 'lg',
  offset: 24,
  disabled: false,
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const sx = computed(() =>
  stylex.props(
    styles.base,
    styles[props.size],
    props.position !== 'static' && styles.floating,
    props.position === 'bottom-right' && styles.bottomRight,
    props.position === 'bottom-left' && styles.bottomLeft,
    props.position === 'bottom-center' && styles.bottomCenter,
    !props.label && styles.round,
    focus.ring,
  ),
)

const positionStyle = computed(() =>
  props.position === 'static' ? undefined : { bottom: `calc(${props.offset}px + env(safe-area-inset-bottom))` },
)
</script>

<template>
  <Button
    v-bind="$attrs"
    type="button"
    :aria-label="ariaLabel ?? label"
    :disabled="disabled"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, positionStyle, $attrs.style]"
    @click="emit('click', $event)"
  >
    <slot>
      <component :is="icon" v-if="icon" aria-hidden="true" :size="label ? 20 : 24" />
      <span v-if="label">{{ label }}</span>
    </slot>
  </Button>
</template>
