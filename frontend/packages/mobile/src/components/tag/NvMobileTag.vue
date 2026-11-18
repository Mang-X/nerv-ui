<script setup lang="ts">
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './MobileTag.styles'
import type { MobileTagSize, MobileTagVariant } from './types'

const props = withDefaults(
  defineProps<{
    variant?: MobileTagVariant
    size?: MobileTagSize
    round?: boolean
    closable?: boolean
    closeLabel?: string
  }>(),
  {
    variant: 'neutral',
    size: 'sm',
    round: false,
    closable: false,
    closeLabel: '移除标签',
  },
)

const emit = defineEmits<{ close: [] }>()

const sx = computed(() =>
  stylex.props(
    styles.root,
    props.variant === 'brand' && styles.brand,
    props.variant === 'danger' && styles.danger,
    props.variant === 'outline' && styles.outline,
    props.size === 'md' && styles.md,
    props.round && styles.round,
  ),
)
</script>

<template>
  <span :class="sx.className" :style="sx.style">
    <slot />
    <button
      v-if="closable"
      type="button"
      :aria-label="closeLabel"
      :class="stylex.props(styles.close, focus.ring).className"
      @click.stop="emit('close')"
    >
      <slot name="close-icon">
        <NvIcon name="close" :size="14" />
      </slot>
    </button>
  </span>
</template>
