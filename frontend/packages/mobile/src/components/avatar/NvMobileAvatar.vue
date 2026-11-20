<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@ui-sdk/vue/avatar'
import * as stylex from '@stylexjs/stylex'
import { computed, useAttrs } from 'vue'
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

const attrs = useAttrs()
const inputAttrs = computed(() => {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class' || key === 'style') continue
    out[key] = value
  }
  return out
})

/**
 * 只有加载成功的图片才有 alt；纯首字头像此前没有任何可访问名称——读屏读不出，
 * 代理也认不出它属于谁。这里把 `alt` / `name` 提到根上作为整体名称。
 */
const ariaLabel = computed(
  () =>
    (attrs['aria-label'] as string | undefined) ?? props.alt ?? props.name ?? props.fallback ?? '',
)

const rootSx = computed(() => stylex.props(styles.root, styles[props.shape], styles[props.size]))
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
    v-bind="inputAttrs"
    role="img"
    :aria-label="ariaLabel || undefined"
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
