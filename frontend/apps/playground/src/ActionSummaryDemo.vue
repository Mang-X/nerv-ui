<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue'
import { NvActionSummary, NvButton, useColorMode, type NvActionSummaryState } from '@nerv-iip/ui'

const CalendarIcon = defineComponent({ render: () => h('span', '✦') })
const BookIcon = defineComponent({ render: () => h('span', '◈') })

const leftState = ref<NvActionSummaryState>('data')
const rightState = ref<NvActionSummaryState>('empty')
const countMode = ref<'three' | 'zero' | 'unknown'>('three')
const noPreview = ref(false)
const alternate = ref(false)
const activity = ref('请选择一张卡片的操作。')
const { isDark, toggle } = useColorMode()

const leftCount = computed(() =>
  leftState.value === 'empty'
    ? 0
    : countMode.value === 'unknown'
      ? null
      : countMode.value === 'zero'
        ? 0
        : 3,
)
const leftItems = computed(() =>
  noPreview.value
    ? []
    : alternate.value
      ? [
          {
            key: 'garden',
            primary: '傍晚沿着河岸花园散步，顺便看看新开的花',
            secondary: '今天 18:30 · 从东门出发，经过河岸步道',
          },
          { key: 'letter', primary: '给朋友写信', secondary: '19:00 · 今天' },
        ]
      : [
          { key: 'read', primary: '读完这一章', secondary: '09:30 · 今天' },
          { key: 'walk', primary: '去公园走走', secondary: '11:00 · 今天' },
          { key: 'tea', primary: '和朋友喝茶', secondary: '15:00 · 今天' },
        ],
)

function retry(card: string) {
  activity.value = `${card}已请求重新读取。`
}
function open(card: string) {
  activity.value = `已打开${card}。`
}
</script>

<template>
  <main class="mx-auto max-w-5xl space-y-6 px-4 py-8 text-foreground">
    <nav class="flex flex-wrap gap-4 text-sm text-brand-strong">
      <a href="#desktop" class="underline">返回桌面</a
      ><a href="#touch" class="underline">触屏演示</a
      ><a href="#mobile" class="underline">移动演示</a>
    </nav>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">今日小事</h1>
        <p class="mt-1 text-sm text-muted-foreground">先看一眼，再决定从哪里开始。</p>
      </div>
      <NvButton variant="outline" @click="toggle">{{ isDark ? '切换浅色' : '切换深色' }}</NvButton>
    </div>
    <div class="flex flex-wrap gap-4">
      <label class="grid gap-1 text-sm"
        >今日安排的状态<select
          v-model="leftState"
          class="h-9 rounded-md border border-border bg-card px-2"
        >
          <option value="pending">等待中</option>
          <option value="error">读取失败</option>
          <option value="unavailable">暂不可用</option>
          <option value="data">有安排</option>
          <option value="empty">已清空</option>
        </select></label
      >
      <label class="grid gap-1 text-sm"
        >阅读清单的状态<select
          v-model="rightState"
          class="h-9 rounded-md border border-border bg-card px-2"
        >
          <option value="pending">等待中</option>
          <option value="error">读取失败</option>
          <option value="unavailable">暂不可用</option>
          <option value="data">有内容</option>
          <option value="empty">已清空</option>
        </select></label
      >
      <label class="grid gap-1 text-sm"
        >今日数量<select
          v-model="countMode"
          class="h-9 rounded-md border border-border bg-card px-2"
        >
          <option value="three">三项</option>
          <option value="zero">零项</option>
          <option value="unknown">尚未确认</option>
        </select></label
      >
      <NvButton variant="outline" class="self-end" @click="alternate = !alternate"
        >换一组安排</NvButton
      >
      <label class="flex items-center gap-2 self-end text-sm"
        ><input v-model="noPreview" type="checkbox" /> 暂无最近预览</label
      >
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      <NvActionSummary
        title="今日安排"
        description="挑一件想做的小事，从现在开始。"
        :icon="CalendarIcon"
        tone="warning"
        :state="leftState"
        :count="leftCount"
        unit="项"
        :items="leftItems"
        empty-title="今天已清空"
        empty-hint="新安排到来时会出现在这里。"
        error-title="暂时无法读取今天的安排"
        error-hint="目前无法取得今日安排的最新内容，也不能判断是否还有需要处理的项目。"
        unavailable-title="安排暂不可用"
        unavailable-hint="请稍后查看这一路。"
        action-label="查看全部安排"
        @retry="retry('今日安排')"
        @action="open('今日安排')"
      />
      <NvActionSummary
        title="阅读清单"
        description="留一点时间给喜欢的书。"
        :icon="BookIcon"
        tone="brand"
        :state="rightState"
        :count="rightState === 'empty' ? 0 : 2"
        unit="本"
        :items="[
          { key: 'poem', primary: '诗歌选集', secondary: '今天 · 20:00' },
          { key: 'story', primary: '远方的故事', secondary: '明天 · 10:00' },
        ]"
        empty-title="都读完了"
        empty-hint="下一本好书很快会来。"
        error-title="暂时取不到清单"
        error-hint="现在无法判断还剩多少本书。"
        unavailable-title="阅读清单暂不可用"
        unavailable-hint="稍后再来看。"
        action-label="查看阅读清单"
        @retry="retry('阅读清单')"
        @action="open('阅读清单')"
      />
    </div>
    <p role="status" class="text-sm text-muted-foreground">{{ activity }}</p>
  </main>
</template>
