<script setup lang="ts">
import type { NavigationMenuContentEmits, NavigationMenuContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { NavigationMenuContent, useForwardPropsEmits } from 'reka-ui'
import { cn } from '../../../lib/utils'

/**
 * Pro — navigation content: the panel shown for an open trigger. Reka hoists
 * this into the shared viewport, so it lays out its own grid of links; the
 * viewport handles the glass surface, sizing and clip-escape. Slides in from
 * the side matching the direction of travel between sibling triggers.
 */
const props = defineProps<NavigationMenuContentProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<NavigationMenuContentEmits>()
const forwarded = useForwardPropsEmits(reactiveOmit(props, 'class'), emits)
</script>

<template>
  <NavigationMenuContent
    data-slot="nv-navigation-menu-content"
    v-bind="forwarded"
    :class="
      cn(
        'nv-nav-content absolute top-0 left-0 p-3',
        // fade only (no directional left/right slide — the panel is a popover that
        // drops from its trigger; the viewport handles the position/size glide)
        'data-[motion=from-start]:animate-in data-[motion=from-end]:animate-in data-[motion=to-start]:animate-out data-[motion=to-end]:animate-out',
        'data-[motion=from-start]:fade-in data-[motion=from-end]:fade-in data-[motion=to-start]:fade-out data-[motion=to-end]:fade-out',
        'duration-200',
        props.class,
      )
    "
  >
    <slot />
  </NavigationMenuContent>
</template>

<!-- Unscoped: Reka teleports Content into the shared viewport. -->
<style>
@layer nv-components {
  .nv-nav-content {
    width: 100%;
    animation-timing-function: var(--nv-ease-out-quart, ease-out);
  }
  @media (min-width: 40rem) {
    .nv-nav-content {
      width: auto;
    }
  }
  /* Only hoisted content: its measured width must not depend on the viewport
     width that Reka derives from it. Leave room for the viewport's two borders
     and 1rem of screen space on each side; consumers can wrap within this box.
     Inline content (viewport=false) retains the original responsive widths. */
  [data-slot='nv-navigation-menu-viewport'] > .nv-nav-content {
    width: max-content;
    max-width: calc(100vw - 2rem - 2px);
  }
  @media (prefers-reduced-motion: reduce) {
    .nv-nav-content {
      animation: none !important;
    }
  }
}
</style>
