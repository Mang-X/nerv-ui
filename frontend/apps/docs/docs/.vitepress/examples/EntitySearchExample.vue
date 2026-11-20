<script setup lang="ts">
import { computed, ref } from 'vue'
import { NvEntityMultiPicker, type EntityPickerOption } from '@nerv-ui/ui'

const catalog: EntityPickerOption[] = Array.from({ length: 24 }, (_, index) => {
  const code = `SPACE-${String(index + 1).padStart(3, '0')}`
  return {
    value: code,
    code,
    label: `共享空间 ${index + 1}`,
    hint: index % 2 ? '创作区' : '安静区',
  }
})
const selected = ref<string[]>([])
const search = ref('')
const visibleCount = ref(8)
const appendCount = ref(0)
const matching = computed(() => {
  const query = search.value.trim().toLowerCase()
  return catalog.filter((option) =>
    `${option.label} ${option.code} ${option.hint}`.toLowerCase().includes(query),
  )
})
const pageOptions = computed(() => matching.value.slice(0, visibleCount.value))
function updateSearch(value: string) {
  search.value = value
  visibleCount.value = 8
  appendCount.value = 0
}
function loadMore() {
  if (visibleCount.value >= matching.value.length) return
  visibleCount.value = Math.min(visibleCount.value + 8, matching.value.length)
  appendCount.value += 1
}
</script>

<template>
  <section class="w-full min-w-0 max-w-sm space-y-3" aria-label="宿主搜索与追加示例">
    <NvEntityMultiPicker
      id="ep-paged-spaces"
      v-model="selected"
      :options="pageOptions"
      :search="search"
      :total-count="matching.length"
      title="选择共享空间"
      aria-label="可追加空间"
      server-search
      @update:search="updateSearch"
      @load-more="loadMore"
    />
    <p role="status" class="text-sm break-words text-muted-foreground">
      当前搜索：{{ search || '（全部）' }}；已显示 {{ pageOptions.length }} /
      {{ matching.length }}； 本次已追加 {{ appendCount }} 批。
    </p>
    <p class="text-sm text-muted-foreground">
      可搜“SPACE-017”或“共享空间”；向下滚动候选列表加载下一批。此例同步查询本地目录，不发送网络请求。
    </p>
  </section>
</template>
