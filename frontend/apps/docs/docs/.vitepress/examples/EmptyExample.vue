<script setup lang="ts">
import { ref } from 'vue'
import { BookOpen } from '@lucide/vue'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  NvButton,
  NvSelect,
  NvSelectContent,
  NvSelectItem,
  NvSelectTrigger,
  NvSelectValue,
} from '@nerv-ui/ui'

const hasContent = ref(true)
const variant = ref<'default' | 'icon'>('default')
const feedback = ref('当前有一项阅读安排。')
function clear() {
  hasContent.value = false
  feedback.value = '当前没有阅读安排。'
}
function restore() {
  hasContent.value = true
  feedback.value = '已恢复本页的阅读安排；刷新后重新开始。'
}
</script>

<template>
  <section class="w-full min-w-0 space-y-4 break-words" aria-label="阅读安排">
    <div class="flex flex-wrap items-center gap-3">
      <NvButton type="button" :disabled="!hasContent" @click="clear">清空本页安排</NvButton>
      <label class="flex flex-wrap items-center gap-2 text-sm">
        空态图示
        <NvSelect v-model="variant">
          <NvSelectTrigger class="w-36"><NvSelectValue placeholder="选择图示" /></NvSelectTrigger>
          <NvSelectContent>
            <NvSelectItem value="default">文字图示</NvSelectItem>
            <NvSelectItem value="icon">图标图示</NvSelectItem>
          </NvSelectContent>
        </NvSelect>
      </label>
    </div>
    <ul v-if="hasContent" aria-label="当前安排">
      <li>午后阅读：选一本喜欢的书，留一点时间慢慢翻阅。</li>
    </ul>
    <Empty v-else class="border border-border">
      <EmptyHeader>
        <EmptyMedia :variant="variant">
          <BookOpen v-if="variant === 'icon'" aria-hidden="true" />
          <span v-else class="text-sm text-muted-foreground">阅读时光</span>
        </EmptyMedia>
        <EmptyTitle>暂时没有阅读安排</EmptyTitle>
        <EmptyDescription>可以先休息片刻，也可以恢复本页安排，继续享受阅读时光。</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <NvButton type="button" @click="restore">恢复本页安排</NvButton>
      </EmptyContent>
    </Empty>
    <p role="status" aria-live="polite" class="text-sm text-muted-foreground">{{ feedback }}</p>
  </section>
</template>
