<script setup lang="ts">
import { computed, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../lib/utils'

/**
 * Touch — large segmented control. One-tap switch between a small set of modes,
 * sized for fingers. Reduces operation paths vs. a dropdown on the shop floor.
 */
export interface SegmentOption {
  value: string
  label: string
}

const props = defineProps<{
  modelValue: string
  options: SegmentOption[]
  class?: HTMLAttributes['class']
}>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()
const root = useTemplateRef<HTMLDivElement>('root')
const activeIndex = computed(() =>
  Math.max(
    0,
    props.options.findIndex((option) => option.value === props.modelValue),
  ),
)

function navigate(event: KeyboardEvent, index: number) {
  const count = props.options.length
  if (!count) return
  let next: number
  switch (event.key) {
    case 'ArrowRight':
      next = (index + 1) % count
      break
    case 'ArrowLeft':
      next = (index - 1 + count) % count
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = count - 1
      break
    default:
      return
  }
  event.preventDefault()
  const option = props.options[next]
  if (!option) return
  // Keyed moves do not reorder a v-for ref array; read the current DOM order.
  root.value?.querySelectorAll<HTMLButtonElement>(':scope > button')[next]?.focus()
  emit('update:modelValue', option.value)
}
</script>

<template>
  <div
    ref="root"
    data-slot="touch-segmented"
    role="tablist"
    :class="cn('inline-flex h-12 items-center gap-1 rounded-xl bg-muted p-0.5', props.class)"
  >
    <button
      v-for="(opt, index) in options"
      :key="opt.value"
      type="button"
      role="tab"
      :aria-selected="modelValue === opt.value"
      :tabindex="index === activeIndex ? 0 : -1"
      @keydown="navigate($event, index)"
      :class="
        cn(
          'nv-seg h-full rounded-lg px-5 text-base font-medium whitespace-nowrap transition-colors',
          modelValue === opt.value
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )
      "
      @click="emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<style scoped>
@layer nv-components {
  .nv-seg {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
}
</style>
