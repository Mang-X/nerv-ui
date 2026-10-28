<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import Recipe from './ScreenDashboardRecipe.vue'
import { dashboardInput, type DashboardInput } from './dashboardInput'
const props = defineProps<{
  load?: (source: 'reading' | 'exhibition') => Promise<DashboardInput>
}>()
const source = ref<'reading' | 'exhibition'>('reading')
const input = ref(dashboardInput('reading'))
const page = ref(1)
const view = ref<'chart' | 'detail'>('chart')
const now = ref(1000)
const pending = ref(false)
const selected = ref('')
let generation = 0
function switchSource(next: 'reading' | 'exhibition') {
  generation++
  pending.value = false
  source.value = next
  input.value = dashboardInput(next)
  now.value = 1000
  page.value = 1
  selected.value = ''
}
async function refresh() {
  const request = ++generation
  const key = source.value
  pending.value = true
  try {
    const next = await (props.load?.(key) ??
      Promise.resolve({ ...dashboardInput(key), updatedAt: now.value }))
    if (request === generation && next.key === key) input.value = next
  } catch {
    if (request === generation) input.value = { ...input.value, error: '更新失败，保留上次安排' }
  } finally {
    if (request === generation) pending.value = false
  }
}
onUnmounted(() => {
  generation++
})
</script>
<template>
  <main class="nv-scr-dashboard-demo">
    <nav aria-label="安排来源">
      <button @click="switchSource('reading')">阅读活动</button
      ><button @click="switchSource('exhibition')">展览安排</button
      ><button @click="refresh">更新安排</button><button @click="now += 61000">查看一分钟后</button>
    </nav>
    <p v-if="pending" role="status">正在更新</p>
    <p v-if="selected">已选择：{{ selected }}</p>
    <Recipe
      :input="input"
      :page="page"
      :view="view"
      :now="now"
      @page="page = $event"
      @view="view = $event"
      @entry="selected = $event"
    />
  </main>
</template>
<style scoped>
@layer app {
  .nv-scr-dashboard-demo {
    padding: 24px;
    color: var(--nv-scr-text);
  }
  .nv-scr-dashboard-demo nav {
    display: flex;
    gap: 16px;
  }
  .nv-scr-dashboard-demo button {
    padding: 8px 16px;
    color: var(--nv-scr-text);
    background: var(--nv-scr-bg-accent);
    border: 1px solid var(--nv-scr-line);
  }
  .nv-scr-dashboard-demo button:focus-visible {
    outline: 2px solid var(--nv-scr-cyan);
  }
}
</style>
