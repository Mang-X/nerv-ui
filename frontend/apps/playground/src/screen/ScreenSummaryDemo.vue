<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  NvOeeHero,
  NvScreenPanel,
  NvScreenStatusCard,
  NvScreenButton,
  NvTaktGantt,
} from '@nerv-iip/ui'
import { summarySources, statusFromSource } from './summary-fixtures'
const sourceIndex = shallowRef(0)
const unknown = shallowRef(false)
const long = shallowRef(false)
const periods = shallowRef<'normal' | 'empty' | 'updated'>('normal')
const source = computed(() => summarySources[sourceIndex.value]!)
const card = computed(() => statusFromSource(source.value, unknown.value, long.value))
const rows = computed(() =>
  periods.value === 'empty'
    ? []
    : periods.value === 'updated'
      ? [
          {
            name: source.value.space,
            segs: [
              ['alarm', 10],
              ['idle', 20],
              ['stop', 20],
              ['run', 50],
            ] as NonNullable<typeof source.value.rows>[number]['segs'],
          },
        ]
      : source.value.rows,
)
function toggleLong() {
  long.value = !long.value
  unknown.value = false
}
function restore() {
  unknown.value = false
  long.value = false
  periods.value = 'normal'
}
function selectSource(index: number) {
  sourceIndex.value = index
  restore()
}
</script>

<template>
  <main class="screen-summary">
    <header class="summary-header">
      <div>
        <p>城市空间 · 每一段停留</p>
        <h1>空间使用概况</h1>
      </div>
      <p aria-label="当前概况来源">{{ source.name }}</p>
    </header>
    <div class="summary-tools" aria-label="概况来源与状态">
      <NvScreenButton
        v-for="(item, i) in summarySources"
        :key="item.name"
        :aria-pressed="sourceIndex === i"
        @click="selectSource(i)"
        >{{ item.name }}</NvScreenButton
      >
      <NvScreenButton :aria-pressed="unknown" @click="unknown = true">未知读数</NvScreenButton>
      <NvScreenButton :aria-pressed="long" @click="toggleLong">长文案与大数</NvScreenButton>
      <NvScreenButton @click="periods = 'empty'">空时段</NvScreenButton>
      <NvScreenButton @click="periods = 'updated'">更新时段</NvScreenButton>
      <NvScreenButton @click="restore">恢复读数</NvScreenButton>
    </div>
    <section class="summary-scroll" role="region" aria-label="概况与时段内容" tabindex="0">
      <div class="summary-grid">
        <NvScreenPanel title="总访问"
          ><NvOeeHero
            :label="
              long ? '城市公共文化空间联合服务中心 · 累计总访问人次' : `${source.name} · 总访问`
            "
            :value="unknown ? '—' : long ? '123,456,789' : source.visits"
            unit="人次"
            :delta="unknown ? '' : '较昨日 +8.2%'"
            delta-tone="positive"
            :spark="unknown ? [] : source.spark"
        /></NvScreenPanel>
        <NvScreenPanel title="费用变化"
          ><NvOeeHero
            :label="`${source.name} · 当日费用`"
            :value="unknown ? '—' : source.cost"
            unit="元"
            :delta="unknown ? '' : '较昨日 -5% · 节省'"
            delta-tone="positive"
            :spark="unknown ? [] : source.costSpark"
        /></NvScreenPanel>
        <NvScreenStatusCard v-bind="card" />
        <NvScreenStatusCard
          :name="`${source.space} · 待确认区域`"
          state="待确认"
          label="读数尚未送达"
          tone="idle"
          plan="—"
          actual="—"
          rate="—"
          downtime="—"
          :labels="source.labels"
          unit="人次"
        />
        <NvTaktGantt
          class="summary-timeline"
          :title="long ? '城市公共文化空间联合服务中心 · 今日空间使用时间段' : '今日空间使用时段'"
          :rows="rows"
          :axis="periods === 'empty' ? [] : source.axis"
          :tone-labels="source.toneLabels"
        />
      </div>
      <p v-if="!rows.length" role="status">暂无时段</p>
      <div class="summary-readout" aria-label="时段原文">
        <p v-for="row in rows" :key="row.name">
          {{ row.name }}：<span v-for="(seg, i) in row.segs" :key="i"
            >{{ source.toneLabels[seg[0]] }} {{ seg[1] }}%{{
              i < row.segs.length - 1 ? ' · ' : ''
            }}</span
          >
        </p>
      </div>
      <p class="summary-note">
        — 表示读数未知。费用下降由来源标记为节省；各时段按来源给定的顺序和比例展示。
      </p>
    </section>
    <footer>让空间中的每一次相遇，都有迹可循。</footer>
  </main>
</template>

<style scoped>
@layer app {
  .screen-summary {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 28px 36px;
    background: var(--nv-scr-bg);
    color: var(--nv-scr-text);
  }
  .summary-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 24px;
  }
  .summary-header p {
    color: var(--nv-scr-muted);
    font-size: 15px;
    margin: 0 0 8px;
  }
  .summary-header h1 {
    font-size: 30px;
    font-weight: 600;
    margin: 0;
  }
  .summary-tools {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .summary-scroll {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 3px;
  }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    align-items: start;
  }
  .summary-timeline {
    grid-column: 1 / -1;
  }
  .summary-readout,
  .summary-note,
  .screen-summary footer {
    font-size: 15px;
    color: var(--nv-scr-muted);
    overflow-wrap: anywhere;
  }
  .summary-readout p {
    margin: 12px 0;
  }
  .screen-summary :focus-visible {
    outline: 2px solid var(--nv-scr-cyan);
    outline-offset: 2px;
  }
}
</style>
