<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  NvMobileInput,
  NvSearchBar,
  NvMobileRadioGroup,
  NvMobileRadioItem,
  NvMobileSwitch,
  NvMobileCheckbox,
  NvMobileButton,
  NvStepper,
  NvMobileRate,
  NvMobileSlider,
} from '@nerv-iip/ui-mobile'

const title = shallowRef('')
const keyword = shallowRef('')
const query = shallowRef('')
const searchEvent = shallowRef('尚未搜索')
const places = ['湖畔', '书屋', '花园']
const results = computed(() => places.filter((place) => place.includes(query.value)))
function search(value: string) {
  query.value = value
  searchEvent.value = `search：${value || '空'}`
}
function cancelSearch() {
  query.value = ''
  searchEvent.value = 'cancel'
}
const options = shallowRef([
  { value: 'pocket', label: '随身' },
  { value: 'desk', label: '书桌' },
  { value: 'travel', label: '旅途' },
])
const format = shallowRef('pocket')
const reminder = shallowRef(false)
const locked = shallowRef(false)
const formatLabel = computed(
  () => options.value.find((option) => option.value === format.value)?.label,
)
function restorePreferences() {
  format.value = 'desk'
  reminder.value = false
  locked.value = false
}
const copies = shallowRef(2)
const rating = shallowRef(0)
const progress = shallowRef(20)
const saves = shallowRef(0)
const action = shallowRef('尚未保存')
function save() {
  saves.value++
  action.value = `已保存第 ${saves.value} 次 · ${copies.value} 份 · ${rating.value} 星 · ${progress.value}%`
}
function resetFeeling() {
  rating.value = 0
  progress.value = 20
}
</script>

<template>
  <section
    aria-labelledby="words-heading"
    class="space-y-4 rounded-2xl border border-border bg-card p-4"
  >
    <h2 id="words-heading" class="text-lg font-semibold">写下灵感</h2>
    <label for="note-title" class="block text-sm font-medium">标题</label>
    <NvMobileInput
      id="note-title"
      v-model="title"
      name="title"
      maxlength="24"
      autocomplete="off"
      placeholder="给今天起个名字"
    >
      <template #leading>记</template>
      <template #trailing
        ><span class="whitespace-nowrap text-xs">{{ title.length }}/24 字</span></template
      >
    </NvMobileInput>
    <output aria-label="标题回显" class="block text-sm text-muted-foreground"
      >{{ title || '未命名' }} · {{ title.length }} 字</output
    >
    <NvSearchBar
      v-model="keyword"
      aria-label="寻找去处"
      cancelable
      placeholder="寻找湖畔、书屋或花园"
      class="px-0"
      @search="search"
      @cancel="cancelSearch"
    />
    <p aria-label="搜索结果" class="text-sm">{{ results.join(' · ') || '没有匹配的去处' }}</p>
    <output aria-label="搜索事件" class="block text-xs text-muted-foreground">{{
      searchEvent
    }}</output>
  </section>
  <section
    aria-labelledby="details-heading"
    class="space-y-4 rounded-2xl border border-border bg-card p-4"
  >
    <h2 id="details-heading" class="text-lg font-semibold">一点小细节</h2>
    <div class="flex min-h-touch flex-wrap items-center justify-between gap-3">
      <span>留存份数（1–5）</span>
      <NvStepper v-model="copies" :min="1" :max="5" />
    </div>
    <output aria-label="份数回显" class="block text-sm text-muted-foreground"
      >{{ copies }} 份</output
    >
    <p class="text-sm">今天有多喜欢？轻点半颗星，再点一次取消。</p>
    <NvMobileRate v-model="rating" allow-half :readonly="locked" aria-label="今日评分" />
    <output aria-label="评分回显" class="block text-sm text-muted-foreground"
      >{{ rating }} 星</output
    >
    <p id="progress-label" class="text-sm">灵感进度</p>
    <NvMobileSlider
      v-model="progress"
      :min="0"
      :max="100"
      :step="10"
      show-bubble
      :disabled="locked"
      aria-labelledby="progress-label"
      class="mx-5"
    />
    <output aria-label="进度回显" class="block text-sm text-muted-foreground"
      >{{ progress }}%</output
    >
    <NvMobileButton
      type="button"
      variant="primary"
      size="lg"
      block
      aria-label="保存记录"
      @click="save"
      >保存记录</NvMobileButton
    >
    <div class="flex flex-wrap items-center gap-3">
      <NvMobileButton type="button" variant="danger" size="sm" @click="title = ''"
        >清空标题</NvMobileButton
      >
      <NvMobileButton type="button" variant="text" @click="resetFeeling">重新感受</NvMobileButton>
      <NvMobileButton type="button" disabled aria-label="暂不可用" @click="save"
        >暂不可用</NvMobileButton
      >
    </div>
    <output aria-label="操作回显" class="block text-sm text-muted-foreground">{{ action }}</output>
  </section>
  <section
    aria-labelledby="preferences-heading"
    class="space-y-4 rounded-2xl border border-border bg-card p-4"
  >
    <h2 id="preferences-heading" class="text-lg font-semibold">记录偏好</h2>
    <NvMobileRadioGroup v-model="format" aria-label="记录方式">
      <NvMobileRadioItem v-for="option in options" :key="option.value" :value="option.value">{{
        option.label
      }}</NvMobileRadioItem>
    </NvMobileRadioGroup>
    <div class="flex min-h-touch items-center justify-between gap-3">
      <label for="note-reminder">灵感提醒</label>
      <NvMobileSwitch id="note-reminder" v-model="reminder" aria-label="灵感提醒" />
    </div>
    <NvMobileCheckbox v-model="locked" aria-label="锁定评分与进度">锁定评分与进度</NvMobileCheckbox>
    <output aria-label="偏好回显" class="block text-sm text-muted-foreground"
      >{{ formatLabel }} · 提醒{{ reminder ? '开' : '关' }} · 锁定{{ locked ? '开' : '关' }}</output
    >
    <div class="flex flex-wrap gap-3">
      <NvMobileButton
        type="button"
        variant="outline"
        aria-label="调整选项顺序"
        @click="options = [...options].reverse()"
        >调整顺序</NvMobileButton
      >
      <NvMobileButton type="button" aria-label="恢复偏好" @click="restorePreferences"
        >恢复偏好</NvMobileButton
      >
    </div>
  </section>
</template>
