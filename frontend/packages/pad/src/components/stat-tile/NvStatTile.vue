<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './StatTile.styles'
import type { StatTileTone } from './types'

const props = withDefaults(
  defineProps<{
    label: string
    value: string | number
    unit?: string
    hint?: string
    tone?: StatTileTone
    active?: boolean
  }>(),
  { tone: 'default', active: false },
)

const rootSx = computed(() => stylex.props(styles.root, props.active && styles.active))
const valueSx = computed(() =>
  stylex.props(styles.value, props.tone === 'default' ? null : styles[props.tone]),
)
</script>

<template>
  <div :class="rootSx.className" :style="rootSx.style">
    <div :class="stylex.props(styles.header).className">
      <span :class="stylex.props(styles.label).className">{{ label }}</span>
      <span v-if="$slots.icon" :class="stylex.props(styles.icon).className">
        <slot name="icon" />
      </span>
    </div>
    <div :class="stylex.props(styles.valueRow).className">
      <span :class="valueSx.className" :style="valueSx.style">{{ value }}</span>
      <span v-if="unit" :class="stylex.props(styles.unit).className">{{ unit }}</span>
    </div>
    <div v-if="hint || $slots.hint" :class="stylex.props(styles.hint).className">
      <slot name="hint">{{ hint }}</slot>
    </div>
    <slot />
  </div>
</template>
