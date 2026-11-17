<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, useSlots } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './AlarmTable.styles'
import type {
  AlarmLevel,
  AlarmLevelLabels,
  AlarmRecord,
  AlarmTableLabels,
  AlarmTone,
} from './types'

const props = withDefaults(
  defineProps<{
    rows: AlarmRecord[]
    labels?: AlarmTableLabels
    levelLabels?: AlarmLevelLabels
    density?: 'md' | 'sm'
    zebra?: boolean
    emptyLabel?: string
    ariaLabel?: string
  }>(),
  {
    labels: () => ({}),
    levelLabels: () => ({}),
    density: 'md',
    zebra: true,
    emptyLabel: '暂无告警',
    ariaLabel: '告警列表',
  },
)

const slots = useSlots()

const defaultLevelLabels: Record<AlarmLevel, string> = {
  critical: '紧急',
  major: '重要',
  minor: '一般',
  info: '提示',
}

const levelStyles: Record<AlarmLevel, stylex.StyleXStyles> = {
  critical: styles.critical,
  major: styles.major,
  minor: styles.minor,
  info: styles.info,
}

const levelDots: Record<AlarmLevel, stylex.StyleXStyles> = {
  critical: styles.dotCritical,
  major: styles.dotMajor,
  minor: styles.dotMinor,
  info: styles.dotInfo,
}

const statusStyles: Record<AlarmTone, stylex.StyleXStyles> = {
  default: styles.statusDefault,
  accent: styles.statusAccent,
  success: styles.statusSuccess,
  warning: styles.statusWarning,
  danger: styles.statusDanger,
}

const hasStatus = computed(() => props.rows.some((row) => row.status !== undefined))
const rootSx = computed(() => stylex.props(styles.root, focus.subtle))
const tableSx = computed(() => stylex.props(styles.table))
const headSx = computed(() => stylex.props(styles.headCell))

function label(key: keyof AlarmTableLabels, fallback: string): string {
  return props.labels[key] ?? fallback
}

function levelLabel(level: AlarmLevel): string {
  return props.levelLabels[level] ?? defaultLevelLabels[level]
}

function levelTdSx(level: AlarmLevel) {
  return stylex.props(
    styles.cell,
    props.density === 'sm' && styles.denseCell,
    styles.firstCell,
    levelStyles[level],
  )
}

function dotSx(level: AlarmLevel) {
  return stylex.props(styles.dot, levelDots[level])
}

function statusSx(tone: AlarmTone | undefined) {
  return stylex.props(statusStyles[tone ?? 'default'])
}

function rowSx(index: number) {
  return stylex.props(styles.bodyRow, props.zebra && index % 2 === 1 && styles.zebra)
}

function cellSx(extra?: stylex.StyleXStyles) {
  return stylex.props(styles.cell, props.density === 'sm' && styles.denseCell, extra)
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
          <th scope="col" :class="headSx.className">{{ label('level', '级别') }}</th>
          <th scope="col" :class="headSx.className">{{ label('time', '时间') }}</th>
          <th scope="col" :class="headSx.className">{{ label('source', '来源') }}</th>
          <th scope="col" :class="headSx.className">{{ label('message', '告警内容') }}</th>
          <th v-if="hasStatus" scope="col" :class="headSx.className">
            {{ label('status', '状态') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!rows.length">
          <td :colspan="hasStatus ? 5 : 4" :class="stylex.props(styles.empty).className">
            {{ emptyLabel }}
          </td>
        </tr>
        <tr
          v-for="(row, index) in rows"
          :key="row.id"
          :class="rowSx(index).className"
          :style="rowSx(index).style"
        >
          <td :class="levelTdSx(row.level).className" :style="levelTdSx(row.level).style">
            <slot name="level" :row="row" :label="levelLabel(row.level)">
              <span :class="stylex.props(styles.levelCell).className">
                <span :class="dotSx(row.level).className" :style="dotSx(row.level).style" aria-hidden="true" />
                {{ levelLabel(row.level) }}
              </span>
            </slot>
          </td>
          <td :class="cellSx(styles.timeCell).className" :style="cellSx(styles.timeCell).style">
            {{ row.time }}
          </td>
          <td :class="cellSx(styles.sourceCell).className" :style="cellSx(styles.sourceCell).style">
            {{ row.source }}
          </td>
          <td :class="cellSx(styles.messageCell).className" :style="cellSx(styles.messageCell).style">
            <slot name="message" :row="row">{{ row.message }}</slot>
          </td>
          <td v-if="hasStatus" :class="cellSx(styles.timeCell).className" :style="cellSx(styles.timeCell).style">
            <slot name="status" :row="row">
              <span :class="statusSx(row.statusTone).className" :style="statusSx(row.statusTone).style">
                {{ row.status ?? '—' }}
              </span>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
