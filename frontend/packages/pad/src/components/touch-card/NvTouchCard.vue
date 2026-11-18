<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import * as stylex from '@stylexjs/stylex'
import { computed, useAttrs } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './TouchCard.styles'
import type { TouchCardProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TouchCardProps>(), {
  variant: 'outline',
  title: undefined,
  subtitle: undefined,
  padding: 'lg',
  interactive: false,
  disabled: false,
})

const attrs = useAttrs()
const pressable = computed(() => props.interactive && !props.disabled)
const forwardedAttrs = computed(() => omitClassStyle(attrs))

const headerSx = computed(() =>
  stylex.props(styles.header, props.padding === 'lg' && styles.headerLg),
)
const titleRowSx = computed(() => stylex.props(styles.titleRow))
const titleSx = computed(() => stylex.props(styles.title))
const subtitleSx = computed(() => stylex.props(styles.subtitle))
const contentSx = computed(() =>
  stylex.props(styles.content, props.padding === 'lg' && styles.contentLg),
)
const footerSx = computed(() =>
  stylex.props(styles.footer, props.padding === 'lg' && styles.footerLg),
)

const rootSx = computed(() =>
  stylex.props(
    styles.root,
    styles[props.variant],
    pressable.value && styles.interactive,
    pressable.value && focus.ring,
    props.disabled && styles.disabled,
  ),
)
</script>

<template>
  <!-- 可点卡片：ui-sdk Button 提供 Enter/Space、disabled 与点击语义 -->
  <Button
    v-if="pressable"
    v-bind="forwardedAttrs"
    type="button"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <header
      v-if="title || subtitle || $slots.title"
      :class="headerSx.className"
      :style="headerSx.style"
    >
      <div :class="titleRowSx.className" :style="titleRowSx.style">
        <h3 v-if="title || $slots.title" :class="titleSx.className" :style="titleSx.style">
          <slot name="title">{{ title }}</slot>
        </h3>
        <slot name="header-actions" />
      </div>
      <p v-if="subtitle || $slots.subtitle" :class="subtitleSx.className" :style="subtitleSx.style">
        <slot name="subtitle">{{ subtitle }}</slot>
      </p>
    </header>
    <div v-if="$slots.default" :class="contentSx.className" :style="contentSx.style">
      <slot />
    </div>
    <footer v-if="$slots.footer" :class="footerSx.className" :style="footerSx.style">
      <slot name="footer" />
    </footer>
  </Button>

  <div
    v-else
    v-bind="forwardedAttrs"
    :aria-disabled="disabled || undefined"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <header
      v-if="title || subtitle || $slots.title"
      :class="headerSx.className"
      :style="headerSx.style"
    >
      <div :class="titleRowSx.className" :style="titleRowSx.style">
        <h3 v-if="title || $slots.title" :class="titleSx.className" :style="titleSx.style">
          <slot name="title">{{ title }}</slot>
        </h3>
        <slot name="header-actions" />
      </div>
      <p v-if="subtitle || $slots.subtitle" :class="subtitleSx.className" :style="subtitleSx.style">
        <slot name="subtitle">{{ subtitle }}</slot>
      </p>
    </header>
    <div v-if="$slots.default" :class="contentSx.className" :style="contentSx.style">
      <slot />
    </div>
    <footer v-if="$slots.footer" :class="footerSx.className" :style="footerSx.style">
      <slot name="footer" />
    </footer>
  </div>
</template>
