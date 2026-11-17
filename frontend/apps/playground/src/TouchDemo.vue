<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  NvApp,
  NvStationBar,
  NvQtyStepper,
  NvStatTile,
  NvTouchSegmented,
  NvTouchButton,
  useColorMode,
  useTheme,
} from '@nerv-iip/ui'
const { isDark, toggle } = useColorMode()
const { theme, setTheme } = useTheme()
const cornerTone = shallowRef<'success' | 'warning' | 'danger' | 'info' | 'neutral'>('success')
const pulse = shallowRef(true)
const statuses = [
  { value: 'success', label: '开放中' },
  { value: 'warning', label: '稍作休息' },
  { value: 'danger', label: '暂时关闭' },
  { value: 'info', label: '新活动' },
  { value: 'neutral', label: '未开放' },
] as const
const tiles = [
  { tone: 'neutral', label: '阅读计划', value: '随心', unit: '' },
  { tone: 'brand', label: '本周精选', value: 12, unit: '本' },
  { tone: 'success', label: '可用座位', value: 8, unit: '席' },
  { tone: 'warning', label: '即将开始', value: 5, unit: '分钟' },
  { tone: 'danger', label: '待确认', value: 1, unit: '项' },
] as const
const variants = [
  { value: 'default', label: '默认' },
  { value: 'brand', label: '品牌' },
  { value: 'success', label: '成功' },
  { value: 'warning', label: '提醒' },
  { value: 'destructive', label: '危险' },
  { value: 'outline', label: '描边' },
  { value: 'ghost', label: '轻量' },
] as const
const books = shallowRef(2)
const duration = shallowRef(10)
const loading = shallowRef(false)
const completed = shallowRef(0)
const feedback = shallowRef('尚未开始')
function startExperience() {
  loading.value = true
  feedback.value = '本地体验进行中'
}
function finishExperience() {
  loading.value = false
  completed.value++
  feedback.value = `已完成 ${completed.value} 次本地体验`
}
const mode = shallowRef('read')
const modes = [
  { value: 'read', label: '阅读' },
  { value: 'listen', label: '聆听' },
  { value: 'rest', label: '休息' },
]
const selectedMode = computed(() => modes.find((item) => item.value === mode.value)?.label)
const statusLabel = computed(
  () => statuses.find((status) => status.value === cornerTone.value)?.label,
)
function resetReading() {
  books.value = 2
  duration.value = 10
  mode.value = 'read'
}
</script>

<template>
  <NvApp>
    <main class="mx-auto max-w-6xl space-y-8 p-6">
      <nav aria-label="演示入口">
        <a href="#files" class="inline-flex min-h-11 items-center px-3 underline">留住片刻</a>
        <a href="#mobile-feedback" class="inline-flex min-h-touch items-center">片刻回响</a>
        <a href="#mobile-lists" class="inline-flex min-h-touch items-center">翻阅时光</a>
        <a
          href="#desktop"
          class="inline-flex min-h-11 items-center rounded-lg px-4 underline focus-visible:outline-2"
          >桌面演示</a
        >
      </nav>
      <NvStationBar
        station="共享阅读角"
        :status-label="statusLabel"
        :tone="cornerTone"
        :pulse="pulse"
        class="flex-wrap"
      >
        <template #right>
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-sm text-muted-foreground">本地体验 · R-01</span>
            <NvTouchButton
              size="md"
              variant="outline"
              aria-label="蓝色强调色"
              :aria-pressed="theme === 'blue'"
              @click="setTheme(theme === 'blue' ? 'neutral' : 'blue')"
              >蓝色强调色</NvTouchButton
            >
            <NvTouchButton
              size="md"
              variant="outline"
              aria-label="深色模式"
              :aria-pressed="isDark"
              @click="toggle"
              >{{ isDark ? '切换浅色' : '切换深色' }}</NvTouchButton
            >
          </div>
        </template>
      </NvStationBar>
      <p class="text-muted-foreground">
        选择节奏，留一点时间给自己。所有数据仅在本页内存中，刷新即可重置。
      </p>
      <section aria-labelledby="status-heading" class="space-y-4">
        <h2 id="status-heading" class="text-xl font-semibold">此刻的阅读角</h2>
        <div class="flex flex-wrap items-center gap-4">
          <label for="corner-status" class="space-y-2">
            <span class="block text-sm font-medium">状态文字与语气</span>
            <select
              id="corner-status"
              v-model="cornerTone"
              class="min-h-14 rounded-xl border border-border bg-card px-4 text-foreground focus-visible:outline-2"
            >
              <option v-for="status in statuses" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </label>
          <label
            for="corner-pulse"
            class="inline-flex min-h-14 cursor-pointer items-center gap-3 rounded-xl px-4 focus-within:outline-2"
          >
            <input id="corner-pulse" v-model="pulse" type="checkbox" class="size-5 accent-brand" />
            状态点脉冲
          </label>
        </div>
        <div
          id="touch-metrics"
          aria-label="指标语义色"
          class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <NvStatTile
            v-for="tile in tiles"
            :key="tile.tone"
            :label="tile.label"
            :value="tile.value"
            :unit="tile.unit"
            :tone="tile.tone"
          >
            <span class="mt-4 text-sm text-muted-foreground">{{ tile.tone }}</span>
          </NvStatTile>
        </div>
      </section>
      <section aria-labelledby="reading-heading" class="space-y-4">
        <h2 id="reading-heading" class="text-xl font-semibold">留给自己的时间</h2>
        <NvTouchSegmented v-model="mode" :options="modes" aria-label="阅读方式" />
        <div
          role="tabpanel"
          aria-label="当前阅读方式"
          tabindex="0"
          class="rounded-xl border border-border p-4 focus-visible:outline-2"
        >
          当前选择：{{ selectedMode }}。按自己的节奏体验。
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <NvStatTile label="阅读本数" :value="books" unit="本" tone="brand">
            <div class="mt-5 space-y-3">
              <p>0–5 本，每次调整 1 本</p>
              <NvQtyStepper v-model="books" :min="0" :max="5" role="group" aria-label="阅读本数" />
              <output aria-label="阅读本数回显" class="block text-sm">{{ books }} 本</output>
            </div>
          </NvStatTile>
          <NvStatTile label="阅读时长" :value="duration" unit="分钟">
            <div class="mt-5 space-y-3">
              <p>5–18 分钟，步长 5，触界时截到上限或下限</p>
              <NvQtyStepper
                v-model="duration"
                :min="5"
                :max="18"
                :step="5"
                role="group"
                aria-label="阅读时长"
              />
              <output aria-label="阅读时长回显" class="block text-sm">{{ duration }} 分钟</output>
            </div>
          </NvStatTile>
        </div>
        <NvTouchButton variant="outline" aria-label="重置阅读设置" @click="resetReading"
          >重置阅读设置</NvTouchButton
        >
      </section>
      <section id="touch-actions" aria-labelledby="actions-heading" class="space-y-4">
        <h2 id="actions-heading" class="text-xl font-semibold">轻触，开始一次体验</h2>
        <p class="text-muted-foreground">加载由你手动结束，方便观察按钮状态；不发送请求。</p>
        <NvTouchButton
          variant="brand"
          size="xl"
          block
          :loading="loading"
          aria-label="开始本地体验"
          @click="startExperience"
        >
          <template #leading><span aria-hidden="true">↗</span></template>
          {{ loading ? '体验进行中' : '开始本地体验' }}
        </NvTouchButton>
        <div class="flex flex-wrap gap-3">
          <NvTouchButton
            variant="outline"
            :disabled="!loading"
            aria-label="结束本地体验"
            @click="finishExperience"
            >结束本地体验</NvTouchButton
          >
          <NvTouchButton disabled aria-label="暂不可用" @click="feedback = '不应被激活'"
            >暂不可用</NvTouchButton
          >
        </div>
        <h3 class="font-medium">语义变体</h3>
        <div aria-label="按钮语义变体" class="flex flex-wrap gap-3">
          <NvTouchButton
            v-for="variant in variants"
            :key="variant.value"
            :variant="variant.value"
            @click="feedback = `已体验：${variant.label}`"
            >{{ variant.label }}</NvTouchButton
          >
        </div>
        <h3 class="font-medium">三种尺寸</h3>
        <div aria-label="按钮尺寸" class="flex flex-wrap items-center gap-3">
          <NvTouchButton size="md" @click="feedback = '已体验：md'">md · 44px</NvTouchButton>
          <NvTouchButton size="lg" @click="feedback = '已体验：lg'">lg · 56px</NvTouchButton>
          <NvTouchButton size="xl" @click="feedback = '已体验：xl'">xl · 72px</NvTouchButton>
        </div>
        <div class="flex flex-wrap gap-3">
          <NvTouchButton as="a" href="#touch-metrics" variant="outline">查看指标</NvTouchButton>
          <NvTouchButton as-child variant="ghost"
            ><a href="#touch-actions">回到操作示例</a></NvTouchButton
          >
        </div>
        <output
          aria-label="操作回显"
          aria-live="polite"
          class="block rounded-xl border border-border p-4"
          >{{ feedback }}</output
        >
      </section>
    </main>
  </NvApp>
</template>
