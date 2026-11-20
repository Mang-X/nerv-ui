<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  NvScreenHeatmap,
  NvScreenPanel,
  type ScreenHeatmapCell,
  type ScreenHeatmapThreshold,
} from '@nerv-ui/ui'
const cells = shallowRef<ScreenHeatmapCell[]>([])
const columns = shallowRef(6)
const compactScale = shallowRef(false)
const thresholds = computed<ScreenHeatmapThreshold[]>(() => [
  { min: compactScale.value ? 2 : 4, label: '适中', tone: 'cyan' },
  { min: compactScale.value ? 5 : 8, label: '充实', tone: 'green' },
])
const temperatures: ScreenHeatmapCell[] = Array.from({ length: 12 }, (_, key) => ({
  key,
  label: `${key + 8}:00`,
  value: [17.5, 18, 19, 20.5, null, 21, 22, 23, 24, 23, 21.5, 20][key],
}))
const temperatureBands: ScreenHeatmapThreshold[] = [
  { min: 18, label: '舒适', tone: 'green' },
  { min: 24, label: '偏暖', tone: 'amber' },
]
function restore() {
  cells.value = Array.from({ length: 24 }, (_, key) => ({
    key,
    label: `周三 ${String(key).padStart(2, '0')}:00`,
    value: key === 5 ? null : key % 10,
  }))
}
function replace() {
  cells.value = cells.value.map((cell) => ({
    ...cell,
    value: cell.key === 0 ? 2.5 : cell.value === null ? null : (cell.value ?? 0) + 1,
  }))
}
function unknown() {
  cells.value = cells.value.map((cell) => ({ ...cell, value: null }))
}
restore()
</script>

<template>
  <main class="heatmap-demo">
    <header>
      <h1>一格一刻，看见变化</h1>
      <p>逐格停留或用 Tab 聚焦，查看时间、数值与分档。0 是真实零，— 表示未确认。</p>
    </header>
    <div class="heatmap-tools" role="group" aria-label="阅读记录与显示">
      <button type="button" @click="replace">替换记录</button>
      <button type="button" @click="columns = columns === 6 ? 4 : 6">
        {{ columns === 6 ? '改为四列' : '改为六列' }}
      </button>
      <button type="button" :aria-pressed="compactScale" @click="compactScale = !compactScale">
        调整阅读分档
      </button>
      <button type="button" @click="unknown">标为未知</button>
      <button type="button" @click="cells = []">清空记录</button>
      <button type="button" @click="restore">恢复记录</button>
    </div>
    <div class="heatmap-panels">
      <NvScreenPanel title="阅读时段占用">
        <p>
          从容：低于 {{ compactScale ? 2 : 4 }} 小时；适中：{{
            compactScale ? '2 至不足 5' : '4 至不足 8'
          }}
          小时；充实：至少 {{ compactScale ? 5 : 8 }} 小时。
        </p>
        <NvScreenHeatmap
          :cells="cells"
          :thresholds="thresholds"
          :below="{ label: '从容', tone: 'amber' }"
          :columns="columns"
          unit="小时"
          unknown-label="未确认"
          empty-label="当前没有阅读记录"
          axis-start="周三 00:00"
          axis-end="周三 23:00"
        />
      </NvScreenPanel>
      <NvScreenPanel title="展厅温度">
        <p>偏凉：低于 18°C；舒适：18 至不足 24°C；偏暖：至少 24°C。温度含义由场地说明提供。</p>
        <NvScreenHeatmap
          :cells="temperatures"
          :thresholds="temperatureBands"
          :below="{ label: '偏凉', tone: 'cyan' }"
          :columns="4"
          unit="°C"
          unknown-label="未确认"
          axis-start="周三 08:00"
          axis-end="周三 19:00"
        />
      </NvScreenPanel>
    </div>
  </main>
</template>

<style scoped>
@layer app {
  .heatmap-demo {
    padding: 40px;
    color: var(--nv-scr-text);
  }
  .heatmap-demo h1 {
    font-size: 36px;
  }
  .heatmap-demo p {
    font-size: 18px;
    color: var(--nv-scr-muted);
    overflow-wrap: anywhere;
  }
  .heatmap-tools {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 24px 0;
  }
  .heatmap-tools button {
    padding: 10px 18px;
    min-height: 44px;
    font-size: 18px;
    border: 1px solid var(--nv-scr-line-2);
    border-radius: var(--nv-scr-radius);
    color: var(--nv-scr-text);
    background: var(--nv-scr-bg-accent);
  }
  .heatmap-tools button:focus-visible {
    outline: 2px solid var(--nv-scr-cyan);
    outline-offset: 3px;
  }
  .heatmap-panels {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 24px;
    align-items: start;
  }
  .heatmap-panels > * {
    min-width: 0;
  }
}
</style>
