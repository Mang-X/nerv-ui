<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@ui-sdk/vue/avatar'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './TouchAvatar.styles'
import type { TouchAvatarProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TouchAvatarProps>(), {
  src: undefined,
  alt: undefined,
  name: undefined,
  fallback: undefined,
  size: 'lg',
  shape: 'circle',
  status: undefined,
  fallbackDelay: 0,
})

const fallbackSizes = {
  md: styles.fallbackMd,
  lg: styles.fallbackLg,
  xl: styles.fallbackXl,
}

const fallbackText = computed(() => props.fallback ?? initialsOf(props.name ?? props.alt ?? ''))

const rootSx = computed(() => stylex.props(styles.root, styles[props.shape], styles[props.size]))
const imageSx = computed(() => stylex.props(styles.image))
const fallbackSx = computed(() => stylex.props(styles.fallback, fallbackSizes[props.size]))
const statusSx = computed(() =>
  stylex.props(styles.status, props.status ? styles[props.status] : null),
)

function initialsOf(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return ''
  const words = trimmed.split(/\s+/)
  if (words.length > 1) {
    return `${words[0]?.[0] ?? ''}${words[1]?.[0] ?? ''}`.toUpperCase()
  }
  return trimmed.length <= 2 ? trimmed : trimmed.slice(0, 2).toUpperCase()
}
</script>

<template>
  <Avatar
    v-bind="omitClassStyle($attrs)"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <AvatarImage
      v-if="src"
      :src="src"
      :alt="alt ?? name"
      :class="imageSx.className"
      :style="imageSx.style"
    />
    <AvatarFallback :delay="fallbackDelay" :class="fallbackSx.className" :style="fallbackSx.style">
      <slot name="fallback">{{ fallbackText }}</slot>
    </AvatarFallback>
    <span v-if="status" :class="statusSx.className" :style="statusSx.style" aria-hidden="true" />
  </Avatar>
</template>
