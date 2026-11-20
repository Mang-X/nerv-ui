<script setup lang="ts">
import { computed, ref } from 'vue'
import { NvButton, NvEntityMultiPicker, useColorMode, type EntityPickerOption } from '@nerv-ui/ui'

// 旧字段的逗号格式由这个宿主转换；公共组件始终只接收数组。
const storedPlaces = ref('0')
const chosenPlaces = computed({
  get: () => storedPlaces.value.split(',').filter(Boolean),
  set: (values: string[]) => {
    storedPlaces.value = values.join(',')
  },
})
const placeOptions: EntityPickerOption[] = [
  { value: '0', label: '晨光书房' },
  { value: 'garden', label: '河岸花园' },
  { value: 'gallery', label: '街角画廊' },
]

const chosenSpaces = ref<string[]>(['旧日庭院'])
const search = ref('')
const visibleCount = ref(8)
const loadCount = ref(0)
const disabled = ref(false)
const invalid = ref(false)
const showPicker = ref(true)
const renamed = ref(false)
const moveAfterPick = ref(false)
const catalog = computed<EntityPickerOption[]>(() => [
  { value: 'a,b', label: renamed.value ? '林间小屋新址' : '林间小屋', code: '林间' },
  { value: 'lake-east', label: '湖畔工作室', code: '东岸' },
  { value: 'lake-west', label: '湖畔工作室', code: '西岸' },
  ...Array.from({ length: 19 }, (_, index) => ({
    value: `space-${index + 1}`,
    label: `共享空间 ${index + 1}`,
    code: `第 ${index + 1} 间`,
  })),
])
const matching = computed(() =>
  catalog.value.filter((option) => option.label.includes(search.value.trim())),
)
const pageOptions = computed(() => matching.value.slice(0, visibleCount.value))
function updateSearch(value: string) {
  search.value = value
  visibleCount.value = 8
}
function loadMore() {
  if (visibleCount.value >= matching.value.length) return
  visibleCount.value += 8
  loadCount.value += 1
}
function replaceSelection() {
  chosenSpaces.value = ['a,b']
}
function updateSpaces(values: string[]) {
  const added = values.some((value) => !chosenSpaces.value.includes(value))
  chosenSpaces.value = values
  if (added && moveAfterPick.value) updateSearch('共享空间')
}
const { isDark, toggle } = useColorMode()
</script>

<template>
  <main class="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 text-foreground">
    <nav class="flex flex-wrap gap-4 text-sm text-brand-strong">
      <a href="#desktop" class="underline">返回桌面</a>
      <a href="#touch" class="underline">触屏演示</a>
      <a href="#mobile" class="underline">移动演示</a>
    </nav>
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">挑选去处</h1>
        <p class="mt-1 text-sm text-muted-foreground">挑几个想去的地方，随时可以调整。</p>
      </div>
      <NvButton variant="outline" @click="toggle">{{ isDark ? '切换浅色' : '切换深色' }}</NvButton>
    </header>
    <div class="grid min-w-0 gap-5 md:grid-cols-2">
      <section class="min-w-0 space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 class="text-base font-semibold">散步清单</h2>
        <p class="text-sm text-muted-foreground">选一处，再选下一处。</p>
        <NvEntityMultiPicker
          v-model="chosenPlaces"
          :options="placeOptions"
          title="选择去处"
          aria-label="散步去处"
          selection-empty-text="还没有挑选去处"
          :show-code="false"
        />
      </section>
      <section class="min-w-0 space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 class="text-base font-semibold">共享空间</h2>
        <p class="text-sm text-muted-foreground">可搜索更多空间，已选的会留在下方。</p>
        <div class="flex flex-wrap gap-2">
          <NvButton variant="outline" size="sm" @click="replaceSelection">换一处</NvButton>
          <NvButton variant="outline" size="sm" @click="renamed = !renamed">更新名称</NvButton>
          <NvButton variant="outline" size="sm" @click="moveAfterPick = !moveAfterPick">
            {{ moveAfterPick ? '停留当前清单' : '选后看其他空间' }}
          </NvButton>
          <NvButton variant="outline" size="sm" @click="disabled = !disabled">
            {{ disabled ? '恢复选择' : '暂停选择' }}
          </NvButton>
          <NvButton variant="outline" size="sm" @click="invalid = !invalid">
            {{ invalid ? '收起提示' : '查看提示' }}
          </NvButton>
          <NvButton variant="outline" size="sm" @click="showPicker = !showPicker">
            {{ showPicker ? '收起选择' : '继续选择' }}
          </NvButton>
        </div>
        <NvEntityMultiPicker
          v-if="showPicker"
          :model-value="chosenSpaces"
          :options="pageOptions"
          title="选择空间"
          aria-label="共享空间"
          :aria-describedby="invalid ? 'space-error' : undefined"
          :search="search"
          :total-count="matching.length"
          :disabled="disabled"
          :invalid="invalid"
          server-search
          @update:model-value="updateSpaces"
          @update:search="updateSearch"
          @load-more="loadMore"
        />
        <p v-if="invalid" id="space-error" class="text-xs text-destructive">请确认所选空间。</p>
        <p role="status" class="text-sm text-muted-foreground">
          {{ loadCount ? '更多空间已显示' : '可以继续查找空间' }}
        </p>
      </section>
    </div>
  </main>
</template>
