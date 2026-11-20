<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './StationBar.styles'
import type { StationStatus } from './types'

const props = withDefaults(
  defineProps<{
    station: string
    code?: string
    status?: StationStatus
    statusLabel?: string
    meta?: string
    active?: boolean
  }>(),
  { status: 'idle', active: false },
)

const statusText: Record<StationStatus, string> = {
  idle: '空闲',
  running: '运行中',
  paused: '暂停',
  alarm: '报警',
  offline: '离线',
}

const dotStyles = {
  idle: styles.dotIdle,
  running: styles.dotRunning,
  paused: styles.dotPaused,
  alarm: styles.dotAlarm,
  offline: styles.dotOffline,
} as const

const chipStyles = {
  idle: styles.chipIdle,
  running: styles.chipRunning,
  paused: styles.chipPaused,
  alarm: styles.chipAlarm,
  offline: styles.chipOffline,
} as const

const rootSx = computed(() => stylex.props(styles.root, props.active && styles.active))
const dotSx = computed(() => stylex.props(styles.dot, dotStyles[props.status]))
const chipSx = computed(() => stylex.props(styles.chip, chipStyles[props.status]))
const label = computed(() => props.statusLabel ?? statusText[props.status])
</script>

<template>
  <div :class="rootSx.className" :style="rootSx.style">
    <span v-if="$slots.icon" :class="stylex.props(styles.icon).className">
      <slot name="icon" />
    </span>
    <span :class="dotSx.className" :style="dotSx.style" aria-hidden="true" />
    <div :class="stylex.props(styles.identity).className">
      <div :class="stylex.props(styles.nameRow).className">
        <span :class="stylex.props(styles.name).className">{{ station }}</span>
        <span v-if="code" :class="stylex.props(styles.code).className">{{ code }}</span>
      </div>
      <span v-if="meta || $slots.meta" :class="stylex.props(styles.meta).className">
        <slot name="meta">{{ meta }}</slot>
      </span>
    </div>
    <span :class="chipSx.className" :style="chipSx.style">{{ label }}</span>
    <div v-if="$slots.actions" :class="stylex.props(styles.actions).className">
      <slot name="actions" />
    </div>
  </div>
</template>
