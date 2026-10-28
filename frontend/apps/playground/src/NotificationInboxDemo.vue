<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { NvNotificationInbox, NvButton, type NvNotificationItem } from '@nerv-iip/ui'
const props = defineProps<{ space: 'library' | 'studio' }>()
const selected = shallowRef<string | null>(null)
const filter = shallowRef('all')
const loading = shallowRef(false)
const error = shallowRef('')
const pending = ref<string[]>([])
const accept = shallowRef(true)
const records = ref<NvNotificationItem[]>([
  {
    key: 'notice',
    title: props.space === 'library' ? '预约书籍可以领取' : '展览布置时间调整',
    summary: '请在约定时间到服务台确认。\n如需调整，请联系值班人员。',
    read: false,
    meta: '今天 09:30',
    statuses: [
      { label: '需关注', tone: 'warning' },
      { label: '待确认', tone: 'info' },
    ],
  },
  {
    key: 'task',
    title: props.space === 'library' ? '整理阅读角' : '检查展厅灯光',
    code: 'PLAN-028',
    meta: '今天 14:00',
    statuses: [{ label: '待处理', tone: 'neutral' }],
  },
])
const visible = computed(() =>
  records.value.filter((item) => filter.value !== 'unread' || item.read === false),
)
function mark(item: NvNotificationItem) {
  pending.value = [item.key]
  error.value = ''
}
function finish(success: boolean) {
  if (success)
    records.value = records.value.map((item) =>
      pending.value.includes(item.key) ? { ...item, read: true } : item,
    )
  else error.value = '暂时无法标记，请稍后重试。'
  pending.value = []
}
function loaded() {
  loading.value = false
  error.value = ''
}
function loadError() {
  loading.value = false
  error.value = '暂时无法加载，请稍后刷新。'
}
</script>
<template>
  <main class="mx-auto grid max-w-3xl gap-4 p-6">
    <nav class="flex flex-wrap gap-4">
      <a href="#">返回首页</a><a href="#notifications/library">晨光书房</a
      ><a href="#notifications/studio">小巷展厅</a>
    </nav>
    <h1 class="text-xl font-semibold">
      {{ space === 'library' ? '晨光书房' : '小巷展厅' }} · 消息与安排
    </h1>
    <div class="flex flex-wrap gap-2">
      <NvButton data-reject variant="outline" @click="accept = !accept">{{
        accept ? '暂缓更改' : '允许更改'
      }}</NvButton>
      <NvButton data-success :disabled="!pending.length" @click="finish(true)">完成标记</NvButton>
      <NvButton data-failure :disabled="!pending.length" variant="outline" @click="finish(false)"
        >稍后重试</NvButton
      >
      <NvButton data-loaded variant="outline" @click="loaded">查看消息</NvButton>
      <NvButton data-load-error variant="outline" @click="loadError">连接中断</NvButton>
      <NvButton
        data-replace
        variant="outline"
        @click="
          records = records
            .map((item) => ({ ...item, summary: '安排已更新，请确认新的时间。' }))
            .reverse()
        "
        >更新安排</NvButton
      >
    </div>
    <NvNotificationInbox
      title="消息与安排"
      :items="visible"
      :selected-key="selected"
      :filter="filter"
      :filters="[
        { value: 'all', label: '全部' },
        { value: 'unread', label: '未读' },
      ]"
      :loading="loading"
      :error="error"
      :pending-keys="pending"
      @update:selected-key="accept && (selected = $event)"
      @update:filter="accept && (filter = $event)"
      @mark-read="mark"
      @refresh="loading = true"
    >
      <template #meta="{ item }"
        ><span>{{ item.meta }}</span></template
      >
      <template #action="{ item, pending: busy }"
        ><NvButton
          v-if="item.key === 'task'"
          variant="ghost"
          :disabled="busy"
          @click="selected = item.key"
          >查看安排</NvButton
        ></template
      >
      <template #detail="{ item }"
        ><p class="whitespace-pre-wrap break-anywhere text-sm">{{ item.summary }}</p>
        <p class="text-xs text-muted-foreground">{{ item.meta }}</p></template
      >
    </NvNotificationInbox>
  </main>
</template>
