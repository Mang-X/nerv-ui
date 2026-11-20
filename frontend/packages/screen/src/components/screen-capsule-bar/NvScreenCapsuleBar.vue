<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './CapsuleBar.styles'
import type { ScreenCapsuleItem, ScreenCapsuleTone } from './types'

/**
 * 大屏胶囊进度条：每行是标题、圆角轨道与填充，右侧是百分比。
 * 颜色只做辅助——数值始终显示，所以它不是纯靠颜色传信息。
 */
const props = withDefaults(
  defineProps<{ items?: ScreenCapsuleItem[]; suffix?: string }>(),
  {
    suffix: '%',
    items: () => [
      { label: '焊接线 A', value: 93, tone: 'cyan' },
      { label: '装配线 B', value: 76, tone: 'indigo' },
      { label: 'CNC 线 C', value: 41, tone: 'amber' },
      { label: '涂装线 D', value: 88, tone: 'green' },
    ],
  },
)

const key = (tone: ScreenCapsuleTone) =>
  `${tone[0].toUpperCase()}${tone.slice(1)}` as 'Cyan' | 'Indigo' | 'Green' | 'Amber' | 'Red'

const rows = computed(() =>
  props.items.map((item) => {
    const tone = item.tone ?? 'cyan'
    const pct = Math.max(0, Math.min(100, item.value))
    return {
      ...item,
      tone,
      pct,
      fill: stylex.props(styles.fill, styles[`fill${key(tone)}`]),
      value: stylex.props(styles.value, styles[`value${key(tone)}`]),
    }
  }),
)
const sx = computed(() => ({
  root: stylex.props(styles.root),
  row: stylex.props(styles.row),
  label: stylex.props(styles.label),
  track: stylex.props(styles.track),
}))
</script>

<template>
  <div :class="sx.root.className" :style="sx.root.style">
    <div v-for="(r, i) in rows" :key="i" :class="sx.row.className" :style="sx.row.style">
      <span :class="sx.label.className" :style="sx.label.style" :title="r.label">{{ r.label }}</span>
      <span :class="sx.track.className" :style="sx.track.style">
        <span
          v-if="r.pct > 0"
          :class="r.fill.className"
          :style="[r.fill.style, { width: `${r.pct}%` }]"
        />
      </span>
      <span :class="r.value.className" :style="r.value.style">{{ r.value }}{{ props.suffix }}</span>
    </div>
  </div>
</template>
