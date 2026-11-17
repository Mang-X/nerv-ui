<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { formatOptional } from '../../charts/geometry'
import NvScreenStatusTag from '../screen-status-tag/NvScreenStatusTag.vue'
import { styles } from './ScreenStageFlow.styles'
import type { StageFlowStage, StageFlowTone } from './types'

const props = withDefaults(
  defineProps<{
    stages: StageFlowStage[]
    /** Separator glyph between stages; empty string removes it. */
    connector?: string
    ariaLabel?: string
  }>(),
  { connector: '›', ariaLabel: '工位流转' },
)

const stageTones: Record<StageFlowTone, stylex.StyleXStyles | null> = {
  default: null,
  accent: styles.accent,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
}

const valueTones: Record<StageFlowTone, stylex.StyleXStyles | null> = {
  default: null,
  accent: styles.valueToneAccent,
  success: styles.valueToneSuccess,
  warning: styles.valueToneWarning,
  danger: styles.valueToneDanger,
}

const rootSx = computed(() => stylex.props(styles.root))

function stageSx(stage: StageFlowStage) {
  return stylex.props(styles.stage, stageTones[stage.status?.tone ?? 'default'])
}

function valueSx(stage: StageFlowStage) {
  return stylex.props(styles.value, valueTones[stage.status?.tone ?? 'default'])
}

function stageValue(stage: StageFlowStage): string {
  return formatOptional(stage.value, { unit: stage.unit })
}
</script>

<template>
  <div :class="rootSx.className" :style="rootSx.style" role="group" :aria-label="ariaLabel">
    <template v-for="(stage, index) in stages" :key="stage.key">
      <div :class="stageSx(stage).className" :style="stageSx(stage).style" data-stage>
        <div :class="stylex.props(styles.heading).className">
          <span :class="stylex.props(styles.label).className" :title="stage.label">{{ stage.label }}</span>
          <NvScreenStatusTag
            v-if="stage.status"
            :label="stage.status.label"
            :tone="stage.status.tone"
            size="sm"
          />
        </div>
        <div :class="stylex.props(styles.valueRow).className">
          <b :class="valueSx(stage).className" :style="valueSx(stage).style">{{ stageValue(stage) }}</b>
        </div>
      </div>
      <span
        v-if="index < stages.length - 1 && connector"
        :class="stylex.props(styles.connector).className"
        aria-hidden="true"
        data-stage-connector
      >{{ connector }}</span>
    </template>
  </div>
</template>
