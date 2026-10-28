<script setup lang="ts">
import { ref } from 'vue'
import { NvTree, NvButton, type NvTreeNode } from '@nerv-iip/ui'
const props = defineProps<{ space: 'library' | 'studio' }>()
const nodes = ref<NvTreeNode[]>([
  {
    key: 'root',
    label: props.space === 'library' ? '晨光书房' : '周末画室',
    children: [
      {
        key: 'quiet',
        label: props.space === 'library' ? '诗歌角' : '水彩间',
        inactive: true,
        status: { label: '暂歇', tone: 'neutral' },
      },
    ],
  },
])
const expanded = ref<string[]>([])
const selectedKey = ref<string | null>(null)
function create() {
  nodes.value[0].children!.push({ key: `new-${nodes.value[0].children!.length}`, label: '新分区' })
  expanded.value = ['root']
}
</script>
<template>
  <main class="mx-auto max-w-3xl space-y-6 p-6">
    <nav class="flex gap-4">
      <a href="#">返回首页</a><a href="#tree/library">晨光书房</a
      ><a href="#tree/studio">周末画室</a>
    </nav>
    <h1 class="text-xl font-semibold">{{ space === 'library' ? '书香地图' : '创作空间' }}</h1>
    <NvTree
      v-model:expanded="expanded"
      v-model:selected-key="selectedKey"
      :nodes="nodes"
      label="空间分区"
    >
      <template #actions="{ node }"
        ><NvButton v-if="node.key === 'root'" data-create size="sm" variant="ghost" @click="create"
          >添加分区</NvButton
        ></template
      >
    </NvTree>
    <NvButton variant="outline" @click="nodes = []">清空空间</NvButton>
  </main>
</template>
