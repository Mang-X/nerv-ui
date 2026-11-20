<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  NvScreenTrendChart,
  NvScreenBarChart,
  NvScreenDonut,
  NvScreenPareto,
  NvScreenPanel,
  NvScreenButton,
} from '@nerv-ui/ui'
import { arrivalData, chartRanges, distributions } from './chart-fixtures'

const source = shallowRef('reading')
const range = shallowRef('day')
const shape = shallowRef('full')
const missing = shallowRef(false)
const autoplay = shallowRef(true)
const compare = shallowRef(false)
const distribution = shallowRef<keyof typeof distributions>('multi')
const legend = shallowRef(true)
const data = computed(() => {
  const raw = arrivalData(source.value, range.value)
  const n = shape.value === 'empty' ? 0 : shape.value === 'short' ? 2 : raw.actual.length
  const actual = raw.actual.slice(0, n)
  const plan = raw.plan.slice(0, missing.value ? Math.min(1, n) : n)
  const extra = raw.extra.slice(0, missing.value ? Math.min(2, n) : n)
  // yLabels is display text; the host matches the documented rounded data scale.
  const peak = Math.max(1, ...actual, ...plan, ...extra)
  const magnitude = 10 ** Math.floor(Math.log10(peak))
  const top = Math.ceil(peak / magnitude) * magnitude
  const yLabels = Array.from({ length: 6 }, (_, i) => ((top * (5 - i)) / 5).toLocaleString('en-US'))
  return { actual, plan, extra, points: raw.points.slice(0, n), yLabels }
})
const extra = computed(() => [
  { label: '线上参与', color: 'var(--nv-scr-amber)', data: data.value.extra },
])
const bars = computed(() => [
  { label: '现场到访', color: 'var(--nv-scr-cyan)', data: data.value.actual },
  { label: '预约参考', color: 'var(--nv-scr-indigo)', data: data.value.plan },
])
const content = computed(() => distributions[distribution.value])
const secondary = arrivalData('gallery', 'weeks')
const number = (value: number | undefined) => (value == null ? '—' : value.toLocaleString('en-US'))
</script>

<template>
  <main class="screen-charts">
    <header class="charts-header">
      <div>
        <p>城市文化空间 · 本地观察</p>
        <h1>内容分布与到访趋势</h1>
      </div>
      <p aria-label="数据身份">
        {{ source }}/{{ range }}/{{ data.points.length }} · {{ missing ? '部分缺测' : '完整通道' }}
      </p>
    </header>
    <div class="charts-tools" aria-label="图表数据操作">
      <NvScreenButton @click="source = source === 'reading' ? 'gallery' : 'reading'"
        >替换来源</NvScreenButton
      >
      <NvScreenButton @click="shape = 'short'">缩短为两点</NvScreenButton>
      <NvScreenButton @click="shape = 'empty'">清空数据</NvScreenButton>
      <NvScreenButton @click="shape = 'full'">恢复数据</NvScreenButton>
      <NvScreenButton :aria-pressed="missing" @click="missing = !missing">部分缺测</NvScreenButton>
      <NvScreenButton :aria-pressed="autoplay" @click="autoplay = !autoplay"
        >柱图巡显</NvScreenButton
      >
      <NvScreenButton :aria-pressed="compare" @click="compare = !compare"
        >双实例对照</NvScreenButton
      >
      <NvScreenButton @click="distribution = 'multi'">多类内容</NvScreenButton>
      <NvScreenButton @click="distribution = 'single'">单类内容</NvScreenButton>
      <NvScreenButton @click="distribution = 'zero'">零值内容</NvScreenButton>
      <NvScreenButton @click="distribution = 'replaced'">替换内容</NvScreenButton>
      <NvScreenButton :aria-pressed="legend" @click="legend = !legend">内容图例</NvScreenButton>
    </div>
    <section class="charts-scroll" role="region" aria-label="图表与点值" tabindex="0">
      <div class="charts-grid">
        <NvScreenTrendChart
          class="charts-trend"
          v-model:range="range"
          title="到访趋势（人次）"
          :actual="data.actual"
          :plan="data.plan"
          :series="extra"
          :x-labels="data.points"
          :hover-labels="data.points"
          :y-labels="data.yLabels"
          :ranges="chartRanges"
          :tooltip="false"
          actual-label="现场到访"
          plan-label="预约参考"
        />
        <NvScreenPanel title="内容分布（次）"
          ><NvScreenDonut :segments="content.segments" :legend="legend" :size="180"
            ><b class="charts-total">{{ content.total }}</b
            ><span>内容到访</span></NvScreenDonut
          >
          <p class="charts-note">图例与中心值随内容来源替换。</p></NvScreenPanel
        >
        <NvScreenPanel title="分段到访（人次）" class="charts-bar-panel"
          ><NvScreenBarChart
            class="charts-bars"
            :series="bars"
            :x-labels="data.points"
            :hover-labels="data.points"
            :autoplay="autoplay"
            :autoplay-ms="1800"
        /></NvScreenPanel>
        <NvScreenPanel title="内容 TOP 与长尾"
          ><NvScreenPareto :items="content.items" :total="content.total" unit="次" />
          <p class="charts-note">顺序、百分比与全量口径由本地来源提供。</p></NvScreenPanel
        >
        <template v-if="compare">
          <NvScreenTrendChart
            title="展厅对照 · 独立实例"
            :actual="secondary.actual"
            :plan="secondary.plan"
            :x-labels="secondary.points"
            :hover-labels="secondary.points"
            :y-labels="secondary.yLabels"
            :tooltip="false"
            :tabs="false"
            actual-label="现场到访"
            plan-label="预约参考"
          />
          <NvScreenPanel title="展厅分段 · 独立实例" class="charts-bar-panel"
            ><NvScreenBarChart
              class="charts-bars"
              :series="[
                { label: '展厅到访', color: 'var(--nv-scr-indigo)', data: secondary.actual },
              ]"
              :x-labels="secondary.points"
              :hover-labels="secondary.points"
          /></NvScreenPanel>
        </template>
      </div>
      <details class="charts-readout" open>
        <summary>点值原文 · 当前来源</summary>
        <div aria-label="点值原文">
          <p v-if="!data.points.length">暂无点值</p>
          <p v-for="(point, i) in data.points" :key="point">
            {{ point }} · 现场到访 {{ number(data.actual[i]) }} · 预约参考
            {{ number(data.plan[i]) }} · 线上参与 {{ number(data.extra[i]) }}
          </p>
        </div>
      </details>
    </section>
    <footer>0 是真实读数，— 表示该通道缺测。悬停优先于柱图巡显；低动效模式保留手动取值。</footer>
  </main>
</template>

<style scoped>
@layer app {
  .screen-charts {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 28px 36px;
    background: var(--nv-scr-bg);
    color: var(--nv-scr-text);
  }
  .charts-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 24px;
  }
  .charts-header p {
    color: var(--nv-scr-muted);
    font-size: 15px;
    margin: 0 0 8px;
  }
  .charts-header h1 {
    font-size: 30px;
    font-weight: 600;
    margin: 0;
  }
  .charts-tools {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .charts-scroll {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 3px;
  }
  .charts-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    gap: 20px;
    grid-auto-rows: 300px;
  }
  .charts-bar-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .charts-bars {
    flex: 1;
    height: auto;
    min-height: 0;
  }
  .charts-total {
    font-size: 32px;
    font-variant-numeric: tabular-nums;
    color: var(--nv-scr-cyan);
  }
  .charts-note {
    color: var(--nv-scr-muted);
    font-size: 14px;
    margin-top: 22px;
  }
  .charts-readout {
    font-size: 15px;
    color: var(--nv-scr-muted);
    margin-top: 18px;
  }
  .charts-readout p {
    margin: 5px 0;
    overflow-wrap: anywhere;
  }
  .screen-charts footer {
    font-size: 14px;
    color: var(--nv-scr-muted);
  }
  .screen-charts :focus-visible {
    outline: 2px solid var(--nv-scr-cyan);
    outline-offset: 2px;
  }
}
</style>
