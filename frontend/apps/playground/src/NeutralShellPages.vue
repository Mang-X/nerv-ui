<script setup lang="ts">
import { ref, watch, useId } from 'vue'
import { NvButton } from '@nerv-iip/ui'
import type { ShellEntry } from './neutral-shell-types'
const props = defineProps<{ items: ShellEntry[]; currentKey?: string }>()
const emit = defineEmits<{ navigate: [key: string] }>()
const closed = ref(new Set<string>())
const id = useId()
function active(item: ShellEntry): boolean {
  return item.key === props.currentKey || !!item.children?.some(active)
}
function toggle(key: string) {
  const next = new Set(closed.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  closed.value = next
}
watch(
  () => props.currentKey,
  () => {
    for (const item of props.items) if (active(item)) closed.value.delete(item.key)
  },
)
</script>
<template>
  <template v-for="item in items" :key="item.key">
    <NvButton
      v-if="item.children?.length"
      :data-parent="item.key"
      :data-active="active(item)"
      :aria-expanded="!closed.has(item.key)"
      :aria-controls="`${id}-${item.key}`"
      :disabled="item.disabled"
      :variant="active(item) ? 'secondary' : 'ghost'"
      class="h-auto justify-start whitespace-normal text-left"
      @click="toggle(item.key)"
      >{{ item.label }}</NvButton
    >
    <NvButton
      v-else
      :data-nav="item.key"
      :aria-label="item.label"
      :title="item.label"
      :disabled="item.disabled"
      :aria-current="item.key === currentKey ? 'page' : undefined"
      :variant="item.key === currentKey ? 'secondary' : 'ghost'"
      class="h-auto justify-start whitespace-normal break-words text-left"
      @click="emit('navigate', item.key)"
      >{{ item.label }}</NvButton
    >
    <div
      v-if="item.children?.length"
      v-show="!closed.has(item.key)"
      :id="`${id}-${item.key}`"
      class="grid gap-1 pl-3"
    >
      <NeutralShellPages
        v-if="!closed.has(item.key)"
        :items="item.children"
        :current-key="currentKey"
        @navigate="emit('navigate', $event)"
      />
    </div>
  </template>
</template>
