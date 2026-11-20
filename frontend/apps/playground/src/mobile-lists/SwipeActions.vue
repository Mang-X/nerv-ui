<script setup lang="ts">
import { shallowRef } from 'vue'
import { NvSwipeCell } from '@nerv-ui/ui-mobile'
const selected = shallowRef('尚未选择动作')
</script>

<template>
  <section aria-labelledby="swipe-title" class="space-y-3">
    <h2 id="swipe-title" class="text-lg font-semibold">一封来信</h2>
    <p class="text-sm text-muted-foreground">向左滑动来信，选择动作；向右滑动收起。</p>
    <NvSwipeCell
      class="rounded-xl border border-border"
      :actions="[
        { label: '收进书签', value: 'bookmark', tone: 'brand' },
        { label: '暂时收起', value: 'archive', tone: 'danger' },
      ]"
      @select="selected = `湖畔来信 · ${$event}`"
    >
      <div class="flex h-20 items-center px-4">湖畔来信</div>
    </NvSwipeCell>
    <output aria-label="滑动动作回显" class="block text-sm">{{ selected }}</output>
  </section>
</template>
