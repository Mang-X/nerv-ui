<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './ScreenHeader.styles'
import type { HeaderStatusTone } from './types'

const props = withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    time?: string
    statusLabel?: string
    statusTone?: HeaderStatusTone
    showMark?: boolean
  }>(),
  { statusTone: 'default', showMark: true },
)

const textStyles = {
  default: styles.textDefault,
  accent: styles.textAccent,
  success: styles.textSuccess,
  warning: styles.textWarning,
  danger: styles.textDanger,
} as const
const dotStyles = {
  default: styles.dotDefault,
  accent: styles.dotAccent,
  success: styles.dotSuccess,
  warning: styles.dotWarning,
  danger: styles.dotDanger,
} as const

const rootSx = computed(() => stylex.props(styles.root))
const textSx = computed(() => stylex.props(textStyles[props.statusTone]))
const dotSx = computed(() => stylex.props(styles.dot, dotStyles[props.statusTone]))
</script>

<template>
  <header :class="rootSx.className" :style="rootSx.style">
    <div :class="stylex.props(styles.brand).className">
      <span v-if="showMark" :class="stylex.props(styles.mark).className" aria-hidden="true" />
      <slot name="left">
        <div :class="stylex.props(styles.heading).className">
          <span v-if="title" :class="stylex.props(styles.title).className">{{ title }}</span>
          <span v-if="subtitle" :class="stylex.props(styles.subtitle).className">{{ subtitle }}</span>
        </div>
      </slot>
    </div>
    <div :class="stylex.props(styles.center).className">
      <slot />
    </div>
    <div
      v-if="time || statusLabel || $slots.right"
      :class="stylex.props(styles.right).className"
    >
      <slot name="right">
        <span v-if="time" :class="stylex.props(styles.time).className">{{ time }}</span>
        <span v-if="statusLabel" :class="stylex.props(styles.status).className">
          <span :class="dotSx.className" :style="dotSx.style" aria-hidden="true" />
          <span :class="textSx.className" :style="textSx.style">{{ statusLabel }}</span>
        </span>
      </slot>
    </div>
  </header>
</template>
