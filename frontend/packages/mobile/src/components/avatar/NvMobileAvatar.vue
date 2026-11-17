<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@ui-sdk/vue/avatar'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Avatar.styles'
import type { MobileAvatarProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MobileAvatarProps>(), {
  src: undefined,
  alt: undefined,
  name: undefined,
  fallback: undefined,
  size: 'md',
  shape: 'circle',
  fallbackDelay: 0,
})

const rootSx = computed(() =>
  stylex.props(styles.root, styles[props.shape], styles[props.size]),
)
const fallbackSx = computed(() =>
  stylex.props(
    styles.fallback,
    props.size === 'sm' && styles.fallbackSm,
    props.size === 'md' && styles.fallbackMd,
    props.size === 'lg' && styles.fallbackLg,
    props.size === 'xl' && styles.fallbackXl,
  ),
)

const fallbackText = computed(() => props.fallback ?? initialsOf(props.name ?? props.alt ?? ''))

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
    v-bind="$attrs"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <AvatarImage
      v-if="src"
      :src="src"
      :alt="alt ?? name"
      :class="stylex.props(styles.image).className"
    />
    <AvatarFallback :delay="fallbackDelay" :class="fallbackSx.className" :style="fallbackSx.style">
      <slot name="fallback">{{ fallbackText }}</slot>
    </AvatarFallback>
  </Avatar>
</template>
