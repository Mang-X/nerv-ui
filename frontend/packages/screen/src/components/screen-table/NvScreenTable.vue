<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, useSlots } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './ScreenTable.styles'
import type {
  ScreenTableAlign,
  ScreenTableCell,
  ScreenTableColumn,
  ScreenTableRow,
  ScreenTableTone,
} from './types'

const props = withDefaults(
  defineProps<{
    columns: ScreenTableColumn[]
    rows: ScreenTableRow[]
    /** Column key that identifies a row. */
    rowKey?: string
    /** Row height preset; `sm` halves vertical padding for dense walls. */
    density?: 'md' | 'sm'
    zebra?: boolean
    /** Message shown when `rows` is empty. */
    emptyLabel?: string
    ariaLabel?: string
  }>(),
  { rowKey: 'id', density: 'md', zebra: true, emptyLabel: '暂无数据', ariaLabel: '数据表' },
)

const slots = useSlots()

const alignStyles: Record<ScreenTableAlign, 'left' | 'center' | 'right'> = {
  start: 'left',
  center: 'center',
  end: 'right',
}

const toneText = {
  accent: styles.textAccent,
  success: styles.textSuccess,
  warning: styles.textWarning,
  danger: styles.textDanger,
} as const

const toneDot = {
  accent: styles.dotAccent,
  success: styles.dotSuccess,
  warning: styles.dotWarning,
  danger: styles.dotDanger,
} as const

const rootSx = computed(() => stylex.props(styles.root, focus.subtle))
const tableSx = computed(() => stylex.props(styles.table))

interface RenderCell {
  column: ScreenTableColumn
  slotName: string
  hasSlot: boolean
  value: string
  tone: ScreenTableTone
  status: boolean
  raw: ScreenTableCell
}

interface RenderRow {
  key: string
  cells: RenderCell[]
}

function normalizeCell(raw: ScreenTableRow[string]): ScreenTableCell {
  if (raw !== null && typeof raw === 'object') return raw
  return { value: raw as ScreenTableCell['value'] }
}

function displayValue(value: ScreenTableCell['value']): string {
  return value === null || value === undefined || value === '' ? '—' : String(value)
}

function normalizeWidth(width: number | string | undefined): string | undefined {
  if (width === undefined) return undefined
  return typeof width === 'number' ? `${width}px` : width
}

function rowIdentity(row: ScreenTableRow, index: number): string {
  const raw = row[props.rowKey]
  const value = raw !== null && typeof raw === 'object' ? raw.value : raw
  return value === null || value === undefined ? String(index) : String(value)
}

const viewRows = computed<RenderRow[]>(() =>
  props.rows.map((row, index) => ({
    key: rowIdentity(row, index),
    cells: props.columns.map((column) => {
      const raw = normalizeCell(row[column.key])
      return {
        column,
        slotName: `cell-${column.key}`,
        hasSlot: Boolean(slots[`cell-${column.key}`]),
        value: displayValue(raw.value),
        tone: raw.tone ?? 'default',
        status: column.variant === 'status' || raw.dot === true,
        raw,
      }
    }),
  })),
)

function headSx(column: ScreenTableColumn) {
  return stylex.props(styles.headCell)
}

function headStyle(column: ScreenTableColumn) {
  return { textAlign: alignStyles[column.align ?? 'start'], width: normalizeWidth(column.width) }
}

function rowSx(index: number) {
  return stylex.props(styles.bodyRow, props.zebra && index % 2 === 1 && styles.zebra)
}

function tdSx(dense: boolean, numeric: boolean, tone: ScreenTableTone = 'default') {
  return stylex.props(
    styles.cell,
    dense && styles.denseCell,
    numeric && styles.numeric,
    toneStyle(tone),
  )
}

function cellStyle(column: ScreenTableColumn) {
  return { textAlign: alignStyles[column.align ?? 'start'] }
}

function toneStyle(tone: ScreenTableTone) {
  return tone === 'default' ? null : toneText[tone]
}

function dotSx(tone: ScreenTableTone) {
  return stylex.props(styles.statusDot, tone === 'default' ? null : toneDot[tone])
}
</script>

<template>
  <div
    :class="rootSx.className"
    :style="rootSx.style"
    tabindex="0"
    role="region"
    :aria-label="ariaLabel"
  >
    <table :class="tableSx.className" :style="tableSx.style">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            :class="headSx(column).className"
            :style="[headSx(column).style, headStyle(column)]"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!viewRows.length">
          <td :colspan="Math.max(1, columns.length)" :class="stylex.props(styles.empty).className">
            {{ emptyLabel }}
          </td>
        </tr>
        <tr
          v-for="(row, rowIndex) in viewRows"
          :key="row.key"
          :class="rowSx(rowIndex).className"
          :style="rowSx(rowIndex).style"
        >
          <template v-for="entry in row.cells" :key="entry.column.key">
            <td
              v-if="entry.hasSlot"
              :class="tdSx(density === 'sm', true).className"
              :style="[tdSx(density === 'sm', true).style, cellStyle(entry.column)]"
            >
              <slot
                :name="entry.slotName"
                :row="rows[rowIndex]"
                :value="entry.raw.value"
                :cell="entry.raw"
                :index="rowIndex"
              />
            </td>
            <td
              v-else-if="entry.status"
              :class="tdSx(density === 'sm', false).className"
              :style="[tdSx(density === 'sm', false).style, cellStyle(entry.column)]"
            >
              <span :class="stylex.props(styles.statusCell).className">
                <span
                  :class="dotSx(entry.tone).className"
                  :style="dotSx(entry.tone).style"
                  aria-hidden="true"
                />
                <span
                  :class="stylex.props(styles.label, toneStyle(entry.tone)).className"
                  :style="stylex.props(styles.label, toneStyle(entry.tone)).style"
                >
                  {{ entry.value }}
                </span>
              </span>
            </td>
            <td
              v-else
              :class="tdSx(density === 'sm', entry.column.align === 'end', entry.tone).className"
              :style="[tdSx(density === 'sm', entry.column.align === 'end', entry.tone).style, cellStyle(entry.column)]"
            >
              {{ entry.value }}
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>
