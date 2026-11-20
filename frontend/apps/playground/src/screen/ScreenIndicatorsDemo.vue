<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, shallowRef, watch } from 'vue'
import {
  NvScreenHeader,
  NvScreenPanel,
  NvScreenButton,
  NvRingGauge,
  NvCapsuleBar,
  NvDigitalFlop,
  NvSparkline,
  NvKpiBar,
  NvScreenStatusLight,
  NvScreenStatusTag,
} from '@nerv-ui/ui'
import { indicatorSources, statusTones } from './indicators-fixtures'

const sourceId = shallowRef('morning')
const source = computed(() => indicatorSources.find((item) => item.id === sourceId.value)!)
const visits = shallowRef<number | string>(source.value.visits)
const area = shallowRef(true)
const alternateLabels = shallowRef(false)
const running = shallowRef(false)
let timer: ReturnType<typeof setInterval> | undefined
function stop() {
  clearInterval(timer)
  timer = undefined
  running.value = false
}
function showLiteral() {
  stop()
  visits.value = '尚未统计'
}
function toggleUpdates() {
  if (running.value) return stop()
  // Only a host demonstration counter, no polling or business fetcher in the library.
  running.value = true
  timer = setInterval(() => {
    visits.value = (typeof visits.value === 'number' ? visits.value : 0) + 37
  }, 700)
}
watch(source, (value) => {
  stop()
  visits.value = value.visits
})
onBeforeUnmount(stop)
const visitText = computed(() =>
  typeof visits.value === 'number' ? visits.value.toLocaleString('en-US') : visits.value,
)
const ReadingIcon = defineComponent({
  props: { size: { type: Number, default: 19 } },
  setup: (props) => () =>
    h(
      'svg',
      {
        width: props.size,
        height: props.size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'aria-hidden': 'true',
      },
      [h('path', { d: 'M3 4h7l2 2 2-2h7v16h-7l-2 1-2-1H3z M12 6v15' })],
    ),
})
const kpis = computed(() => [
  {
    icon: ReadingIcon,
    value: visitText.value,
    label:
      sourceId.value === 'boundary'
        ? '河畔公共阅读空间全年累计到访说明'
        : `${source.value.space} · 累计到访`,
    tone: 'cyan' as const,
  },
  {
    value: source.value.booking === null ? '比例未知' : `${source.value.booking}%`,
    label: '空间预订比例',
    ...(source.value.booking === null ? { icon: ReadingIcon } : { ring: source.value.booking }),
  },
  {
    icon: ReadingIcon,
    value: source.value.note,
    label: '空间公告',
    tone: 'green' as const,
  },
  {
    icon: ReadingIcon,
    value: '阅读、展览与自由相聚',
    label: '让每一次停留，都有新的发现',
    tone: 'amber' as const,
  },
])
</script>

<template>
  <main class="indicators-stage">
    <NvScreenHeader
      title="城市空间的每一刻"
      time="10:25:00"
      date="星期日"
      line="公共空间"
      screen="阅读与到访"
    />
    <div class="indicators-toolbar">
      <div>
        <h2>阅读与到访</h2>
        <p aria-label="读数来源">{{ source.id }} · {{ source.space }}</p>
      </div>
      <label
        >读数组
        <select v-model="sourceId" aria-label="读数组">
          <option v-for="item in indicatorSources" :key="item.id" :value="item.id">
            {{ item.space }}
          </option>
        </select></label
      >
      <label><input v-model="area" type="checkbox" aria-label="趋势面积" /> 趋势面积</label>
      <NvScreenButton :aria-pressed="running" @click="toggleUpdates">{{
        running ? '停止更新' : '连续更新'
      }}</NvScreenButton>
      <NvScreenButton
        variant="secondary"
        @click="visits = typeof visits === 'number' ? visits + 100 : 100"
        >增加读数</NvScreenButton
      >
      <NvScreenButton
        variant="secondary"
        @click="visits = typeof visits === 'number' ? visits - 100 : 0"
        >减少读数</NvScreenButton
      >
      <NvScreenButton variant="ghost" @click="showLiteral">显示文字</NvScreenButton>
    </div>
    <div class="indicators-content" role="region" aria-label="指标内容" tabindex="0">
      <div class="indicators-top">
        <NvScreenPanel title="到访计数" class="indicators-panel">
          <div class="indicators-panel-content" aria-label="到访读数" tabindex="0">
            <NvDigitalFlop :value="visits" suffix="人次" />
          </div>
          <p aria-label="读数原文">当前原值：{{ visitText }} 人次</p>
          <p>{{ source.note }}</p>
        </NvScreenPanel>
        <NvScreenPanel title="空间比例" class="indicators-panel">
          <div class="indicators-rings">
            <div aria-label="预订比例">
              <NvRingGauge
                v-if="source.booking !== null"
                :value="source.booking"
                label="预订比例"
              />
              <p v-else>比例未知 · 尚未确认</p>
            </div>
            <div aria-label="阅读比例">
              <NvRingGauge
                v-if="source.reading !== null"
                :value="source.reading"
                label="阅读比例"
              />
              <p v-else>比例未知 · 尚未确认</p>
            </div>
          </div>
          <p>填充限于 0–100%，读数保留原值（环内小数一位）。</p>
        </NvScreenPanel>
        <NvScreenPanel title="预订分布" class="indicators-panel">
          <NvCapsuleBar :items="source.capsules" />
          <p v-if="!source.capsules.length">预订分布未知，暂无有效比例。</p>
          <p>标签、单位和预订比例来自当前读数组。</p>
        </NvScreenPanel>
      </div>
      <div class="indicators-middle">
        <NvScreenPanel title="阅读微趋势" class="indicators-panel">
          <figure aria-label="阅读微趋势">
            <div class="indicators-spark">
              <NvSparkline :data="source.readingTrend" :area="area" :color="source.color" />
            </div>
            <figcaption>
              阅读次数：{{
                source.readingTrend.length ? source.readingTrend.join(' → ') : '暂无数据'
              }}
            </figcaption>
          </figure>
        </NvScreenPanel>
        <NvScreenPanel title="预订微趋势" class="indicators-panel">
          <figure aria-label="预订微趋势">
            <div class="indicators-spark">
              <NvSparkline :data="source.bookingTrend" :area="area" color="var(--nv-scr-indigo)" />
            </div>
            <figcaption>
              预订次数：{{
                source.bookingTrend.length ? source.bookingTrend.join(' → ') : '暂无数据'
              }}{{ source.bookingTrend.length === 1 ? ' · 单点不构成趋势' : '' }}
            </figcaption>
          </figure>
        </NvScreenPanel>
      </div>
      <section aria-label="指标横条" class="indicators-kpis">
        <h2>空间速览</h2>
        <NvKpiBar :items="kpis" role="region" aria-label="横向指标读数" tabindex="0" />
        <p>可聚焦横条，向左右滚动阅读完整文字。</p>
      </section>
      <NvScreenPanel title="状态与文字对照" class="indicators-panel">
        <div class="indicators-status-head">
          <p>别名只决定颜色；状态含义由文字说明。</p>
          <NvScreenButton size="sm" variant="secondary" @click="alternateLabels = !alternateLabels"
            >切换状态文字</NvScreenButton
          >
        </div>
        <div class="indicators-status" aria-label="状态对照">
          <div v-for="tone in statusTones" :key="tone">
            <code>{{ tone }}</code
            ><NvScreenStatusLight
              :tone="tone"
              :label="`${alternateLabels ? '阅读提示' : '空间提示'} · ${tone}`"
            /><NvScreenStatusTag
              :tone="tone"
              :label="`${alternateLabels ? '请轻声阅读' : '欢迎来坐坐'} · ${tone}`"
            />
          </div>
        </div>
      </NvScreenPanel>
    </div>
    <footer>
      <span>阅读、到访与预订 · 零值与未知分别展示</span><a href="#screen/stage">返回空间舞台</a
      ><a href="#screen/controls">随心安排</a><a href="#desktop">返回桌面</a>
    </footer>
  </main>
</template>

<style scoped>
@layer app {
  .indicators-stage {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px 32px;
    color: var(--nv-scr-text);
    background: var(--nv-scr-bg);
  }
  .indicators-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 20px;
    flex: none;
  }
  .indicators-toolbar > div {
    margin-right: auto;
  }
  .indicators-stage h2 {
    font-size: 22px;
    font-weight: 600;
    margin: 0;
  }
  .indicators-stage p {
    font-size: 16px;
    line-height: 1.5;
    margin: 8px 0 0;
    color: var(--nv-scr-muted);
  }
  .indicators-toolbar label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
  }
  .indicators-toolbar select {
    padding: 8px;
    color: var(--nv-scr-text);
    background: var(--nv-scr-panel-b);
    border: 1px solid var(--nv-scr-line-2);
    border-radius: 6px;
  }
  .indicators-content {
    min-height: 0;
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 4px;
  }
  .indicators-top {
    display: grid;
    grid-template-columns: 1.1fr 1fr 1fr;
    gap: 20px;
  }
  .indicators-panel {
    min-width: 0;
    flex: none;
  }
  .indicators-panel-content {
    overflow: auto;
    padding: 14px 0;
  }
  .indicators-rings {
    display: flex;
    justify-content: space-evenly;
    gap: 12px;
  }
  .indicators-rings > div {
    min-width: 0;
  }
  .indicators-middle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .indicators-stage figure {
    margin: 0;
  }
  .indicators-spark {
    height: 84px;
    margin: 12px 0 20px;
  }
  .indicators-stage figcaption {
    color: var(--nv-scr-muted);
    font-size: 16px;
  }
  .indicators-kpis {
    min-width: 0;
    flex: none;
  }
  .indicators-kpis h2 {
    margin-bottom: 12px;
  }
  .indicators-status-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
  }
  .indicators-status {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
  }
  .indicators-status > div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .indicators-status code {
    color: var(--nv-scr-muted);
    font-size: 14px;
  }
  .indicators-stage footer {
    display: flex;
    flex: none;
    align-items: center;
    gap: 28px;
    font-size: 16px;
    color: var(--nv-scr-muted);
  }
  .indicators-stage footer span {
    margin-right: auto;
  }
  .indicators-stage footer a {
    color: var(--nv-scr-cyan);
    text-decoration: underline;
    padding: 8px 0;
  }
  .indicators-stage :focus-visible {
    outline: 2px solid var(--nv-scr-cyan);
    outline-offset: 3px;
  }
}
</style>
