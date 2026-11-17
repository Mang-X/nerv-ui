<script setup lang="ts">
import {
  NvAreaChart,
  NvCard,
  nvMessage,
  nvNotification,
  NvNotifierHost,
  Progress,
  NvQtyStepper,
  NvStationBar,
  NvStatTile,
  NvThemeToggle,
  NvTouchButton,
  NvTouchSegmented,
} from '@nerv-iip/ui'
import { BellRingIcon, CheckCircleIcon, CircleStopIcon, PauseIcon } from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

// 页面标题由 VitePress frontmatter 提供（原 definePage 已移除）

// 现场看板：尽量少的操作路径，触摸直达。
const now = ref('--:--:--')
let timer: ReturnType<typeof setInterval> | undefined
function tick() {
  now.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
}
onMounted(() => {
  tick()
  timer = setInterval(tick, 1000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const qty = 480
const done = ref(412)
const reportQty = ref(12)
const progress = computed(() => Math.round((done.value / qty) * 100))
const running = ref(true)

function report() {
  done.value = Math.min(qty, done.value + reportQty.value)
  nvNotification.success('提交成功', {
    description: `本次 ${reportQty.value} 条，累计 ${done.value}/${qty}。`,
  })
  reportQty.value = 12
}
function pause() {
  running.value = !running.value
  nvMessage.warning(running.value ? '已恢复运行' : '已暂停')
}
function call() {
  nvNotification.info('已呼叫负责人', { description: 'RES-07 请求支援，预计 3 分钟到位。' })
}
function finish() {
  nvNotification.success('记录完成', { description: 'REC-2406-0413 已提交复核。' })
}

const view = ref('queue')
const viewOptions = [
  { value: 'queue', label: '待处理' },
  { value: 'done', label: '已完成' },
]

const queue = [
  { code: 'REC-2406-0421', product: '季度回顾草稿', qty: 320 },
  { code: 'REC-2406-0426', product: '设计评审纪要', qty: 640 },
  { code: 'REC-2406-0430', product: '发布检查清单', qty: 5000 },
]
const finished = [
  { code: 'REC-2406-0408', product: '用户访谈记录', qty: 480 },
  { code: 'REC-2406-0405', product: '运营周报汇总', qty: 1200 },
]
const list = computed(() => (view.value === 'queue' ? queue : finished))

const takt = [
  { label: '1', value: 47 },
  { label: '2', value: 45 },
  { label: '3', value: 46 },
  { label: '4', value: 44 },
  { label: '5', value: 43 },
  { label: '6', value: 45 },
]
</script>

<template>
  <div class="nv-board min-h-screen bg-background p-5 text-foreground">
    <div class="mx-auto flex max-w-[1400px] flex-col gap-5">
      <NvStationBar
        station="RES-07 · 东仓区"
        :status-label="running ? '运行中' : '已暂停'"
        :tone="running ? 'success' : 'warning'"
        :pulse="running"
      >
        <template #right>
          <div class="text-sm text-muted-foreground">早班 · 张伟</div>
          <div class="font-mono text-2xl font-semibold tabular-nums">{{ now }}</div>
          <NvThemeToggle />
        </template>
      </NvStationBar>

      <div class="grid gap-5 lg:grid-cols-3">
        <!-- 当前记录 -->
        <NvCard class="lg:col-span-2 p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm text-muted-foreground">当前记录</p>
              <p class="mt-1 font-mono text-xl font-semibold">REC-2406-0413</p>
              <p class="mt-0.5 text-lg">发布检查清单</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-muted-foreground">完成进度</p>
              <p class="mt-1 text-4xl font-semibold tabular-nums">
                {{ done }}<span class="text-xl text-muted-foreground">/{{ qty }}</span>
              </p>
            </div>
          </div>
          <Progress :model-value="progress" class="mt-4 h-2.5" />

          <div class="mt-6 flex flex-wrap items-center gap-4">
            <div>
              <p class="mb-1.5 text-sm text-muted-foreground">提交数量</p>
              <NvQtyStepper v-model="reportQty" :min="1" :max="qty - done" :step="1" />
            </div>
            <div class="flex flex-1 flex-wrap items-end gap-3">
              <NvTouchButton variant="success" size="xl" class="flex-1" @click="report">
                <template #leading><CheckCircleIcon aria-hidden="true" /></template>
                提交
              </NvTouchButton>
              <NvTouchButton variant="warning" size="xl" @click="pause">
                <template #leading><PauseIcon aria-hidden="true" /></template>
                {{ running ? '暂停' : '恢复' }}
              </NvTouchButton>
              <NvTouchButton variant="outline" size="xl" @click="call">
                <template #leading><BellRingIcon aria-hidden="true" /></template>
                呼叫
              </NvTouchButton>
              <NvTouchButton variant="brand" size="xl" @click="finish">
                <template #leading><CircleStopIcon aria-hidden="true" /></template>
                完成
              </NvTouchButton>
            </div>
          </div>
        </NvCard>

        <!-- 实时指标 -->
        <div class="grid grid-cols-2 gap-4">
          <NvStatTile label="今日已完成" :value="done" unit="条" tone="brand" />
          <NvStatTile label="当前节奏" value="45" unit="s/条" tone="neutral" />
          <NvStatTile label="合格率" value="99.2" unit="%" tone="success" />
          <NvStatTile label="利用率" value="78.6" unit="%" tone="warning" />
        </div>
      </div>

      <div class="grid gap-5 lg:grid-cols-3">
        <!-- 队列 -->
        <NvCard class="lg:col-span-2 p-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">记录队列</h2>
            <NvTouchSegmented v-model="view" :options="viewOptions" />
          </div>
          <ul class="mt-4 divide-y divide-border">
            <li v-for="item in list" :key="item.code" class="flex min-h-16 items-center gap-4 py-3">
              <span class="font-mono text-base text-muted-foreground">{{ item.code }}</span>
              <span class="flex-1 text-lg font-medium">{{ item.product }}</span>
              <span class="text-lg tabular-nums text-muted-foreground">{{ item.qty }} 条</span>
            </li>
          </ul>
        </NvCard>

        <!-- 节奏趋势 -->
        <NvCard class="p-6">
          <h2 class="text-lg font-semibold">节奏趋势</h2>
          <p class="mt-0.5 text-sm text-muted-foreground">秒 / 条 · 近 6 条</p>
          <NvAreaChart class="mt-4" :data="takt" :height="160" value-suffix=" s" />
        </NvCard>
      </div>
    </div>

    <NvNotifierHost />
  </div>
</template>
