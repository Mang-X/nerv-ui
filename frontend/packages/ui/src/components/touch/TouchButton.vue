<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes, FunctionalComponent, VNode, VNodeChild } from 'vue'
import { cloneVNode, Comment, Fragment, h, isVNode, mergeProps, useSlots } from 'vue'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import { Primitive } from 'reka-ui'
import { cn } from '../../lib/utils'
import NvLoader from '../pc/loader/NvLoader.vue'

/**
 * Touch — large, touch-optimized action button for tablet station boards and
 * workshop kiosks. Big tap targets (≥56px), action-semantic variants, strong
 * press feedback. Reduces operation paths: one obvious tap per intent.
 */
const touchButtonVariants = cva(
  'nv-tbtn relative inline-flex shrink-0 select-none items-center justify-center gap-2.5 rounded-xl text-base font-semibold whitespace-nowrap outline-none transition-[background,box-shadow,transform] duration-150 focus-visible:ring-4 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 aria-busy:pointer-events-none [&_svg:not([class*=size-])]:size-5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        brand: 'nv-tbtn-solid bg-brand text-brand-foreground hover:brightness-105',
        default: 'nv-tbtn-solid bg-primary text-primary-foreground hover:brightness-110',
        success: 'nv-tbtn-solid bg-success text-success-foreground hover:brightness-105',
        warning: 'nv-tbtn-solid bg-warning text-warning-foreground hover:brightness-105',
        destructive: 'nv-tbtn-solid bg-destructive text-white hover:brightness-105',
        outline:
          'border-2 border-border bg-card text-foreground hover:bg-muted hover:border-foreground/20',
        ghost: 'text-foreground hover:bg-muted',
      },
      size: {
        md: 'h-11 px-4 text-[15px]',
        lg: 'h-14 px-5 text-base',
        xl: 'h-[72px] px-6 text-lg',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'default', size: 'lg', block: false },
  },
)

type TouchButtonVariants = VariantProps<typeof touchButtonVariants>

const props = withDefaults(
  defineProps<
    PrimitiveProps & {
      variant?: TouchButtonVariants['variant']
      size?: TouchButtonVariants['size']
      block?: boolean
      loading?: boolean
      disabled?: boolean
      class?: HTMLAttributes['class']
    }
  >(),
  { as: 'button', block: false },
)
const slots = useSlots()
// Keep Primitive's polymorphic host as its only child. Decorations belong inside
// that host, rather than becoming the first node selected by Primitive Slot.
const ChildContent: FunctionalComponent = (_props, { attrs }) => {
  const flatten = (nodes: VNode[]): VNode[] =>
    nodes.flatMap((node) =>
      node.type === Fragment
        ? flatten(Array.isArray(node.children) ? node.children.filter(isVNode) : [])
        : [node],
    )
  const nodes = flatten(slots.default?.() ?? [])
  const index = nodes.findIndex((node) => node.type !== Comment)
  if (index < 0) return nodes
  const child = nodes[index]!
  const childProps = { ...child.props }
  delete childProps.ref
  const forwarded = mergeProps(
    attrs,
    childProps,
    props.loading || props.disabled
      ? {
          disabled: true,
          'aria-disabled': true,
          'aria-busy': props.loading || childProps['aria-busy'],
        }
      : {},
  )
  const prefix = () =>
    props.loading
      ? [h(NvLoader, { variant: 'ring', size: 'default', class: 'text-current' })]
      : (slots.leading?.() ?? [])
  const original = child.children
  const originalSlots =
    original !== null && typeof original === 'object' && !Array.isArray(original)
      ? (original as Record<string, unknown> & { default?: () => VNodeChild })
      : undefined
  const decoratedContent = () => [
    ...prefix(),
    ...[(originalSlots ? originalSlots.default?.() : (original as VNodeChild)) ?? []].flat(),
  ]
  const content =
    typeof child.type === 'string'
      ? decoratedContent()
      : { ...originalSlots, default: decoratedContent }
  const normalized = h(child.type as string, forwarded, content)
  // Preserve the caller's VNode ownership/ref/scope, with newly normalized
  // children and render flags so text children can safely receive the loader.
  nodes[index] = Object.assign(cloneVNode({ ...child, props: {} }, forwarded), {
    children: normalized.children,
    shapeFlag: normalized.shapeFlag,
    patchFlag: normalized.patchFlag,
  })
  return nodes.length === 1 ? nodes[0] : nodes
}
ChildContent.inheritAttrs = false

function guardActivation(event: Event) {
  if (!props.loading && !props.disabled) return
  event.preventDefault()
  event.stopImmediatePropagation()
}
function guardKeyActivation(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') guardActivation(event)
}
</script>

<template>
  <Primitive
    data-slot="touch-button"
    :as="as"
    :as-child="asChild"
    :aria-busy="loading || undefined"
    :disabled="disabled || loading || undefined"
    :aria-disabled="disabled || loading || undefined"
    @click.capture="guardActivation"
    @keydown.capture="guardKeyActivation"
    @keyup.capture="guardKeyActivation"
    :class="cn(touchButtonVariants({ variant, size, block }), props.class)"
  >
    <ChildContent v-if="asChild" />
    <template v-else>
      <NvLoader v-if="loading" variant="ring" size="default" class="text-current" />
      <slot v-else name="leading" />
      <slot />
    </template>
  </Primitive>
</template>

<style scoped>
@layer nv-components {
  .nv-tbtn {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    will-change: transform;
  }
  .nv-tbtn:active:not(:disabled) {
    transform: scale(0.97);
  }
  .nv-tbtn-solid {
    box-shadow:
      inset 0 1px 0 0 color-mix(in oklch, white 16%, transparent),
      0 1px 2px 0 color-mix(in oklch, black 22%, transparent);
  }
  @media (prefers-reduced-motion: reduce) {
    .nv-tbtn:active:not(:disabled) {
      transform: none;
    }
  }
}
</style>
