<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { NvScreenStatusHero } from '@nerv-iip/ui'

type Tone = 'neutral' | 'cyan' | 'green' | 'amber' | 'red'
type Rhythm = 'still' | 'steady' | 'slow' | 'fast'
type Display = { label: string; tone: Tone; rhythm: Rhythm }

const sources: { name: string; normal: Display; offline: number | null }[] = [
  {
    name: '城市文化空间',
    normal: { label: '开放中', tone: 'green', rhythm: 'steady' },
    offline: 0,
  },
  {
    name: '公共交通枢纽',
    normal: { label: '通行平稳', tone: 'cyan', rhythm: 'steady' },
    offline: 2,
  },
]
const sourceIndex = shallowRef(0)
const state = shallowRef<'normal' | 'attention' | 'alarm' | 'unknown'>('normal')
const offlineCount = shallowRef<number | null>(0)
const longLabel = shallowRef(false)
const viewed = shallowRef(false)
const source = computed(() => sources[sourceIndex.value]!)
const display = computed<Display>(() => {
  if (state.value === 'attention') return { label: '需要留意', tone: 'amber', rhythm: 'slow' }
  if (state.value === 'alarm') return { label: '请立即处理', tone: 'red', rhythm: 'fast' }
  if (state.value === 'unknown') return { label: '状态待确认', tone: 'neutral', rhythm: 'still' }
  return source.value.normal
})
const label = computed(() =>
  longLabel.value
    ? `${source.value.name} · ${display.value.label} · 请留意现场更新`
    : display.value.label,
)
const offlineHint = computed(() => {
  if (offlineCount.value === null) return '失联数量待确认'
  if (offlineCount.value === 0) return null
  return `${offlineCount.value} 处数据失联`
})
function selectSource(index: number) {
  sourceIndex.value = index
  state.value = 'normal'
  offlineCount.value = sources[index]!.offline
  longLabel.value = false
  viewed.value = false
}
</script>

<template>
  <main class="status-hero-demo">
    <header>
      <p>空间运行概况</p>
      <h1>此刻的现场</h1>
    </header>
    <div class="status-hero-tools" aria-label="现场来源与状态">
      <button
        name="source-gallery"
        type="button"
        :aria-pressed="sourceIndex === 0"
        @click="selectSource(0)"
      >
        城市文化空间
      </button>
      <button
        name="source-campus"
        type="button"
        :aria-pressed="sourceIndex === 1"
        @click="selectSource(1)"
      >
        公共交通枢纽
      </button>
      <button name="status-normal" type="button" @click="state = 'normal'">平稳</button>
      <button name="status-attention" type="button" @click="state = 'attention'">留意</button>
      <button name="status-alarm" type="button" @click="state = 'alarm'">紧急</button>
      <button name="status-unknown" type="button" @click="state = 'unknown'">待确认</button>
      <button name="offline-zero" type="button" @click="offlineCount = 0">数据齐全</button>
      <button name="offline-three" type="button" @click="offlineCount = 3">三处失联</button>
      <button name="offline-unknown" type="button" @click="offlineCount = null">数量待确认</button>
      <button name="long-label" type="button" @click="longLabel = !longLabel">长标题</button>
    </div>
    <section class="status-hero-content" aria-label="现场状态展示">
      <div class="status-hero-panel" data-primary-hero>
        <h2>{{ source.name }}</h2>
        <NvScreenStatusHero :tone="display.tone" :rhythm="display.rhythm" :label="label">
          <template v-if="offlineHint" #auxiliary>
            <p>{{ offlineHint }}</p>
            <button name="auxiliary-action" type="button" @click="viewed = true">
              查看现场说明
            </button>
          </template>
        </NvScreenStatusHero>
        <p data-action-feedback role="status">
          {{ viewed ? '已查看现场说明' : '现场信息持续更新' }}
        </p>
      </div>
      <div class="status-hero-panel" data-secondary-hero>
        <h2>另一处空间</h2>
        <NvScreenStatusHero tone="neutral" rhythm="still" label="等候确认" />
      </div>
    </section>
  </main>
</template>

<style scoped>
@layer app {
  .status-hero-demo {
    height: 100%;
    overflow: auto;
    padding: 42px 58px;
    background: var(--nv-scr-bg);
    color: var(--nv-scr-text);
    font-size: 20px;
  }
  .status-hero-demo h1 {
    font-size: 42px;
    line-height: 1.2;
  }
  .status-hero-demo header p {
    color: var(--nv-scr-muted);
  }
  .status-hero-tools {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 28px 0;
  }
  .status-hero-demo button {
    min-height: 44px;
    padding: 8px 15px;
    border: 1px solid var(--nv-scr-line-2);
    border-radius: var(--nv-scr-radius);
    background: var(--nv-scr-bg-accent);
    color: var(--nv-scr-text);
    font: inherit;
    cursor: pointer;
  }
  .status-hero-demo button[aria-pressed='true'],
  .status-hero-demo button:hover {
    border-color: var(--nv-scr-cyan);
  }
  .status-hero-demo button:focus-visible {
    outline: 3px solid var(--nv-scr-cyan);
    outline-offset: 3px;
  }
  .status-hero-content {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }
  .status-hero-panel {
    min-width: 0;
    padding: 28px;
    border: 1px solid var(--nv-scr-line-2);
    border-radius: var(--nv-scr-radius);
    background: var(--nv-scr-panel-a);
    text-align: center;
  }
  .status-hero-panel h2 {
    margin-bottom: 26px;
    font-size: 25px;
  }
  .status-hero-panel p {
    margin: 0 0 12px;
  }
  .status-hero-panel [data-action-feedback] {
    margin-top: 24px;
    color: var(--nv-scr-muted);
  }
  @media (max-width: 800px) {
    .status-hero-demo {
      padding: 24px;
    }
    .status-hero-content {
      grid-template-columns: 1fr;
    }
  }
}
</style>
