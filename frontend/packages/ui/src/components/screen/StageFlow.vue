<script setup lang="ts">
import StatusTag from './StatusTag.vue'

export interface ScreenStage {
  /** Stable host identity, independent of display label and order. */
  key: string | number
  label: string
  value?: number | null
  status?: {
    label: string
    tone: 'cyan' | 'green' | 'amber' | 'red'
  }
}

withDefaults(defineProps<{ stages: readonly ScreenStage[]; connector?: string }>(), {
  connector: '›',
})
const quantity = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 3 })
function display(value: unknown): string {
  return typeof value === 'number' && Number.isFinite(value) ? quantity.format(value) : '—'
}
</script>

<template>
  <div class="nv-scr-stage-flow" data-slot="nv-screen-stage-flow" role="group">
    <template v-for="(stage, index) in stages" :key="stage.key">
      <div class="nv-scr-stage-flow-stage" :class="stage.status?.tone" data-stage>
        <div class="nv-scr-stage-flow-heading">
          <span class="nv-scr-stage-flow-label">{{ stage.label }}</span>
          <StatusTag
            class="nv-scr-stage-flow-status"
            v-if="stage.status"
            :label="stage.status.label"
            :tone="stage.status.tone"
          />
        </div>
        <b class="nv-scr-stage-flow-value" data-stage-value>{{ display(stage.value) }}</b>
      </div>
      <span
        v-if="index < stages.length - 1 && connector"
        class="nv-scr-stage-flow-connector"
        data-stage-connector
        aria-hidden="true"
        >{{ connector }}</span
      >
    </template>
  </div>
</template>

<style scoped>
@layer nv-components {
  .nv-scr-stage-flow {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    min-width: 0;
    color: var(--nv-scr-text-2);
  }
  .nv-scr-stage-flow-stage {
    display: flex;
    flex: 1 1 66px;
    min-width: 0;
    flex-direction: column;
    gap: 3px;
    overflow-wrap: anywhere;
  }
  .nv-scr-stage-flow-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    color: var(--nv-scr-muted);
  }
  .nv-scr-stage-flow-status {
    height: auto;
    min-height: 22px;
    max-width: 100%;
    padding-block: 4px;
    line-height: 1.3;
  }
  .nv-scr-stage-flow-value {
    font-size: 16px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .nv-scr-stage-flow-stage.cyan .nv-scr-stage-flow-value {
    color: var(--nv-scr-cyan);
  }
  .nv-scr-stage-flow-stage.green .nv-scr-stage-flow-value {
    color: var(--nv-scr-green);
  }
  .nv-scr-stage-flow-stage.amber .nv-scr-stage-flow-value {
    color: var(--nv-scr-amber);
  }
  .nv-scr-stage-flow-stage.red .nv-scr-stage-flow-value {
    color: var(--nv-scr-red);
  }
  .nv-scr-stage-flow-connector {
    flex: none;
    font-size: 15px;
    line-height: 1;
    opacity: 0.7;
    color: var(--nv-scr-faint);
  }
}
</style>
