<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import type { NvTreeNode } from './types'
import NvStatusBadge from '../status/NvStatusBadge.vue'
const props = defineProps<{
  nodes: NvTreeNode[]
  label: string
  expanded: string[]
  selectedKey: string | null
  emptyText?: string
}>()
const emit = defineEmits<{
  'update:expanded': [keys: string[]]
  'update:selectedKey': [key: string]
}>()
defineSlots<{ actions(props: { node: NvTreeNode }): unknown }>()
const root = ref<HTMLElement>()
const focusKey = ref<string | null>(null)
const rows = computed(() => {
  const result: {
    node: NvTreeNode
    level: number
    parent: string | null
    pos: number
    size: number
  }[] = []
  function walk(nodes: NvTreeNode[], level: number, parent: string | null) {
    nodes.forEach((node, i) => {
      result.push({ node, level, parent, pos: i + 1, size: nodes.length })
      if (props.expanded.includes(node.key)) walk(node.children ?? [], level + 1, node.key)
    })
  }
  walk(props.nodes, 1, null)
  return result
})
watch(
  rows,
  async (current, previous) => {
    if (current.some((r) => r.node.key === focusKey.value)) return
    const hadFocus = !!root.value?.contains(document.activeElement)
    let key = focusKey.value
    while (key && !current.some((r) => r.node.key === key))
      key = previous?.find((r) => r.node.key === key)?.parent ?? null
    focusKey.value = key ?? current[0]?.node.key ?? null
    if (hadFocus) {
      await nextTick()
      focus(focusKey.value)
    }
  },
  { immediate: true },
)
function focus(key: string | null) {
  focusKey.value = key
  const index = rows.value.findIndex((r) => r.node.key === key)
  if (index >= 0) root.value?.querySelectorAll<HTMLElement>('[role=treeitem]')[index]?.focus()
  else root.value?.focus()
}
function toggle(node: NvTreeNode) {
  emit(
    'update:expanded',
    props.expanded.includes(node.key)
      ? props.expanded.filter((k) => k !== node.key)
      : [...props.expanded, node.key],
  )
}
function select(node: NvTreeNode) {
  if (!node.disabled) emit('update:selectedKey', node.key)
}
function keydown(event: KeyboardEvent, index: number) {
  if (event.target !== event.currentTarget) return
  const row = rows.value[index]
  const node = row.node
  switch (event.key) {
    case 'ArrowDown':
      focus(rows.value[Math.min(index + 1, rows.value.length - 1)].node.key)
      break
    case 'ArrowUp':
      focus(rows.value[Math.max(index - 1, 0)].node.key)
      break
    case 'Home':
      focus(rows.value[0].node.key)
      break
    case 'End':
      focus(rows.value.at(-1)!.node.key)
      break
    case 'ArrowRight':
      if (node.children?.length) {
        if (!props.expanded.includes(node.key)) toggle(node)
        else focus(rows.value[index + 1].node.key)
      }
      break
    case 'ArrowLeft':
      if (node.children?.length && props.expanded.includes(node.key)) toggle(node)
      else if (row.parent) focus(row.parent)
      break
    case 'Enter':
    case ' ':
      select(node)
      break
    default:
      return
  }
  event.preventDefault()
  event.stopPropagation()
}
</script>
<template>
  <div
    ref="root"
    role="tree"
    :aria-label="label"
    :tabindex="rows.length ? -1 : 0"
    data-slot="nv-tree"
    class="grid gap-0.5 text-sm"
  >
    <div
      v-for="(row, index) in rows"
      :key="row.node.key"
      role="treeitem"
      :aria-label="row.node.label"
      :aria-level="row.level"
      :aria-posinset="row.pos"
      :aria-setsize="row.size"
      :aria-expanded="row.node.children?.length ? expanded.includes(row.node.key) : undefined"
      :aria-selected="selectedKey === row.node.key"
      :aria-disabled="row.node.disabled || undefined"
      :tabindex="(focusKey ?? rows[0]?.node.key) === row.node.key ? 0 : -1"
      class="nv-focusable flex min-w-0 items-center gap-2 rounded-md py-1.5 pr-2 outline-none hover:bg-accent/50"
      :class="selectedKey === row.node.key ? 'bg-accent text-accent-foreground' : ''"
      :style="{ paddingLeft: `${(row.level - 1) * 1 + 0.25}rem` }"
      @focus="focusKey = row.node.key"
      @click="select(row.node)"
      @keydown="keydown($event, index)"
    >
      <button
        v-if="row.node.children?.length"
        type="button"
        tabindex="-1"
        class="size-5 shrink-0"
        :aria-label="`${expanded.includes(row.node.key) ? '折叠' : '展开'}${row.node.label}`"
        @click.stop="toggle(row.node)"
      >
        <span aria-hidden="true">{{ expanded.includes(row.node.key) ? '⌄' : '›' }}</span>
      </button>
      <span v-else class="size-5 shrink-0" aria-hidden="true" />
      <span
        class="min-w-0 flex-1 truncate"
        :class="row.node.inactive ? 'text-muted-foreground line-through' : ''"
        >{{ row.node.label }}</span
      >
      <span v-if="row.node.code" class="font-mono text-xs text-muted-foreground">{{
        row.node.code
      }}</span>
      <NvStatusBadge
        v-if="row.node.status"
        :label="row.node.status.label"
        :tone="row.node.status.tone"
      />
      <span @click.stop @keydown.stop><slot name="actions" :node="row.node" /></span>
    </div>
    <p v-if="!rows.length" class="p-3 text-muted-foreground">{{ emptyText ?? '暂无内容' }}</p>
  </div>
</template>
