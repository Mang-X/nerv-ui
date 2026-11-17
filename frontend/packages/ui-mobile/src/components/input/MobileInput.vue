<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useSlots } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '../../lib/utils'

/**
 * Mobile input — 44px touch height, 15px text (no iOS zoom-on-focus), leading /
 * trailing slots. Focus ring comes from the shared `.nv-focusable` contract
 * (theme.css): brand halo, destructive variant via data-invalid / aria-invalid.
 */
const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes['class']
}>()
const emits = defineEmits<{ 'update:modelValue': [value: string | number] }>()
const slots = useSlots()
defineOptions({ inheritAttrs: false })

const model = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <div
    data-slot="mobile-input"
    :class="
      cn(
        'nv-m-minput nv-focusable flex h-11 items-center gap-2.5 rounded-xl border border-border bg-card px-3.5',
        props.class,
      )
    "
  >
    <span
      v-if="slots.leading"
      class="flex shrink-0 items-center text-muted-foreground [&_svg]:size-5"
    >
      <slot name="leading" />
    </span>
    <input
      v-model="model"
      data-slot="mobile-input-field"
      class="h-full w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground disabled:opacity-50"
      v-bind="$attrs"
    />
    <span
      v-if="slots.trailing"
      class="flex shrink-0 items-center text-muted-foreground [&_svg]:size-5"
    >
      <slot name="trailing" />
    </span>
  </div>
</template>

<style scoped>
/* Focus ring + its transition live in the shared .nv-focusable rule. */
</style>
