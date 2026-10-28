<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import {
  NvScreenStatusWall,
  NvScreenPanel,
  type ScreenStatusWallItem,
  type ScreenStatusWallMode,
} from '@nerv-iip/ui'
const props = defineProps<{
  loadPreview?: (item: ScreenStatusWallItem, signal: AbortSignal) => Promise<string>
}>()
const source = ref('城市书房')
const mode = ref<ScreenStatusWallMode>('flat')
let revision = 0
function records(): ScreenStatusWallItem[] {
  return Array.from({ length: 120 }, (_, i) => ({
    key: String(i),
    label: source.value === '城市书房' ? '阅读角' : '种植区',
    identity: `${source.value} · ${i + 1} 号 · 第 ${revision + 1} 次更新`,
    group: { key: String(i % 3), label: ['东区', '中区', '西区'][i % 3]! },
    status: { label: i % 3 ? '可供使用' : '待确认', tone: i % 3 ? 'green' : 'amber' },
    summary: i === 0 ? '0 人' : i === 1 ? null : `${i % 8} 人`,
  }))
}
const items = shallowRef(records())
const previewText = ref('悬停或聚焦查看概况')
const selected = ref('尚未选择')
let serial = 0
let alive = true
let controller: AbortController | undefined
function close() {
  serial++
  controller?.abort()
  previewText.value = '悬停或聚焦查看概况'
}
function fakePreview(item: ScreenStatusWallItem, signal: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => resolve(`${item.identity} · ${item.status.label} · ${item.summary ?? '数量未知'}`),
      250,
    )
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(new Error('cancelled'))
      },
      { once: true },
    )
  })
}
async function preview(item: ScreenStatusWallItem | null) {
  close()
  if (!item || item.disabled) return
  const request = serial
  const capturedItems = items.value
  const capturedMode = mode.value
  const context = source.value
  const capturedRevision = revision
  const abort = new AbortController()
  controller = abort
  const owns = () =>
    alive &&
    !abort.signal.aborted &&
    request === serial &&
    capturedItems === items.value &&
    mode.value === capturedMode &&
    source.value === context &&
    revision === capturedRevision &&
    items.value.find((row) => row.key === item.key) === item
  previewText.value = `${item.label} · ${item.identity} · 正在读取概况…`
  try {
    const text = await (props.loadPreview ?? fakePreview)(item, abort.signal)
    if (owns()) previewText.value = text
  } catch {
    if (owns()) previewText.value = `${item.identity} · 暂时无法读取，请重新悬停`
  }
}
function replace() {
  close()
  revision++
  items.value = records()
}
function switchSource() {
  source.value = source.value === '城市书房' ? '共享花园' : '城市书房'
  replace()
}
watch(mode, close, { flush: 'sync' })
onBeforeUnmount(() => {
  alive = false
  close()
})
</script>

<template>
  <div class="wall-demo">
    <h1>{{ source }} · 此刻各处</h1>
    <div role="group" aria-label="状态墙设置">
      <button type="button" data-source @click="switchSource">切换空间</button>
      <button type="button" data-replace @click="replace">更新记录</button>
      <label
        >排列
        <select v-model="mode">
          <option value="flat">平铺</option>
          <option value="group-grid">分组紧凑格</option>
          <option value="group-chip">分组横条</option>
        </select></label
      >
    </div>
    <p>选择位置查看当前身份；概况来自本页内存，稍后显示。</p>
    <div class="wall-demo-content">
      <NvScreenStatusWall
        :items="items"
        :mode="mode"
        :label="`${source}状态墙`"
        @preview="preview"
        @select="selected = $event.identity"
      />
      <NvScreenPanel title="位置概况"
        ><p data-preview role="status">{{ previewText }}</p>
        <p>当前选择：{{ selected }}</p></NvScreenPanel
      >
    </div>
  </div>
</template>

<style scoped>
@layer app {
  .wall-demo {
    height: 100%;
    padding: 24px;
    box-sizing: border-box;
    color: var(--nv-scr-text);
    background: var(--nv-scr-bg);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .wall-demo h1,
  .wall-demo p {
    margin: 0;
  }
  .wall-demo button,
  .wall-demo select {
    font: inherit;
    color: var(--nv-scr-text);
    background: var(--nv-scr-panel-a);
    border: 1px solid var(--nv-scr-line);
    padding: 8px 12px;
    border-radius: var(--nv-scr-radius);
  }
  .wall-demo-content {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 1fr);
    gap: 18px;
  }
}
</style>
