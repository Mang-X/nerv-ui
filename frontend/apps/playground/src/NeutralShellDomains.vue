<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import {
  NvButton,
  NvDropdownMenu,
  NvDropdownMenuTrigger,
  NvDropdownMenuContent,
  NvDropdownMenuItem,
} from '@nerv-iip/ui'
import type { ShellEntry } from './neutral-shell-types'
const props = defineProps<{
  items: ShellEntry[]
  currentKey?: string
  moreLabel: string
  label: string
}>()
const emit = defineEmits<{ select: [key: string] }>()
const container = ref<HTMLElement>()
const measure = ref<HTMLElement>()
const count = ref(0)
const overflow = computed(() => props.items.slice(count.value))
const active = computed(() => overflow.value.some((item) => item.key === props.currentKey))
function recompute() {
  if (!container.value || !measure.value) return
  const elements = Array.from(measure.value.children) as HTMLElement[]
  const widths = elements.slice(0, props.items.length).map((el) => el.offsetWidth)
  const gap = Number.parseFloat(getComputedStyle(measure.value).columnGap) || 0
  const available = container.value.clientWidth
  if (available <= 0) {
    count.value = 0
    return
  }
  const total = widths.reduce((sum, width) => sum + width, 0) + Math.max(0, widths.length - 1) * gap
  if (total <= available && available > 0) {
    count.value = widths.length
    return
  }
  let used = elements.at(-1)?.offsetWidth ?? 0
  let fit = 0
  for (const width of widths) {
    if (used + gap + width > available) break
    used += gap + width
    fit++
  }
  count.value = fit
}
let observer: ResizeObserver | undefined
let live = false
onMounted(() => {
  live = true
  recompute()
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(recompute)
    observer.observe(container.value!)
    observer.observe(measure.value!)
  }
  document.fonts?.ready
    .then(() => {
      if (live) recompute()
    })
    .catch(() => {})
})
onBeforeUnmount(() => {
  live = false
  observer?.disconnect()
})
watch(() => [props.items, props.moreLabel], recompute, { deep: true, flush: 'post' })
</script>
<template>
  <nav ref="container" :aria-label="label" class="relative min-w-0 flex-1">
    <div
      ref="measure"
      aria-hidden="true"
      class="invisible pointer-events-none absolute flex w-max gap-2 whitespace-nowrap"
    >
      <span
        v-for="item in items"
        :key="item.key"
        class="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium"
        >{{ item.label }}</span
      >
      <span class="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium">{{
        moreLabel
      }}</span>
    </div>
    <div class="flex min-w-0 gap-2">
      <NvButton
        v-for="item in items.slice(0, count)"
        :key="item.key"
        :data-domain="item.key"
        :disabled="item.disabled"
        :aria-current="item.key === currentKey ? 'page' : undefined"
        :variant="item.key === currentKey ? 'secondary' : 'ghost'"
        class="shrink-0 whitespace-nowrap"
        @click="emit('select', item.key)"
        >{{ item.label }}</NvButton
      >
      <NvDropdownMenu v-if="overflow.length"
        ><NvDropdownMenuTrigger as-child
          ><NvButton
            data-overflow
            :data-active="active"
            :aria-current="active ? 'page' : undefined"
            :variant="active ? 'secondary' : 'ghost'"
            class="min-w-0 max-w-full truncate"
            >{{ moreLabel }}</NvButton
          ></NvDropdownMenuTrigger
        ><NvDropdownMenuContent
          ><NvDropdownMenuItem
            v-for="item in overflow"
            :key="item.key"
            :disabled="item.disabled"
            :aria-current="item.key === currentKey ? 'page' : undefined"
            @select="emit('select', item.key)"
            >{{ item.label }}</NvDropdownMenuItem
          ></NvDropdownMenuContent
        ></NvDropdownMenu
      >
    </div>
  </nav>
</template>
