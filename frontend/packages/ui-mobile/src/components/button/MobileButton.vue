<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { Primitive } from 'reka-ui'
import { cn } from '../../lib/utils'

/**
 * Mobile button — compact, native-feeling (iOS / tdesign-mobile). Medium weight,
 * restrained radius, dim-on-press feedback. NOT the oversized kiosk TouchButton.
 */
type Variant = 'primary' | 'default' | 'outline' | 'text' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<
    PrimitiveProps & {
      variant?: Variant
      size?: Size
      block?: boolean
      class?: HTMLAttributes['class']
    }
  >(),
  { as: 'button', variant: 'default', size: 'md', block: false },
)

const variantClass: Record<Variant, string> = {
  primary: 'before:bg-brand text-brand-foreground',
  default: 'before:bg-muted text-foreground',
  outline: 'before:border before:border-border text-foreground',
  text: 'px-1 text-brand',
  danger: 'before:bg-destructive/10 text-destructive',
}
const sizeClass: Record<Size, string> = {
  sm: 'h-11 px-3 text-[13px] before:h-8',
  md: 'h-11 px-4 text-[15px] before:h-10',
  lg: 'h-12 px-5 text-base before:h-12',
}

const classes = computed(() =>
  cn(
    'nv-m-mbtn relative isolate inline-flex min-h-11 min-w-11 shrink-0 select-none items-center justify-center gap-1.5 rounded-[10px] font-medium whitespace-nowrap outline-none focus-visible:ring-[3px] focus-visible:ring-brand/30 transition-[opacity,background-color] disabled:pointer-events-none disabled:opacity-40 before:pointer-events-none before:absolute before:inset-x-0 before:top-1/2 before:-z-10 before:-translate-y-1/2 before:rounded-[inherit] [&_svg:not([class*=size-])]:size-[1.05em] [&_svg]:shrink-0',
    variantClass[props.variant],
    sizeClass[props.size],
    props.block && 'w-full',
    props.class,
  ),
)
</script>

<template>
  <Primitive data-slot="mobile-button" :as="as" :as-child="asChild" :class="classes">
    <slot />
  </Primitive>
</template>

<style scoped>
@layer nv-components {
  .nv-m-mbtn {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .nv-m-mbtn:active:not(:disabled) {
    opacity: 0.6;
  }
}
</style>
