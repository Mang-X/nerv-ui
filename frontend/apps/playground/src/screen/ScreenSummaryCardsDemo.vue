<script setup lang="ts">
import { computed, ref } from 'vue'
import { NvScreenSummaryCard, type ScreenSummaryMetric } from '@nerv-ui/ui'
const source = ref('阅读空间')
const count = ref(6)
const variant = ref<'launcher' | 'health' | 'line'>('launcher')
const changed = ref(false)
const long = ref(false)
const result = ref('请选择一个空间')
const cards = computed(() =>
  Array.from({ length: count.value }, (_, index) => ({
    key: `${source.value}-${index}`,
    title: long.value
      ? `${source.value}的周末阅读、展览与公共交流安排`
      : `${source.value} · ${index + 1}`,
    metrics: [
      {
        key: 'arrived',
        label: source.value === '阅读空间' ? '今日到访' : '预约席位',
        value: changed.value ? 0 : 124 + index,
      },
      { key: 'adjust', label: '较上期变化', value: changed.value ? -1.23456 : 2.5, unit: '%' },
      { key: 'pending', label: '待确认', value: null },
    ] satisfies ScreenSummaryMetric[],
  })),
)
</script>
<template>
  <main class="summary-cards-demo">
    <header>
      <h1>空间一瞥</h1>
      <p>查看今天的开放与到访。0 是真实零，— 表示尚未确认。</p>
    </header>
    <div role="group" aria-label="摘要来源与布局" class="summary-cards-tools">
      <button
        v-for="name in ['阅读空间', '共享花园']"
        :key="name"
        type="button"
        :aria-pressed="source === name"
        @click="source = name"
      >
        {{ name }}
      </button>
      <label
        >卡片形式<select v-model="variant">
          <option value="launcher">入口</option>
          <option value="health">概况</option>
          <option value="line">动态</option>
        </select></label
      >
      <label
        >显示数量<select v-model.number="count">
          <option :value="0">0</option>
          <option :value="1">1</option>
          <option :value="6">6</option>
        </select></label
      >
      <button type="button" @click="changed = !changed">更新记录</button>
      <button type="button" :aria-pressed="long" @click="long = !long">完整说明</button>
    </div>
    <p role="status">{{ result }}</p>
    <p v-if="!cards.length" role="status">暂无空间记录</p>
    <div class="summary-cards-grid">
      <NvScreenSummaryCard
        v-for="(card, index) in cards"
        :key="card.key"
        :identity="card.key"
        :title="card.title"
        :variant="variant"
        :metrics="card.metrics"
        :description="
          long ? '欢迎预约周末的阅读与公共交流活动，开放时段请查看场地说明。' : '开放时段与今日安排'
        "
        :status="{
          label: changed ? '等待确认开放时段' : '欢迎到访',
          tone: changed ? 'amber' : 'green',
        }"
        :primary="
          variant === 'health'
            ? {
                key: 'rate',
                label: '预约比例',
                value: changed ? 123.4567 : 62.5,
                unit: '%',
                tone: 'cyan',
              }
            : undefined
        "
        :comparison="
          variant !== 'launcher'
            ? [
                { key: 'a', label: '已预约', value: 25 },
                { key: 'b', label: '可预约', value: 40 },
              ]
            : []
        "
        :progress="variant === 'health' ? (changed ? 123.4567 : 62.5) : null"
        :trend="variant === 'line' ? (changed ? [] : [2, 4, 4, 3, 7, 6]) : undefined"
        trend-label="每小时到访变化"
        :chips="
          variant === 'launcher'
            ? [
                { key: 'east', label: '东侧阅读区', tone: 'green' },
                { key: 'west', label: '西侧交流区', tone: 'amber' },
              ]
            : []
        "
        :chips-label="variant === 'launcher' ? '开放区域' : undefined"
        :dots="
          variant === 'line'
            ? [
                { key: 'north', label: '北侧开放', tone: 'green' },
                { key: 'south', label: '南侧整理中', tone: 'amber' },
              ]
            : []
        "
        :notice="index === 1 ? { label: '部分区域等待开放时间确认', tone: 'red' } : undefined"
        :action-label="variant === 'health' ? undefined : '查看安排'"
        @action="result = `已选择 ${cards.find((item) => item.key === $event)?.title ?? '空间'}`"
      >
        <template #icon><span>◇</span></template>
      </NvScreenSummaryCard>
    </div>
  </main>
</template>
<style scoped>
@layer app {
  .summary-cards-demo {
    padding: 32px 48px;
    color: var(--nv-scr-text);
    font-family: var(--font-sans);
  }
  .summary-cards-demo h1 {
    font-size: 36px;
    margin: 0 0 12px;
  }
  .summary-cards-demo header p {
    color: var(--nv-scr-muted);
  }
  .summary-cards-tools {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
  }
  .summary-cards-tools label {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .summary-cards-tools :is(button, select) {
    min-height: 44px;
    border: 1px solid var(--nv-scr-line-2);
    border-radius: var(--nv-scr-radius);
    background: var(--nv-scr-bg);
    color: var(--nv-scr-text);
    padding: 8px 16px;
  }
  .summary-cards-tools :focus-visible {
    outline: 2px solid var(--nv-scr-cyan);
    outline-offset: 3px;
  }
  .summary-cards-tools [aria-pressed='true'] {
    border-color: var(--nv-scr-cyan);
  }
  .summary-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 440px), 1fr));
    gap: 22px;
  }
}
</style>
