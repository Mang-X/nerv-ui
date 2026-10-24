<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import {
  NvScreenHeader,
  NvScreenPanel,
  NvScreenButton,
  NvScreenScrollArea,
  NvScrollBoard,
} from '@nerv-iip/ui'
import ScreenDataSource from './ScreenDataSource.vue'
import { createSpaceFeed, spaceRows } from './data-fixtures'

const feeds = [
  createSpaceFeed('reading-a', '街角书房'),
  createSpaceFeed('reading-b', '河岸展厅'),
  createSpaceFeed('notices', '空间快讯'),
]
const sourceId = shallowRef('reading-a')
const source = computed(() => feeds.find((feed) => feed.id === sourceId.value)!)
const rows = shallowRef([...spaceRows])
const expanded = shallowRef(false)
const replacement = shallowRef(0)
const connection = shallowRef(0)
const selected = shallowRef('尚未选择')
function append() {
  rows.value = [
    ...rows.value,
    ...spaceRows.slice(0, 4).map((row, index) => ({
      id: `added-${rows.value.length + index}`,
      text: `新增 · ${row.text}`,
    })),
  ]
}
onBeforeUnmount(() => feeds.forEach((feed) => feed.release()))
</script>

<template>
  <main class="data-stage">
    <NvScreenHeader
      title="城市空间的流动消息"
      time=""
      date="阅读动态与空间快讯"
      line=""
      screen="城市文化空间"
    />
    <div class="data-body">
      <div class="data-toolbar">
        <label
          >阅读来源
          <select v-model="sourceId" aria-label="阅读来源">
            <option value="reading-a">街角书房 · reading-a</option>
            <option value="reading-b">河岸展厅 · reading-b</option>
          </select></label
        >
        <button type="button" @click="connection++">重新连接阅读来源</button>
        <span v-for="feed in feeds" :key="feed.id" :aria-label="`${feed.id} 请求记录`"
          >{{ feed.id }}：{{ feed.requests.value
          }}<button v-if="feed.pending.value" type="button" @click="feed.release">
            完成 {{ feed.id }}
          </button></span
        >
      </div>
      <div class="data-sources">
        <ScreenDataSource :key="`${source.id}-${connection}`" :feed="source" title="阅读动态" />
        <ScreenDataSource :feed="feeds[2]!" title="空间快讯" />
      </div>
      <div class="data-toolbar" aria-label="消息列表设置">
        <NvScreenButton size="sm" @click="append">追加消息</NvScreenButton>
        <NvScreenButton size="sm" @click="rows = rows.slice(0, 2)">缩为两条</NvScreenButton>
        <NvScreenButton size="sm" @click="rows = []">清空消息</NvScreenButton>
        <NvScreenButton size="sm" @click="rows = [...spaceRows]">恢复消息</NvScreenButton>
        <NvScreenButton size="sm" @click="replacement++">替换内容</NvScreenButton>
        <label><input v-model="expanded" type="checkbox" /> 展开行说明</label>
        <span>已选：{{ selected }}</span>
      </div>
      <div class="data-lists">
        <NvScreenPanel title="自动轮巡" aria-label="自动轮巡">
          <p>悬停暂停，滚轮双向查看；键盘进入或减少动态效果时可手动翻阅。</p>
          <NvScrollBoard
            :items="rows"
            :row-key="(row) => row.id"
            :speed="180"
            class="data-list nv-scr-scroll"
            aria-label="轮巡消息"
          >
            <template #row="{ item }"
              ><div class="data-row" :class="{ expanded }">
                <span
                  >{{ item.text }}<small v-if="expanded">为城市留一段安静的阅读时光。</small></span
                ><button type="button" @click="selected = item.id">选择 {{ item.id }}</button>
              </div></template
            >
          </NvScrollBoard>
        </NvScreenPanel>
        <NvScreenPanel title="手动翻阅" aria-label="手动翻阅">
          <p>向下阅读全部消息；上下箭头提示尚未读到的内容。</p>
          <NvScreenScrollArea type="always" class="data-list" aria-label="翻阅消息"
            ><div :key="replacement">
              <div v-for="row in rows" :key="row.id" class="data-row" :class="{ expanded }">
                <span
                  >{{ row.text }}<small v-if="expanded">为城市留一段安静的阅读时光。</small></span
                ><button type="button" @click="selected = row.id">查看 {{ row.id }}</button>
              </div>
              <p v-if="!rows.length">暂无消息</p>
            </div></NvScreenScrollArea
          >
        </NvScreenPanel>
      </div>
      <footer>
        <span>内容是否在失败时保留，可由各空间单独选择。</span><a href="#desktop">返回工作空间</a>
      </footer>
    </div>
  </main>
</template>

<style scoped>
@layer app {
  .data-stage {
    height: 100%;
    background: var(--nv-scr-bg);
    color: var(--nv-scr-text);
    font-size: 18px;
  }
  .data-body {
    padding: 22px 42px;
    display: flex;
    flex-direction: column;
    gap: 22px;
  }
  .data-sources,
  .data-lists {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    min-width: 0;
  }
  .data-sources > *,
  .data-lists > * {
    min-width: 0;
  }
  .data-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    font-size: 16px;
  }
  .data-toolbar label {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .data-toolbar select,
  .data-toolbar button,
  .data-row button {
    color: var(--nv-scr-text);
    background: var(--nv-scr-bg);
    border: 1px solid var(--nv-scr-line);
    border-radius: var(--nv-scr-radius);
    padding: 6px 10px;
  }
  .data-list {
    height: 290px;
  }
  .data-row {
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-bottom: 1px solid var(--nv-scr-divider);
  }
  .data-row.expanded {
    height: 88px;
  }
  .data-row small {
    display: block;
    font-size: 15px;
    color: var(--nv-scr-muted);
  }
  .data-lists p,
  footer {
    color: var(--nv-scr-muted);
    font-size: 16px;
  }
  footer {
    display: flex;
    justify-content: space-between;
  }
  a {
    text-decoration: underline;
  }
  :focus-visible {
    outline: 2px solid var(--nv-scr-cyan);
    outline-offset: 2px;
  }
}
</style>
