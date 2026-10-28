<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useVirtualList } from '@vueuse/core'
import StatusTag from './StatusTag.vue'

export interface ScreenStatusWallItem {
  key: string
  label: string
  /** Human-readable identity distinguishes repeated names. */
  identity: string
  status: { label: string; tone: 'cyan' | 'green' | 'amber' | 'red' }
  summary?: string | null
  group?: { key: string; label: string }
  disabled?: boolean
}
export type ScreenStatusWallMode = 'flat' | 'group-grid' | 'group-chip'
const props = withDefaults(
  defineProps<{
    items: readonly ScreenStatusWallItem[]
    label: string
    mode?: ScreenStatusWallMode
    emptyLabel?: string
  }>(),
  { mode: 'flat', emptyLabel: '暂无记录' },
)
const emit = defineEmits<{
  select: [item: ScreenStatusWallItem]
  visible: [keys: string[]]
  preview: [item: ScreenStatusWallItem | null]
}>()
const active = shallowRef<ScreenStatusWallItem | null>(null)
function close() {
  active.value = null
  emit('preview', null)
}
function preview(item: ScreenStatusWallItem) {
  if (item.disabled) return
  active.value = item
  emit('preview', item)
}
function leave(item: ScreenStatusWallItem) {
  if (active.value === item) close()
}
function select(item: ScreenStatusWallItem) {
  if (item.disabled) return
  close()
  emit('select', item)
}
const rows = computed(() => {
  const result: ScreenStatusWallItem[][] = []
  for (let i = 0; i < props.items.length; i += 6) result.push(props.items.slice(i, i + 6))
  return result
})
// Geometry is shared with the rendered row: 122px + 12px = 134px stride.
const { list, containerProps, wrapperProps } = useVirtualList(rows, {
  itemHeight: 134,
  overscan: 2,
})
const groups = computed(() => {
  const grouped = new Map<
    string | undefined,
    { key: string; label: string; items: ScreenStatusWallItem[] }
  >()
  for (const item of props.items) {
    const key = item.group?.key
    if (!grouped.has(key))
      grouped.set(key, {
        key: key === undefined ? 'ungrouped' : `group:${key}`,
        label: item.group?.label ?? '未分组',
        items: [],
      })
    grouped.get(key)!.items.push(item)
  }
  return [...grouped.values()]
})
const blocks = computed(() =>
  props.mode === 'flat'
    ? list.value.map((row) => ({
        key: `row:${rows.value[row.index]?.[0]?.key}`,
        label: '',
        // VirtualList stores a deep ref; keep public events on current caller items.
        items: rows.value[row.index] ?? [],
      }))
    : groups.value,
)
const visible = computed(() =>
  props.mode === 'flat'
    ? list.value.flatMap((row) => row.data.map((item) => item.key))
    : props.items.map((item) => item.key),
)
watch(visible, (keys) => emit('visible', keys), { immediate: true })
watch(() => [props.items, props.mode], close, { deep: true, flush: 'sync' })
watch(
  () => props.items,
  () => {
    const el = containerProps.ref.value
    if (el) el.scrollTop = 0
    containerProps.onScroll()
  },
  { flush: 'post' },
)
function scroll() {
  close()
  if (props.mode === 'flat') containerProps.onScroll()
}
watch(
  () => props.mode,
  () => {
    if (containerProps.ref.value) containerProps.ref.value.scrollTop = 0
    containerProps.onScroll()
  },
  { flush: 'post' },
)
onBeforeUnmount(close)
</script>

<template>
  <div
    class="nv-scr-wall text-sm"
    data-slot="nv-screen-status-wall"
    role="region"
    :aria-label="label"
    @keydown.esc="close"
  >
    <p v-if="!items.length" role="status">{{ emptyLabel }}</p>
    <div
      v-bind="containerProps"
      data-wall-viewport
      class="nv-scr-wall-viewport nv-scr-scroll"
      @scroll="scroll"
    >
      <div v-bind="mode === 'flat' ? wrapperProps : {}">
        <section
          v-for="block in blocks"
          :key="block.key"
          :aria-label="block.label || undefined"
          :data-wall-row="mode === 'flat' ? '' : undefined"
          :class="['nv-scr-wall-block', mode]"
          :style="mode === 'flat' ? { height: '122px', marginBottom: '12px' } : undefined"
        >
          <h3 v-if="mode !== 'flat'">
            {{ block.label }} <small class="text-sm">{{ block.items.length }} 项</small>
          </h3>
          <div class="nv-scr-wall-cells">
            <button
              v-for="item in block.items"
              :key="item.key"
              type="button"
              :disabled="item.disabled"
              :aria-label="`${item.label} · ${item.identity} · ${item.status.label}`"
              :title="`${item.label} · ${item.identity} · ${item.status.label} · ${item.summary ?? '—'}`"
              @mouseenter="preview(item)"
              @mouseleave="leave(item)"
              @focus="preview(item)"
              @blur="leave(item)"
              @click="select(item)"
            >
              <strong>{{ item.label }}</strong>
              <StatusTag
                class="nv-scr-wall-status"
                :label="item.status.label"
                :tone="item.status.tone"
              />
              <span class="nv-scr-wall-identity">{{ item.identity }}</span>
              <span class="nv-scr-wall-summary">{{ item.summary ?? '—' }}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
@layer nv-components {
  .nv-scr-wall {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    color: var(--nv-scr-text);
  }
  .nv-scr-wall-viewport {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
  .nv-scr-wall-block {
    min-width: 0;
    margin-bottom: 12px;
  }
  .nv-scr-wall-block h3 {
    margin: 0 0 6px;
    color: var(--nv-scr-text-2);
  }
  .nv-scr-wall-block small {
    font-variant-numeric: tabular-nums;
    color: var(--nv-scr-muted);
  }
  .nv-scr-wall-cells {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
    gap: 8px;
  }
  .flat .nv-scr-wall-cells {
    height: 122px;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 12px;
  }
  .nv-scr-wall-cells button {
    min-width: 0;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    align-content: start;
    align-items: center;
    gap: 6px;
    padding: 10px;
    font: inherit;
    text-align: left;
    color: var(--nv-scr-text);
    background: var(--nv-scr-panel-a);
    border: 1px solid var(--nv-scr-line);
    border-radius: var(--nv-scr-radius);
    cursor: pointer;
  }
  .nv-scr-wall-cells button:hover:not(:disabled),
  .nv-scr-wall-cells button:focus-visible {
    outline: 2px solid var(--nv-scr-cyan);
    outline-offset: -2px;
  }
  .nv-scr-wall-cells button:disabled {
    cursor: default;
    opacity: 0.6;
  }
  .nv-scr-wall-cells button:active:not(:disabled) {
    transform: scale(0.985);
  }
  .nv-scr-wall-cells strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .nv-scr-wall-status {
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    white-space: nowrap;
  }
  .nv-scr-wall-status :deep(.nv-scr-tag-label) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .nv-scr-wall-identity {
    width: 100%;
    color: var(--nv-scr-muted);
  }
  .nv-scr-wall-summary {
    color: var(--nv-scr-text-2);
    font-variant-numeric: tabular-nums;
  }
  .nv-scr-wall-identity,
  .nv-scr-wall-summary {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .group-chip .nv-scr-wall-cells {
    grid-template-columns: repeat(auto-fill, minmax(215px, 1fr));
  }
  .group-chip .nv-scr-wall-identity {
    width: auto;
  }
  @media (prefers-reduced-motion: reduce) {
    .nv-scr-wall-cells button:active:not(:disabled) {
      transform: none;
    }
  }
}
</style>
