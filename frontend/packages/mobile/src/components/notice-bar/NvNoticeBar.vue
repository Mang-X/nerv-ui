<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed, type Component } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './NoticeBar.styles'
import type { NoticeBarVariant } from './types'

const props = withDefaults(
  defineProps<{
    text?: string
    variant?: NoticeBarVariant
    icon?: Component
    closable?: boolean
    closeLabel?: string
  }>(),
  {
    text: undefined,
    variant: 'info',
    icon: undefined,
    closable: false,
    closeLabel: '关闭',
  },
)

const emit = defineEmits<{ close: [] }>()

const stateSx = computed(() =>
  stylex.props(
    styles.root,
    props.variant === 'neutral' && styles.neutral,
    props.variant === 'danger' && styles.danger,
  ),
)
const iconSx = computed(() =>
  stylex.props(
    styles.icon,
    props.variant === 'neutral' && styles.iconNeutral,
    props.variant === 'danger' && styles.iconDanger,
  ),
)
const defaultIcon = computed(() => (props.variant === 'danger' ? 'alert' : 'info'))
</script>

<template>
  <div :class="stateSx.className" :style="stateSx.style" role="status" aria-live="polite">
    <span :class="iconSx.className">
      <slot name="icon">
        <component v-if="icon" :is="icon" aria-hidden="true" :size="18" />
        <NvIcon v-else :name="defaultIcon" :size="18" />
      </slot>
    </span>
    <span :class="stylex.props(styles.content).className">
      <slot>{{ text }}</slot>
    </span>
    <slot name="action" />
    <Button
      v-if="closable"
      type="button"
      :aria-label="closeLabel"
      :class="stylex.props(styles.close, focus.ring).className"
      @click="emit('close')"
    >
      <NvIcon name="close" :size="16" />
    </Button>
  </div>
</template>
