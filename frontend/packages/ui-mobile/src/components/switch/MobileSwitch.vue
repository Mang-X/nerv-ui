<script setup lang="ts">
import type { SwitchRootEmits, SwitchRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { SwitchRoot, SwitchThumb, useForwardPropsEmits } from 'reka-ui'
import { ref } from 'vue'
import { cn } from '../../lib/utils'

/**
 * Mobile switch — a 51×31 native pill inside a 51×44 touch target. The SwitchRoot
 * is the transparent hit area (44px baseline); the inner span is the visible pill
 * (standard iOS-ish ratio), so the control reads right and still taps easy.
 */
const props = defineProps<SwitchRootProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<SwitchRootEmits>()
const forwarded = useForwardPropsEmits(reactiveOmit(props, 'class'), emits)

// WinUI3/iOS-style press: the thumb depresses while held, then springs back.
const pressed = ref(false)
</script>

<template>
  <SwitchRoot
    data-slot="mobile-switch"
    v-bind="forwarded"
    @pointerdown="pressed = true"
    @pointerup="pressed = false"
    @pointerleave="pressed = false"
    @pointercancel="pressed = false"
    :class="
      cn(
        'nv-m-mswitch inline-flex h-11 w-[51px] shrink-0 cursor-pointer items-center justify-center rounded-full outline-none disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  >
    <!-- Visible pill (51×31, standard ratio) inside the 51×44 transparent hit area. -->
    <span class="nv-m-mswitch-pill pointer-events-none inline-flex h-[31px] w-[51px] items-center self-center rounded-full px-0.5">
      <SwitchThumb
        class="nv-m-mswitch-thumb pointer-events-none block size-[25px] rounded-full bg-white shadow-[0_2px_4px_rgb(0_0_0/0.2)] ring-0 data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-0.5"
        :class="pressed && 'is-pressed'"
      />
    </span>
  </SwitchRoot>
</template>

<style scoped>
@layer nv-components {
  .nv-m-mswitch {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  /* Visible pill carries the state fill; SwitchRoot is the transparent hit area. */
  .nv-m-mswitch[data-state='checked'] .nv-m-mswitch-pill {
    background-color: var(--nv-brand);
  }
  .nv-m-mswitch[data-state='unchecked'] .nv-m-mswitch-pill {
    background-color: color-mix(in oklch, var(--muted-foreground) 35%, transparent);
  }
  .nv-m-mswitch-pill {
    transition:
      background-color 0.2s var(--nv-ease-out-quart, ease-out),
      box-shadow var(--nv-duration-fast, 150ms) var(--nv-ease-out-quart, ease-out);
  }
  /* Focus ring draws on the pill (51×31), not the 51×44 hit area — so the halo
     hugs the actual switch shape, not the taller tap target. `:focus-within`
     also catches focus landing on the inner SwitchThumb button. Both
     focus-visible (keyboard on root) and focus-within (descendant focus)
     forward to the pill. */
  .nv-m-mswitch:focus-visible .nv-m-mswitch-pill,
  .nv-m-mswitch:focus-within .nv-m-mswitch-pill {
    outline: none;
    border-color: var(--nv-brand);
    box-shadow: var(--nv-focus-ring);
  }
  .nv-m-mswitch[data-invalid]:focus-visible .nv-m-mswitch-pill,
  .nv-m-mswitch[data-invalid]:focus-within .nv-m-mswitch-pill,
  .nv-m-mswitch[aria-invalid='true']:focus-visible .nv-m-mswitch-pill,
  .nv-m-mswitch[aria-invalid='true']:focus-within .nv-m-mswitch-pill {
    border-color: var(--destructive);
    box-shadow: var(--nv-focus-ring-destructive);
  }
  .nv-m-mswitch-thumb {
    /* Tailwind v4 glides the thumb via the `translate` property — name it in the
     transition (a `transform`-only transition never fires). `transform` carries
     the press depress (separate property, composes with `translate`). Slight
     back-ease spring for the native iOS feel. */
    transition:
      translate 0.26s var(--nv-ease-out-quart),
      transform 0.18s var(--nv-ease-out-quart);
  }
  .nv-m-mswitch-thumb.is-pressed {
    transform: scale(0.9);
  }
  @media (prefers-reduced-motion: reduce) {
    .nv-m-mswitch-thumb {
      transition: none;
    }
  }
}
</style>
