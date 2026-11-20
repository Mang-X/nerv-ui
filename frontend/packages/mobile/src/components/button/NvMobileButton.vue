<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './MobileButton.styles'
import type { MobileButtonSize, MobileButtonVariant } from './types'

const props = withDefaults(
  defineProps<{
    variant?: MobileButtonVariant
    size?: MobileButtonSize
    block?: boolean
    disabled?: boolean
    loading?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    block: false,
    disabled: false,
    loading: false,
    type: 'button',
  },
)

const sx = computed(() =>
  stylex.props(
    styles.base,
    focus.ring,
    styles[props.variant],
    styles[props.size],
    props.block && styles.block,
  ),
)
</script>

<template>
  <Button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :class="sx.className"
    :style="sx.style"
  >
    <NvIcon name="loader-circle" v-if="loading" :size="18" :class="stylex.props(styles.loadingIcon).className" />
    <slot v-else name="icon" />
    <span :class="stylex.props(styles.content).className"><slot /></span>
  </Button>
</template>
