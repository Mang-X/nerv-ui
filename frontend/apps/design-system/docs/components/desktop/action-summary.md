---
title: NvActionSummary 行动摘要卡
---

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CalendarDaysIcon, BookOpenIcon } from '@lucide/vue'
import { NvActionSummary, type NvActionSummaryState } from '@nerv-iip/ui'

const planState = ref<NvActionSummaryState>('data')
const readingState = ref<NvActionSummaryState>('empty')
const zero = ref(false)
const noPreview = ref(false)
const changed = ref(false)
const notice = ref('选择卡片下方的操作，查看结果。')
const planItems = computed(() => noPreview.value ? [] : changed.value
  ? [{ key: 'walk', primary: '去河边散步', secondary: '18:30 · 今天' }]
  : [{ key: 'read', primary: '读完这一章', secondary: '09:30 · 今天' }, { key: 'tea', primary: '和朋友喝茶', secondary: '15:00 · 今天' }])
</script>

# NvActionSummary 行动摘要卡

用于「数量 + 最近预览 + 出口」的固定高度桌面卡。状态、数量、文案、预览都由宿主提供；`retry` 与 `action` 事件交给宿主处理。

<Demo>
  <div class="w-full space-y-4">
    <div class="flex flex-wrap gap-4 text-sm">
      <label>今日安排状态 <select v-model="planState" aria-label="今日安排状态" class="rounded-md border border-border bg-card px-2 py-1"><option value="pending">等待中</option><option value="error">读取失败</option><option value="unavailable">暂不可用</option><option value="data">有安排</option><option value="empty">已清空</option></select></label>
      <label>阅读清单状态 <select v-model="readingState" aria-label="阅读清单状态" class="rounded-md border border-border bg-card px-2 py-1"><option value="pending">等待中</option><option value="error">读取失败</option><option value="unavailable">暂不可用</option><option value="data">有内容</option><option value="empty">已清空</option></select></label>
      <label><input v-model="zero" type="checkbox" /> 今日数量为零</label>
      <label><input v-model="noPreview" type="checkbox" /> 暂无最近预览</label>
      <button type="button" class="text-brand-strong underline" @click="changed = !changed">换一组安排</button>
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      <NvActionSummary title="今日安排" description="挑一件想做的小事，从现在开始。" :icon="CalendarDaysIcon" tone="warning" :state="planState" :count="planState === 'empty' || zero ? 0 : 2" unit="项" :items="planItems" empty-title="今天已清空" empty-hint="新安排到来时会出现在这里。" error-title="暂时无法读取今天的安排" error-hint="目前无法取得今日安排的最新内容，也不能判断是否还有需要处理的项目。" unavailable-title="安排暂不可用" unavailable-hint="请稍后查看这一路。" action-label="查看全部安排" @retry="notice = '今日安排已请求重新读取。'" @action="notice = '已打开今日安排。'" />
      <NvActionSummary title="阅读清单" description="留一点时间给喜欢的书。" :icon="BookOpenIcon" tone="brand" :state="readingState" :count="readingState === 'empty' ? 0 : 1" unit="本" :items="[{ key: 'poem', primary: '诗歌选集', secondary: '今晚 · 20:00' }]" empty-title="都读完了" empty-hint="下一本好书很快会来。" error-title="暂时取不到清单" error-hint="现在无法判断还剩多少本书。" unavailable-title="阅读清单暂不可用" unavailable-hint="稍后再来看。" action-label="查看阅读清单" @retry="notice = '阅读清单已请求重新读取。'" @action="notice = '已打开阅读清单。'" />
    </div>
    <p role="status" class="text-sm text-muted-foreground">{{ notice }}</p>
  </div>
</Demo>

## API

| 输入                                                                                        | 类型                                                                 | 用途                                              |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------- |
| `title`, `description`, `icon`                                                              | `string`, `string`, `Component`                                      | 主张与图标                                        |
| `state`                                                                                     | `pending / error / unavailable / data / empty`                       | 宿主确认的五态                                    |
| `count`, `unit`, `badge`                                                                    | `number / null`, `string`, `string`                                  | 可信数量及补充读数；`0` 保留，缺失或非整数显 `—`  |
| `items`                                                                                     | `readonly NvActionSummaryItem[]`                                     | 人可读预览，最多显示四条；`key/primary/secondary` |
| `emptyTitle`, `emptyHint`, `errorTitle`, `errorHint`, `unavailableTitle`, `unavailableHint` | `string`                                                             | 各状态文案由宿主输入                              |
| `retryLabel`, `actionLabel`, `tone`, `class`                                                | `string`, `string`, `NvActionSummaryTone`, `HTMLAttributes['class']` | 可选重试文案、出口、色阶与容器样式                |

`retry` 仅在 `error` 的重试按钮点击时发出；`action` 由底部出口发出，不携带路由或 DTO。省略 `actionLabel` 时不显示出口。宿主各自监听两张卡的事件，决定当前动作身份。

当 `state='data'` 且没有最近预览时，卡片显示“暂无最近预览”；即使 `count` 为 `0` 或未知，也不会推断为 `empty`。长状态文案在固定卡片的内容区内滚动，底部出口保留可达。

<!-- @include: ../../../../../DESIGN/components/action-summary.md -->
