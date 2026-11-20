<script setup lang="ts">
import { computed } from 'vue'
import {
  NvScreenPanel,
  NvScrollBoard,
  NvScreenTable,
  NvScreenPagination,
  NvScreenTrendChart,
  NvScreenPareto,
  NvScreenDonut,
  NvScreenFreshness,
  NvScreenStatusTag,
} from '@nerv-ui/ui'
import type { DashboardInput } from './dashboardInput'
const props = defineProps<{
  input: DashboardInput
  page: number
  view: 'chart' | 'detail'
  now: number
}>()
const emit = defineEmits<{ page: [number]; view: ['chart' | 'detail']; entry: [string] }>()
const currentPage = computed(() =>
  Math.max(1, Math.min(props.page, Math.ceil(props.input.rows.length / 2) || 1)),
)
const rows = computed(() =>
  props.input.rows.slice((currentPage.value - 1) * 2, currentPage.value * 2),
)
const stale = computed(
  () => props.input.updatedAt !== null && props.now - props.input.updatedAt > 60000,
)
const columns = [
  { key: 'id', label: '编号' },
  { key: 'name', label: '安排' },
  { key: 'status', label: '状态' },
]
const detailColumns = computed(() => [
  { key: 'label', label: '分类' },
  {
    key: 'value',
    label: props.input.unit ? `数量（${props.input.unit}）` : '数量',
    align: 'right' as const,
  },
])
</script>
<template>
  <section class="nv-scr-recipe" :aria-label="input.title">
    <header>
      <h1>{{ input.title }}</h1>
      <nav :aria-label="`${input.title}入口`">
        <button v-for="entry in input.entries" :key="entry" @click="emit('entry', entry)">
          {{ entry }}
        </button>
      </nav>
    </header>
    <NvScreenPanel :title="input.primaryLabel"
      ><strong data-primary class="nv-scr-recipe-primary tracking-tight"
        >{{
          input.primary === null
            ? '未确认'
            : input.primary.toLocaleString('zh-CN', { maximumFractionDigits: 3 })
        }}<small v-if="input.primary !== null" style="font-weight: 400; color: var(--nv-scr-muted)">
          {{ input.unit }}</small
        ></strong
      >
      <p>{{ input.secondary }}</p></NvScreenPanel
    >
    <p v-if="input.error" role="alert"><NvScreenStatusTag tone="red" :label="input.error" /></p>
    <NvScreenFreshness
      :tone="input.updatedAt === null ? 'wait' : stale ? 'stale' : 'live'"
      :label="input.updatedAt === null ? '尚未更新' : stale ? '已过期 · 保留上次记录' : '记录有效'"
    />
    <div class="nv-scr-recipe-columns">
      <NvScreenPanel title="活动动态"
        ><div class="nv-scr-recipe-scroll" tabindex="0" aria-label="活动动态滚动区">
          <NvScrollBoard :items="input.rows" :row-key="(row) => row.id"
            ><template #row="{ item }"
              ><p>
                <span class="nv-scr-recipe-code">{{ item.id }}</span> {{ item.name }} ·
                {{ item.status }}
              </p></template
            ></NvScrollBoard
          >
        </div></NvScreenPanel
      >
      <NvScreenPanel title="安排队列"
        ><div data-queue class="nv-scr-recipe-scroll" tabindex="0" aria-label="安排队列滚动区">
          <NvScreenTable v-if="rows.length" :columns="columns" :rows="rows" row-key="id"
            ><template #cell-status="{ value }"
              ><NvScreenStatusTag tone="cyan" :label="String(value)"
            /></template>
            <template #cell-id="{ value }"
              ><span class="nv-scr-recipe-code">{{ value }}</span></template
            ></NvScreenTable
          >
          <p v-else>暂无安排</p>
        </div>
        <NvScreenPagination
          :page="currentPage"
          :total="input.rows.length"
          :page-size="2"
          @update:page="emit('page', $event)"
      /></NvScreenPanel>
      <NvScreenPanel title="分类概况"
        ><button data-view @click="emit('view', view === 'chart' ? 'detail' : 'chart')">
          {{ view === 'chart' ? '查看明细' : '查看图表' }}
        </button>
        <div class="nv-scr-recipe-scroll" tabindex="0" aria-label="分类概况滚动区">
          <p v-if="!input.distribution.length">暂无安排</p>
          <NvScreenDonut
            v-else-if="view === 'chart'"
            :segments="input.distribution"
          /><NvScreenTable
            v-else
            data-details
            :columns="detailColumns"
            :rows="input.distribution"
            row-key="label"
            ><template #cell-value="{ value }">{{
              typeof value === 'number' && Number.isFinite(value)
                ? value.toLocaleString('zh-CN', { maximumFractionDigits: 3 })
                : '—'
            }}</template></NvScreenTable
          ><NvScreenPareto :items="input.ranking" :unit="input.unit" /></div
      ></NvScreenPanel>
    </div>
    <NvScreenTrendChart
      :title="`${input.title}趋势`"
      :actual="input.actual"
      :plan="input.threshold"
      :series="input.layers"
      :tabs="false"
      :tooltip="false"
      :y-labels="[]"
      :x-labels="['周一', '周二', '周三']"
      :hover-labels="['周一', '周二', '周三']"
      actual-label="已登记"
      plan-label="提示阈值"
    />
  </section>
</template>
<style scoped>
@layer app {
  .nv-scr-recipe {
    height: 920px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: var(--nv-scr-text);
  }
  .nv-scr-recipe header,
  .nv-scr-recipe nav {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .nv-scr-recipe-columns {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) minmax(0, 1fr);
    gap: 16px;
    min-height: 0;
  }
  .nv-scr-recipe-scroll {
    height: 240px;
    overflow: auto;
    overflow-wrap: anywhere;
  }
  .nv-scr-recipe-primary {
    font-size: 36px;
    font-variant-numeric: tabular-nums;
  }
  .nv-scr-recipe-primary small {
    font-size: 18px;
  }
  .nv-scr-recipe-code {
    color: var(--nv-scr-muted);
    font:
      12px ui-monospace,
      monospace;
  }
  .nv-scr-recipe button {
    color: var(--nv-scr-text);
    background: var(--nv-scr-bg-accent);
    padding: 8px 16px;
    border: 1px solid var(--nv-scr-line);
    border-radius: var(--nv-scr-radius);
  }
  .nv-scr-recipe :focus-visible {
    outline: 2px solid var(--nv-scr-cyan);
    outline-offset: 2px;
  }
}
</style>
