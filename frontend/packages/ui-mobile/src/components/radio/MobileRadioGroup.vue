<script setup lang="ts">
import type { RadioGroupRootEmits, RadioGroupRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { nextTick, onBeforeUnmount, watch } from 'vue'
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
let pending:
  | {
      source: HTMLElement
      group: HTMLElement
      target?: HTMLElement
      acceptingFocus: boolean
      arrived: boolean
    }
  | undefined
function cancelNavigation() {
  navigation++
  clearTimeout(timer)
  pending = undefined
}
function captureKeydown(event: KeyboardEvent) {
  cancelNavigation()
  if (!event.defaultPrevented) eligible.add(event)
  const current = navigation
  // Register before Reka queues focusFirst in its target keydown handler.
  // Synchronous host focus changes before that queue are not navigation.
  void nextTick(() => {
    if (current === navigation && pending) pending.acceptingFocus = true
  })
}
function isRadio(target: EventTarget | null, group: HTMLElement): target is HTMLElement {
  return (
    target instanceof HTMLElement &&
    target.getAttribute('role') === 'radio' &&
    target.closest('[role="radiogroup"]') === group
  )
}
function captureBlur(event: FocusEvent) {
  const request = pending
  if (!request) return
  // Only the first source -> radio transition can belong to the queued move.
  // Any later blur cancels permanently, including leave-and-return.
  if (
    request.acceptingFocus &&
    !request.target &&
    event.target === request.source &&
    isRadio(event.relatedTarget, request.group)
  )
    request.target = event.relatedTarget
  else cancelNavigation()
}
function captureFocus(event: FocusEvent) {
  const request = pending
  if (!request) return
  if (!request.arrived && event.target === request.target && event.relatedTarget === request.source)
    request.arrived = true
  else cancelNavigation()
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
  const request = {
    source,
    group,
    acceptingFocus: false,
    arrived: false,
    target: undefined as HTMLElement | undefined,
  }
  pending = request
  await nextTick()
  if (current !== navigation) return
  request.acceptingFocus = false
  const target = request.target
  if (!request.arrived || !target) {
    cancelNavigation()
    return
  }
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
watch(() => props.modelValue, cancelNavigation, { deep: true, flush: 'sync' })
watch(() => props.disabled, cancelNavigation, { flush: 'sync' })
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
    @blur.capture="captureBlur"
    @focus.capture="captureFocus"
    :class="cn('overflow-hidden rounded-xl border border-border bg-card', props.class)"
  >
    <slot />
  </RadioGroupRoot>
</template>
