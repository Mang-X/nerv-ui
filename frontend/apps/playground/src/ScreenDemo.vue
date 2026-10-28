<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { NvScreenScaler, useColorMode, useTheme, type ScaleMode } from '@nerv-iip/ui'
import ScreenDashboardDemo from './screen/ScreenDashboardDemo.vue'
import ScreenStageDemo from './screen/ScreenStageDemo.vue'
import ScreenBackgroundDemo from './screen/ScreenBackgroundDemo.vue'
import ScreenLayoutDemo from './screen/ScreenLayoutDemo.vue'
import ScreenControlsDemo from './screen/ScreenControlsDemo.vue'
import ScreenIndicatorsDemo from './screen/ScreenIndicatorsDemo.vue'
import ScreenDataDemo from './screen/ScreenDataDemo.vue'
import ScreenChartsDemo from './screen/ScreenChartsDemo.vue'
import ScreenSummaryCardsDemo from './screen/ScreenSummaryCardsDemo.vue'
import ScreenSummaryDemo from './screen/ScreenSummaryDemo.vue'
import ScreenHeatmapDemo from './screen/ScreenHeatmapDemo.vue'
import ScreenStageFlowDemo from './screen/ScreenStageFlowDemo.vue'
import ScreenStatusHeroDemo from './screen/ScreenStatusHeroDemo.vue'
import ScreenLoginStageDemo from './screen/ScreenLoginStageDemo.vue'
import ScreenTablesDemo from './screen/ScreenTablesDemo.vue'

const props = defineProps<{ section?: string }>()
const login = computed(() => props.section?.startsWith('#screen/login/'))
const recipes = computed(() => props.section === '#screen/recipes')
const backgrounds = computed(() => props.section === '#screen/backgrounds')
const layout = computed(() => props.section === '#screen/layout')
const summaryCards = computed(() => props.section === '#screen/summary-cards')
const summary = computed(() => props.section === '#screen/summary')
const heatmap = computed(() => props.section === '#screen/heatmap')
const stageFlow = computed(() => props.section === '#screen/stage-flow')
const statusHero = computed(() => props.section === '#screen/status-hero')
const indicators = computed(() => props.section === '#screen/indicators')
const controls = computed(() => props.section === '#screen/controls')
const charts = computed(() => props.section === '#screen/charts')
const tables = computed(() => props.section === '#screen/tables')
const data = computed(() => props.section === '#screen/data')

const mode = shallowRef<ScaleMode>('fit')
const design = shallowRef('1920x1080')
watch(
  layout,
  (active) => {
    if (active) design.value = '1920x1080'
  },
  { immediate: true },
)
const dimensions = computed(() => {
  const [width, height] = design.value.split('x').map(Number)
  return { width: width!, height: height! }
})
const { isDark, toggle } = useColorMode()
const { theme, setTheme } = useTheme()
</script>

<template>
  <div class="screen-demo">
    <div class="screen-demo-tools">
      <nav aria-label="显示表面" class="screen-demo-nav">
        <a href="#files" class="inline-flex min-h-11 items-center px-3 underline">留住片刻</a>
        <a
          href="#screen/stage"
          :aria-current="
            !backgrounds &&
            !layout &&
            !controls &&
            !indicators &&
            !data &&
            !charts &&
            !tables &&
            !summary &&
            !summaryCards &&
            !statusHero &&
            !stageFlow &&
            !heatmap &&
            !recipes
              ? 'page'
              : undefined
          "
          >空间舞台</a
        >
        <a href="#screen/layout" :aria-current="layout ? 'page' : undefined">城市光影</a>
        <a href="#screen/controls" :aria-current="controls ? 'page' : undefined">随心安排</a>
        <a href="#screen/indicators" :aria-current="indicators ? 'page' : undefined">阅读与到访</a>
        <a href="#screen/charts" :aria-current="charts ? 'page' : undefined">内容与到访</a>
        <a href="#screen/data" :aria-current="data ? 'page' : undefined">流动消息</a>
        <a href="#screen/tables" :aria-current="tables ? 'page' : undefined">清单与事件</a>
        <a href="#screen/recipes" :aria-current="recipes ? 'page' : undefined">安排看板</a>
        <a href="#screen/summary-cards" :aria-current="summaryCards ? 'page' : undefined"
          >空间一瞥</a
        >
        <a href="#screen/summary" :aria-current="summary ? 'page' : undefined">空间使用概况</a>
        <a href="#screen/login/library">走进空间</a>
        <a href="#screen/status-hero" :aria-current="statusHero ? 'page' : undefined">此刻的现场</a>
        <a href="#screen/heatmap" :aria-current="heatmap ? 'page' : undefined">一格一刻</a>
        <a href="#screen/stage-flow" :aria-current="stageFlow ? 'page' : undefined">一步一步</a>
        <a href="#desktop">桌面演示</a>
        <a href="#touch">触屏演示</a>
        <a href="#mobile">移动演示</a>
        <a href="#mobile-input">随心记录</a>
        <a href="#mobile-overlays">片刻安排</a>
        <a href="#mobile-lists">翻阅时光</a>
        <a href="#mobile-feedback">片刻回响</a>
      </nav>
      <div class="screen-demo-settings" role="group" aria-label="舞台设置">
        <label
          >缩放方式
          <select v-model="mode" aria-label="缩放方式">
            <option value="fit">完整显示 fit</option>
            <option value="width">宽度优先 width</option>
            <option value="stretch">铺满 stretch</option>
          </select>
        </label>
        <label
          >设计尺寸
          <select v-model="design" aria-label="设计尺寸" :disabled="layout">
            <option value="1920x1080">1920 × 1080</option>
            <option value="1600x900">1600 × 900</option>
            <option value="1920x1440">1920 × 1440</option>
          </select>
        </label>
        <button type="button" :aria-pressed="isDark" @click="toggle">
          {{ isDark ? '切换浅色' : '切换深色' }}
        </button>
        <button
          type="button"
          :aria-pressed="theme === 'blue'"
          @click="setTheme(theme === 'blue' ? 'neutral' : 'blue')"
        >
          蓝色主题
        </button>
        <p role="status">
          {{
            mode === 'width'
              ? '宽度优先：在舞台内向下滚动，可到达底部。'
              : mode === 'stretch'
                ? '铺满：宽高独立缩放，内容随容器拉伸。'
                : '完整显示：等比缩放，留边区域保留。'
          }}
        </p>
      </div>
    </div>
    <div class="screen-demo-viewport">
      <NvScreenScaler
        class="screen-demo-scaler"
        role="region"
        :design-width="dimensions.width"
        :design-height="dimensions.height"
        :mode="mode"
        tabindex="0"
        :aria-label="
          backgrounds
            ? '大屏背景展示舞台'
            : layout
              ? '城市光影舞台'
              : summaryCards
                ? '空间摘要舞台'
                : summary
                  ? '城市空间概况舞台'
                  : heatmap
                    ? '分档热力舞台'
                    : stageFlow
                      ? '阶段数量舞台'
                      : statusHero
                        ? '现场主状态灯舞台'
                        : tables
                          ? '城市空间清单舞台'
                          : charts
                            ? '城市空间图表舞台'
                            : data
                              ? '城市空间消息舞台'
                              : indicators
                                ? '城市空间指标舞台'
                                : controls
                                  ? '城市空间控件舞台'
                                  : '城市文化空间舞台'
        "
      >
        <ScreenLoginStageDemo v-if="login" :garden="section === '#screen/login/garden'" />
        <ScreenDashboardDemo v-else-if="recipes" />
        <ScreenBackgroundDemo v-else-if="backgrounds" />
        <ScreenLayoutDemo v-else-if="layout" />
        <ScreenSummaryCardsDemo v-else-if="summaryCards" />
        <ScreenSummaryDemo v-else-if="summary" />
        <ScreenStatusHeroDemo v-else-if="statusHero" />
        <ScreenHeatmapDemo v-else-if="heatmap" />
        <ScreenStageFlowDemo v-else-if="stageFlow" />
        <ScreenTablesDemo v-else-if="tables" />
        <ScreenChartsDemo v-else-if="charts" />
        <ScreenDataDemo v-else-if="data" />
        <ScreenIndicatorsDemo v-else-if="indicators" />
        <ScreenControlsDemo v-else-if="controls" />
        <ScreenStageDemo v-else />
      </NvScreenScaler>
    </div>
  </div>
</template>

<style scoped>
@layer app {
  .screen-demo {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    background: var(--background);
    color: var(--foreground);
  }
  .screen-demo-tools {
    flex: none;
    padding: 8px 16px;
    border-bottom: 1px solid var(--border);
  }
  .screen-demo-nav,
  .screen-demo-settings {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 16px;
  }
  .screen-demo-nav a {
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    font-size: 13px;
    text-decoration: underline;
  }
  .screen-demo-nav [aria-current] {
    font-weight: 700;
  }
  .screen-demo-settings {
    font-size: 12px;
  }
  .screen-demo-settings label {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .screen-demo-settings select,
  .screen-demo-settings button {
    min-height: 32px;
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--foreground);
    border-radius: var(--radius);
    padding: 4px 8px;
  }
  .screen-demo-settings p {
    margin: 0;
    color: var(--muted-foreground);
  }
  .screen-demo-viewport {
    position: relative;
    flex: 1;
    min-height: 0;
  }
  .screen-demo-scaler {
    position: absolute;
    color-scheme: dark;
  }
  .screen-demo :focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
}
</style>
