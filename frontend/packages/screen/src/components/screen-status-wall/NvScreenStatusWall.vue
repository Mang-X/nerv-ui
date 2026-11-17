<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { darkTheme } from '../../theme/tokens.stylex'
import { focus } from '../../theme/shared.stylex'
import NvScreenStatusTag from '../screen-status-tag/NvScreenStatusTag.vue'
import { styles } from './ScreenStatusWall.styles'
import type { StatusWallGroup, StatusWallItem, StatusWallMode } from './types'

const props = withDefaults(
  defineProps<{
    items: StatusWallItem[]
    /** Accessible region name. */
    label: string
    mode?: StatusWallMode
    /** Cells per row in `grid` mode. */
    columns?: number
    emptyLabel?: string
  }>(),
  { mode: 'grid', columns: 6, emptyLabel: '暂无记录' },
)

const emit = defineEmits<{ select: [item: StatusWallItem] }>()

const rootSx = computed(() => stylex.props(darkTheme, styles.root))
const viewportSx = computed(() => stylex.props(styles.viewport, focus.subtle))
const cellsSx = computed(() => stylex.props(styles.cells))

const gridColumns = computed(() =>
  Number.isInteger(props.columns) && props.columns > 0 ? props.columns : 6,
)

const groups = computed<StatusWallGroup[]>(() => {
  if (props.mode === 'grid') {
    return [{ key: 'grid', label: '', items: props.items }]
  }
  const grouped = new Map<string, StatusWallGroup>()
  for (const item of props.items) {
    const key = item.group?.key ?? ''
    if (!grouped.has(key)) {
      grouped.set(key, { key: key || 'ungrouped', label: item.group?.label ?? '未分组', items: [] })
    }
    grouped.get(key)!.items.push(item)
  }
  return [...grouped.values()]
})

const gridStyle = computed(() =>
  props.mode === 'grid' ? { gridTemplateColumns: `repeat(${gridColumns.value}, minmax(0, 1fr))` } : undefined,
)

function cellSx(item: StatusWallItem) {
  return stylex.props(styles.cell, focus.subtle)
}

function select(item: StatusWallItem) {
  if (item.disabled) return
  emit('select', item)
}
</script>

<template>
  <div :class="rootSx.className" :style="rootSx.style" role="region" :aria-label="label">
    <div :class="viewportSx.className" :style="viewportSx.style">
      <p v-if="!items.length" :class="stylex.props(styles.empty).className" role="status">{{ emptyLabel }}</p>
      <div
        v-for="group in groups"
        :key="group.key"
        :class="stylex.props(styles.group).className"
        :aria-label="group.label || undefined"
      >
        <div v-if="mode === 'grouped'" :class="stylex.props(styles.groupHead).className">
          <span>{{ group.label }}</span>
          <span :class="stylex.props(styles.groupCount).className">{{ group.items.length }} 项</span>
        </div>
        <div :class="cellsSx.className" :style="[cellsSx.style, gridStyle]">
          <button
            v-for="item in group.items"
            :key="`${group.key}-${item.key}`"
            type="button"
            :class="cellSx(item).className"
            :style="cellSx(item).style"
            :disabled="item.disabled"
            :aria-label="`${item.label}${item.identity ? ` · ${item.identity}` : ''} · ${item.status.label}`"
            @click="select(item)"
          >
            <span :class="stylex.props(styles.cellHead).className">
              <span :class="stylex.props(styles.label).className" :title="item.label">{{ item.label }}</span>
              <NvScreenStatusTag :label="item.status.label" :tone="item.status.tone" size="sm" />
            </span>
            <span v-if="item.identity" :class="stylex.props(styles.meta).className">{{ item.identity }}</span>
            <span v-if="item.summary" :class="stylex.props(styles.meta).className">{{ item.summary }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
