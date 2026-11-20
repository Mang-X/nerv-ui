<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  NvAlarmTable,
  NvScreenButton,
  NvScreenHeader,
  NvScreenPanel,
  NvScreenPagination,
  NvScreenTable,
} from '@nerv-ui/ui'
import { collectionColumns, collectionRows, eventLabels, eventRows } from './tables-fixtures'

const source = shallowRef<'collection' | 'activity'>('collection')
const rows = shallowRef(collectionRows(source.value))
const events = shallowRef(eventRows())
const page = shallowRef(1)
const pageSize = 18
const knownTotal = shallowRef(true)
const pageEvents = shallowRef(0)
const refreshes = shallowRef(0)
const selected = shallowRef('')
const visibleRows = computed(() =>
  rows.value.slice((page.value - 1) * pageSize, page.value * pageSize),
)
function changePage(next: number) {
  page.value = next
  pageEvents.value++
  selected.value = ''
}
function replaceRows(next: ReturnType<typeof collectionRows>, known = true) {
  rows.value = next
  knownTotal.value = known
  page.value = 1
  selected.value = ''
}
function switchSource(next: 'collection' | 'activity') {
  source.value = next
  replaceRows(collectionRows(next))
}
function refresh() {
  refreshes.value++
  replaceRows(collectionRows(source.value))
}
</script>

<template>
  <main class="tables-demo">
    <NvScreenHeader
      title="城市文化空间 · 清单与事件"
      time="14:30"
      date="周日"
      line=""
      screen="城市公共空间"
    />
    <div class="tables-scroll">
      <div class="tables-tools" aria-label="清单操作">
        <NvScreenButton :aria-pressed="source === 'collection'" @click="switchSource('collection')"
          >馆藏清单</NvScreenButton
        >
        <NvScreenButton :aria-pressed="source === 'activity'" @click="switchSource('activity')"
          >活动清单</NvScreenButton
        >
        <NvScreenButton @click="refresh">刷新清单</NvScreenButton>
        <NvScreenButton @click="replaceRows(rows.slice(0, 7))">缩为七项</NvScreenButton>
        <NvScreenButton @click="replaceRows(rows, false)">总数未知</NvScreenButton>
        <NvScreenButton @click="replaceRows([])">清空清单</NvScreenButton>
        <NvScreenButton @click="replaceRows(collectionRows(source))">恢复清单</NvScreenButton>
      </div>
      <div class="tables-grid">
        <NvScreenPanel title="馆藏与活动清单" class="collection-panel">
          <p class="tables-hint">表内可上下、左右滚动。0、空白和 — 按原文呈现。</p>
          <NvScreenTable
            class="collection-table"
            :columns="collectionColumns"
            :rows="visibleRows"
            row-key="id"
            tabindex="0"
            role="region"
            aria-label="馆藏与活动表格内容"
          >
            <template #cell-id="{ value }"
              ><span :data-collection-id="value">{{ value }}</span></template
            >
            <template #cell-action="{ row }"
              ><NvScreenButton
                size="sm"
                variant="ghost"
                :aria-label="`选择 ${row.id}`"
                @click="selected = String(row.id)"
                >选择 {{ row.id }}</NvScreenButton
              ></template
            >
          </NvScreenTable>
          <p v-if="!rows.length" role="status">暂无清单记录</p>
          <NvScreenPagination
            v-if="knownTotal"
            :page="page"
            :page-size="pageSize"
            :total="rows.length"
            @update:page="changePage"
          />
          <p v-else role="status">总数未知 · 已载入 {{ rows.length }} 项，暂不提供页数</p>
          <p aria-label="清单页读数">
            第 {{ page }} 页 · 当前 {{ visibleRows.length }} 项 · {{ visibleRows[0]?.id ?? '—' }} 至
            {{ visibleRows.at(-1)?.id ?? '—' }}
          </p>
          <p aria-label="当前记录">{{ selected || '尚未选择' }}</p>
          <p class="tables-hint">
            <span aria-label="分页事件次数">分页操作 {{ pageEvents }} 次</span> ·
            <span aria-label="刷新次数">刷新 {{ refreshes }} 次</span>
          </p>
        </NvScreenPanel>
        <div class="events-column">
          <div class="tables-tools">
            <NvScreenButton @click="events = [...events].reverse()">倒序事件</NvScreenButton>
            <NvScreenButton @click="events = eventRows(true)">替换事件</NvScreenButton>
            <NvScreenButton @click="events = eventRows()">恢复事件</NvScreenButton>
          </div>
          <NvAlarmTable
            class="events-table"
            title="空间事件"
            more="本地事件记录"
            :rows="events"
            row-key="id"
            :labels="eventLabels"
            :level-labels="{ sev: '优先', gen: '常规' }"
          >
            <template #cell-status="{ row, value }"
              ><span class="event-state" :class="String(row.tone)" :data-event-id="row.id"
                >{{ value }} · {{ row.id }}</span
              ></template
            >
          </NvAlarmTable>
          <p class="tables-hint">
            同一参考号可对应多个事件。状态色由本页明确指定；右上角是文字说明。
          </p>
        </div>
      </div>
      <footer>
        清单在本页内存中分页；切换分组后重新开始。<a href="#screen/stage">返回空间舞台</a>
      </footer>
    </div>
  </main>
</template>

<style scoped>
@layer app {
  .tables-demo {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 28px 40px;
    background: var(--nv-scr-bg);
    color: var(--nv-scr-text);
  }
  .tables-scroll {
    flex: 1;
    min-height: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .tables-tools {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }
  .tables-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    gap: 24px;
  }
  .collection-panel,
  .events-column {
    min-width: 0;
  }
  .collection-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .collection-table {
    height: 430px;
    flex: none;
  }
  .events-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .events-table {
    height: 590px;
  }
  .tables-hint,
  footer {
    color: var(--nv-scr-muted);
    font-size: 14px;
    line-height: 1.6;
  }
  .event-state {
    white-space: nowrap;
  }
  .event-state.neutral {
    color: var(--nv-scr-text);
  }
  .event-state.attention {
    color: var(--nv-scr-amber);
  }
  .event-state.quiet {
    color: var(--nv-scr-muted);
  }
  footer a {
    color: var(--nv-scr-cyan);
    text-decoration: underline;
  }
  .tables-demo :focus-visible {
    outline: 2px solid var(--nv-scr-cyan);
    outline-offset: 3px;
  }
}
</style>
