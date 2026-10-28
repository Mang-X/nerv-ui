<script setup lang="ts">
import { computed, onUnmounted, shallowRef, watch } from 'vue'
import type { SavedPlanNavigateBase, SavedPlanNavigateRequest } from './types'

const props = defineProps<{
  label: string
  target?: string
  request: SavedPlanNavigateBase
  navigate?: (request: SavedPlanNavigateRequest) => void | Promise<void>
  action: 'group-link' | 'task-link'
}>()
const busy = shallowRef(false)
const failed = shallowRef(false)
const identity = computed(() => JSON.stringify([props.request, props.target]))
let generation = 0
function invalidate() {
  generation++
  busy.value = false
  failed.value = false
}
watch([identity, () => props.navigate], invalidate, { flush: 'sync' })
onUnmounted(invalidate)
async function open() {
  if (!props.target || !props.navigate || busy.value) return
  const request = ++generation
  busy.value = true
  failed.value = false
  try {
    await props.navigate({ ...props.request, target: props.target } as SavedPlanNavigateRequest)
  } catch {
    if (request === generation) failed.value = true
  } finally {
    if (request === generation) busy.value = false
  }
}
</script>

<template>
  <button
    v-if="target && navigate"
    type="button"
    class="text-left text-primary underline-offset-2 hover:underline focus-visible:underline"
    :data-action="action"
    :disabled="busy"
    :aria-busy="busy"
    @click.stop="open"
  >
    {{ label }}
  </button>
  <span v-else>{{ label }}</span>
  <span v-if="failed" role="alert" class="text-sm text-destructive">暂时无法打开，请稍后重试</span>
</template>
