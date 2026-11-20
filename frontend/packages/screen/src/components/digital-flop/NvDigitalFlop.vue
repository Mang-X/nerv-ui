<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './DigitalFlop.styles'
import type { DigitalFlopSize, DigitalFlopTone } from './types'

const props = withDefaults(
  defineProps<{
    value: number | string
    digits?: number
    size?: DigitalFlopSize
    tone?: DigitalFlopTone
    label?: string
    animated?: boolean
    ariaLabel?: string
  }>(),
  { size: 'lg', tone: 'default', animated: true },
)

const sizeStyles = { md: styles.md, lg: styles.lg, xl: styles.xl } as const
const separatorStyles = { md: styles.sepMd, lg: styles.sepLg, xl: styles.sepXl } as const
const toneStyles = {
  accent: styles.toneAccent,
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
} as const

const text = computed(() => {
  const raw = String(props.value)
  if (!props.digits || props.digits <= 0 || !/^-?\d+$/.test(raw)) return raw
  const negative = raw.startsWith('-')
  const body = negative ? raw.slice(1) : raw
  return `${negative ? '-' : ''}${body.padStart(props.digits, '0')}`
})

const chars = computed(() => text.value.split(''))
const rootSx = computed(() => stylex.props(styles.root))
const ariaText = computed(() =>
  props.label ? `${props.label} ${text.value}` : text.value,
)

function isDigit(char: string) {
  return /\d/.test(char)
}

function toneStyle() {
  return props.tone === 'default' ? null : toneStyles[props.tone]
}

function cellSx() {
  return stylex.props(
    styles.cell,
    sizeStyles[props.size],
    props.animated && styles.animated,
    toneStyle(),
  )
}

function separatorSx() {
  return stylex.props(styles.separator, separatorStyles[props.size])
}
</script>

<template>
  <div role="img" :aria-label="ariaLabel ?? ariaText" :class="rootSx.className" :style="rootSx.style">
    <span v-if="label || $slots.label" :class="stylex.props(styles.label).className">
      <slot name="label">{{ label }}</slot>
    </span>
    <div :class="stylex.props(styles.group).className" aria-hidden="true">
      <template v-for="(char, index) in chars" :key="`${index}-${char}`">
        <span
          v-if="isDigit(char)"
          :class="cellSx().className"
          :style="cellSx().style"
        >{{ char }}</span>
        <span v-else :class="separatorSx().className" :style="separatorSx().style">{{ char }}</span>
      </template>
    </div>
  </div>
</template>
