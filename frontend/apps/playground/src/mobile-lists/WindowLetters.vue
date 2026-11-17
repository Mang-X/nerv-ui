<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { NvVirtualList } from '@nerv-iip/ui-mobile'
const letters = Array.from({ length: 1000 }, (_, i) => ({
  id: `letter-${i + 1}`,
  title: `信笺 ${i + 1}`,
}))
const reversed = shallowRef(false)
const empty = shallowRef(false)
const selected = shallowRef('')
const rows = computed(() => (empty.value ? [] : reversed.value ? [...letters].reverse() : letters))
</script>

<template>
  <section aria-labelledby="window-title" class="space-y-3">
    <h2 id="window-title" class="text-lg font-semibold">千封信笺</h2>
    <p class="text-sm text-muted-foreground">在窗口内翻阅 1000 封信笺，点击记住一封。</p>
    <div class="flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="min-h-touch rounded-lg border border-border px-3 text-sm"
        @click="reversed = !reversed"
      >
        倒序信笺
      </button>
      <label class="flex min-h-touch items-center gap-2 text-sm"
        ><input v-model="empty" type="checkbox" aria-label="隐藏全部信笺" />隐藏全部信笺</label
      >
    </div>
    <output aria-label="信笺回显" class="block text-sm">{{
      selected ? `已选 ${selected}` : '尚未选择信笺'
    }}</output>
    <p v-if="empty" class="text-sm">没有信笺，取消勾选可继续翻阅。</p>
    <NvVirtualList
      :items="rows"
      :item-height="48"
      :buffer="2"
      class="h-60 overscroll-contain rounded-xl border border-border"
    >
      <template #default="{ item }">
        <button
          :key="item.id"
          type="button"
          data-window-row
          :data-letter-id="item.id"
          :aria-pressed="selected === item.id"
          class="h-12 w-full border-b border-border px-4 text-left text-sm focus-visible:outline-2"
          @click="selected = item.id"
        >
          {{ item.title }}
        </button>
      </template>
    </NvVirtualList>
  </section>
</template>
