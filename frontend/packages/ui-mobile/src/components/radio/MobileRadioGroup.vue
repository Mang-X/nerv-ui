<script setup lang="ts">
import type { RadioGroupRootEmits, RadioGroupRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { nextTick, onBeforeUnmount } from 'vue'
import { RadioGroupRoot, useForwardPropsEmits } from 'reka-ui'
import { cn } from '../../lib/utils'

const props = defineProps<RadioGroupRootProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<RadioGroupRootEmits>()
const forwarded = useForwardPropsEmits(reactiveOmit(props, 'class'), emits)

// Reka 2.10.1 moves focus in nextTick, then checks its window key state in
// a timer. A quick keyup can clear that state before either callback runs.
// Let Reka navigate and attempt selection first; repair only a missed click.
let navigation = 0
let timer: ReturnType<typeof setTimeout> | undefined
const eligible = new WeakSet<KeyboardEvent>()
function cancelNavigation() {
  navigation++
  clearTimeout(timer)
}
function captureKeydown(event: KeyboardEvent) {
  cancelNavigation()
  if (!event.defaultPrevented) eligible.add(event)
}
async function handleKeydown(event: KeyboardEvent) {
  const source = event.target
  const group = event.currentTarget
  if (
    !eligible.has(event) ||
    !event.defaultPrevented ||
    !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key) ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    !(source instanceof HTMLElement) ||
    !(group instanceof HTMLElement) ||
    source.getAttribute('role') !== 'radio' ||
    source.closest('[role="radiogroup"]') !== group
  )
    return
  const current = navigation
  await nextTick()
  if (current !== navigation) return
  const target = source.ownerDocument.activeElement
  if (!(target instanceof HTMLElement) || target === source) return
  timer = setTimeout(() => {
    if (
      current === navigation &&
      group.isConnected &&
      source.ownerDocument.activeElement === target &&
      target.closest('[role="radiogroup"]') === group &&
      target.getAttribute('role') === 'radio' &&
      !target.hasAttribute('data-disabled') &&
      target.getAttribute('aria-checked') === 'false'
    )
      target.click()
  }, 0)
}
onBeforeUnmount(cancelNavigation)
</script>

<template>
  <RadioGroupRoot
    data-slot="mobile-radio-group"
    v-bind="forwarded"
    @keydown.capture="captureKeydown"
    @keydown="handleKeydown"
    @click.capture="cancelNavigation"
    @pointerdown.capture="cancelNavigation"
    :class="cn('overflow-hidden rounded-xl border border-border bg-card', props.class)"
  >
    <slot />
  </RadioGroupRoot>
</template>
