<script setup lang="ts" generic="T extends object">
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { focus } from '../../theme/shared.stylex'
import NvCheckbox from '../checkbox/NvCheckbox.vue'
import { styles } from './DataTable.styles'
import type {
  NvDataTableColumn,
  NvDataTableProps,
  NvDataTableRowKey,
  NvDataTableSort,
} from './types'

defineOptions({ inheritAttrs: false })

type CheckedState = boolean | 'indeterminate'

interface RowEntry {
  row: T
  /** Position in the original `rows` array, used for stable keys and tie-breaks. */
  index: number
}

const props = withDefaults(defineProps<NvDataTableProps<T>>(), {
  sortable: false,
  selectable: false,
  emptyText: '暂无数据',
  size: 'md',
})

const emit = defineEmits<{
  'update:sort': [sort: NvDataTableSort | null]
  sortChange: [sort: NvDataTableSort | null]
  'update:selected': [selected: NvDataTableRowKey[]]
  selectChange: [selected: NvDataTableRowKey[]]
}>()

const innerSort = ref<NvDataTableSort | null>(props.defaultSort ?? null)
const innerSelected = ref<NvDataTableRowKey[]>(props.defaultSelected ?? [])

const currentSort = computed<NvDataTableSort | null>(() =>
  props.sort !== undefined ? props.sort : innerSort.value,
)
const currentSelected = computed<NvDataTableRowKey[]>(() =>
  props.selected !== undefined ? props.selected : innerSelected.value,
)

const entries = computed<RowEntry[]>(() => {
  const list = props.rows.map((row, index) => ({ row, index }))
  const sort = currentSort.value
  if (!sort) return list
  const column = props.columns.find((item) => item.key === sort.key)
  if (!column) return list
  const factor = sort.direction === 'asc' ? 1 : -1
  return [...list].sort((a, b) => {
    const left = cellValueOf(a.row, column, a.index)
    const right = cellValueOf(b.row, column, b.index)
    if (isEmpty(left) || isEmpty(right)) {
      if (isEmpty(left) && isEmpty(right)) return a.index - b.index
      return isEmpty(left) ? 1 : -1
    }
    const byValue = compareValues(left, right)
    return byValue === 0 ? a.index - b.index : byValue * factor
  })
})

const selectedSet = computed(() => new Set(currentSelected.value))

const allSelected = computed(
  () => entries.value.length > 0 && entries.value.every((entry) => isEntrySelected(entry)),
)
const someSelected = computed(
  () => !allSelected.value && entries.value.some((entry) => isEntrySelected(entry)),
)
const headerChecked = computed<CheckedState>(() =>
  allSelected.value ? true : someSelected.value ? 'indeterminate' : false,
)

const colSpan = computed(() => props.columns.length + (props.selectable ? 1 : 0))

const rootSx = computed(() => stylex.props(styles.root))
const tableSx = computed(() => stylex.props(styles.table))
const captionSx = computed(() => stylex.props(styles.caption))
const headSx = computed(() => stylex.props(styles.head))
const thSx = computed(() => stylex.props(styles.th, props.size === 'sm' && styles.thSm))
const tdSx = computed(() => stylex.props(styles.td, props.size === 'sm' && styles.tdSm))
const selectThSx = computed(() =>
  stylex.props(styles.th, props.size === 'sm' && styles.thSm, styles.selectCell),
)
const selectTdSx = computed(() =>
  stylex.props(styles.td, props.size === 'sm' && styles.tdSm, styles.selectCell),
)
const rowSx = computed(() => stylex.props(styles.row))
const sortButtonSx = computed(() => stylex.props(styles.sortButton, focus.subtle))
const sortIconSx = computed(() => stylex.props(styles.sortIcon))
const checkboxCellSx = computed(() => stylex.props(styles.checkboxCell))
const emptyCellSx = computed(() => stylex.props(styles.emptyCell))

function cellValueOf(row: T, column: NvDataTableColumn<T>, index: number): unknown {
  if (column.value) return column.value(row, index)
  return (row as Record<string, unknown>)[column.key]
}

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === ''
}

function compareValues(left: unknown, right: unknown): number {
  if (typeof left === 'number' && typeof right === 'number') return left - right
  if (left instanceof Date && right instanceof Date) return left.getTime() - right.getTime()
  return String(left).localeCompare(String(right), undefined, { numeric: true })
}

function rowKeyOf(entry: RowEntry): NvDataTableRowKey {
  if (typeof props.rowKey === 'function') return props.rowKey(entry.row, entry.index)
  if (props.rowKey !== undefined) {
    const value = (entry.row as Record<string, unknown>)[props.rowKey as string]
    return typeof value === 'number' ? value : String(value)
  }
  return entry.index
}

function isEntrySelected(entry: RowEntry): boolean {
  return selectedSet.value.has(rowKeyOf(entry))
}

function isSortable(column: NvDataTableColumn<T>): boolean {
  return column.sortable ?? props.sortable
}

function sortDirectionOf(column: NvDataTableColumn<T>): 'asc' | 'desc' | null {
  const sort = currentSort.value
  return sort && sort.key === column.key ? sort.direction : null
}

function ariaSortOf(column: NvDataTableColumn<T>): 'ascending' | 'descending' | undefined {
  const direction = sortDirectionOf(column)
  if (direction === 'asc') return 'ascending'
  if (direction === 'desc') return 'descending'
  return undefined
}

function toggleSort(column: NvDataTableColumn<T>) {
  if (!isSortable(column)) return
  const sort = currentSort.value
  let next: NvDataTableSort | null
  if (!sort || sort.key !== column.key) {
    next = { key: column.key, direction: 'asc' }
  } else if (sort.direction === 'asc') {
    next = { key: column.key, direction: 'desc' }
  } else {
    next = null
  }
  if (props.sort === undefined) innerSort.value = next
  emit('update:sort', next)
  emit('sortChange', next)
}

function commitSelection(next: NvDataTableRowKey[]) {
  if (props.selected === undefined) innerSelected.value = next
  emit('update:selected', next)
  emit('selectChange', next)
}

function onHeaderChecked(checked: CheckedState) {
  commitSelection(checked === false ? [] : entries.value.map((entry) => rowKeyOf(entry)))
}

function onEntryChecked(entry: RowEntry, checked: CheckedState) {
  const key = rowKeyOf(entry)
  const next = new Set(selectedSet.value)
  if (checked === false) next.delete(key)
  else next.add(key)
  commitSelection([...next])
}

function alignSx(column: NvDataTableColumn<T>) {
  return stylex.props(
    column.align === 'center' && styles.alignCenter,
    column.align === 'right' && styles.alignRight,
  )
}

function widthStyle(column: NvDataTableColumn<T>) {
  if (column.width === undefined) return undefined
  return { width: typeof column.width === 'number' ? `${column.width}px` : column.width }
}

function displayValue(value: unknown): string {
  if (isEmpty(value)) return '—'
  if (value instanceof Date) return value.toLocaleDateString()
  return String(value)
}
</script>

<template>
  <div
    v-bind="$attrs"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <table :class="tableSx.className" :style="tableSx.style">
      <caption v-if="caption" :class="captionSx.className" :style="captionSx.style">
        {{
          caption
        }}
      </caption>
      <thead :class="headSx.className" :style="headSx.style">
        <tr>
          <th
            v-if="selectable"
            scope="col"
            :class="[selectThSx.className]"
            :style="[selectThSx.style]"
          >
            <NvCheckbox
              :checked="headerChecked"
              aria-label="全选"
              @update:checked="onHeaderChecked"
            />
          </th>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            :aria-sort="ariaSortOf(column)"
            :class="[thSx.className, alignSx(column).className]"
            :style="[thSx.style, widthStyle(column), alignSx(column).style]"
          >
            <slot :name="`header-${column.key}`" :column="column">
              <button
                v-if="isSortable(column)"
                type="button"
                :class="sortButtonSx.className"
                :style="sortButtonSx.style"
                @click="toggleSort(column)"
              >
                <span>{{ column.title }}</span>
                <ArrowUpIcon
                  v-if="sortDirectionOf(column) === 'asc'"
                  :size="12"
                  aria-hidden="true"
                  :class="sortIconSx.className"
                  :style="sortIconSx.style"
                />
                <ArrowDownIcon
                  v-else-if="sortDirectionOf(column) === 'desc'"
                  :size="12"
                  aria-hidden="true"
                  :class="sortIconSx.className"
                  :style="sortIconSx.style"
                />
                <ArrowUpDownIcon
                  v-else
                  :size="12"
                  aria-hidden="true"
                  :class="sortIconSx.className"
                  :style="sortIconSx.style"
                />
              </button>
              <span v-else>{{ column.title }}</span>
            </slot>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="entry in entries"
          :key="rowKeyOf(entry)"
          :data-selected="isEntrySelected(entry) || undefined"
          :class="rowSx.className"
          :style="rowSx.style"
        >
          <td v-if="selectable" :class="[selectTdSx.className]" :style="[selectTdSx.style]">
            <span :class="checkboxCellSx.className" :style="checkboxCellSx.style">
              <NvCheckbox
                :checked="isEntrySelected(entry)"
                :aria-label="`选择第 ${entry.index + 1} 行`"
                @update:checked="(checked: CheckedState) => onEntryChecked(entry, checked)"
              />
            </span>
          </td>
          <td
            v-for="column in columns"
            :key="column.key"
            :class="[tdSx.className, alignSx(column).className]"
            :style="[tdSx.style, widthStyle(column), alignSx(column).style]"
          >
            <slot
              :name="`cell-${column.key}`"
              :row="entry.row"
              :column="column"
              :value="cellValueOf(entry.row, column, entry.index)"
              :index="entry.index"
            >
              {{ displayValue(cellValueOf(entry.row, column, entry.index)) }}
            </slot>
          </td>
        </tr>
        <tr v-if="entries.length === 0">
          <td :colspan="colSpan" :class="emptyCellSx.className" :style="emptyCellSx.style">
            <slot name="empty" :columns="columns">{{ emptyText }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
