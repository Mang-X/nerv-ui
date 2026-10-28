<script setup lang="ts">
import type { SavedPlanNavigateBase, SavedPlanNavigateRequest } from './types'

const props = defineProps<{
  label: string
  target?: string
  request: SavedPlanNavigateBase
  navigate?: (request: SavedPlanNavigateRequest) => void | Promise<void>
  action: 'group-link' | 'task-link'
}>()
function open() {
  if (props.target && props.navigate) props.navigate({ ...props.request, target: props.target } as SavedPlanNavigateRequest)
}
</script>

<template>
  <button
    v-if="target && navigate"
    type="button"
    class="text-left text-primary underline-offset-2 hover:underline focus-visible:underline"
    :data-action="action"
    @click.stop="open"
  >
    {{ label }}
  </button>
  <span v-else>{{ label }}</span>
</template>
