<script setup lang="ts">
import { computed } from 'vue'
import { NvButton, NvInput } from '@nerv-iip/ui'
import type { SchedulingRequestItem, SchedulingRequestSourceState } from './types'

const props = defineProps<{
  sourceKey: string
  state: SchedulingRequestSourceState
  items: readonly SchedulingRequestItem[]
  selectedKey: string
  keyword: string
  stateMessage?: string
  readOnly?: boolean
}>()
const emit = defineEmits<{
  'update:keyword': [value: string]
  'update:selectedKey': [key: string]
  retry: []
}>()
const filtered = computed(() => {
  const query = props.keyword.trim().toLocaleLowerCase()
  return query
    ? props.items.filter((item) =>
        [item.key, item.label, item.detail, ...(item.searchTerms ?? [])].some((part) =>
          part?.toLocaleLowerCase().includes(query),
        ),
      )
    : props.items
})
function choose(item: SchedulingRequestItem) {
  if (props.state === 'ready' && !props.readOnly && !item.disabledReason)
    emit('update:selectedKey', item.key)
}
</script>

<template>
  <section class="grid gap-2" aria-label="选择项目">
    <label class="text-sm font-medium" :for="`candidate-${sourceKey}`">选择项目</label>
    <NvInput
      :id="`candidate-${sourceKey}`"
      :model-value="keyword"
      :disabled="readOnly"
      placeholder="搜索名称或编号"
      @update:model-value="emit('update:keyword', String($event))"
    />
    <p class="text-sm text-muted-foreground">
      检索词只帮助查找；请自行核对目标项目，来源不会按相似编号自动关联。
    </p>
    <p
      v-if="state === 'unready'"
      role="status"
      class="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm"
    >
      {{ stateMessage || '范围尚未就绪，尚未读取候选项目。' }}
    </p>
    <p v-else-if="state === 'loading'" role="status" class="p-3 text-sm">正在读取候选项目…</p>
    <div
      v-else-if="state === 'error'"
      role="alert"
      class="rounded-md border border-destructive/30 p-3 text-sm"
    >
      <p>{{ stateMessage || '候选项目读取失败，当前无法判断可选项目。' }}</p>
      <NvButton type="button" variant="outline" size="sm" data-action="retry" @click="emit('retry')"
        >重试</NvButton
      >
    </div>
    <p v-else-if="items.length === 0" role="status" class="p-3 text-sm">暂无可选项目。</p>
    <p v-else-if="filtered.length === 0" role="status" class="p-3 text-sm">
      没有匹配「{{ keyword.trim() }}」的项目。
    </p>
    <div
      v-else
      class="grid max-h-56 gap-2 overflow-y-auto rounded-md border border-border p-2"
      role="radiogroup"
      aria-label="候选项目"
    >
      <button
        v-for="item in filtered"
        :key="item.key"
        type="button"
        role="radio"
        :data-item="item.key"
        :aria-checked="selectedKey === item.key"
        :disabled="readOnly || Boolean(item.disabledReason)"
        :title="readOnly ? '当前为只读' : item.disabledReason"
        class="rounded-md border border-border p-2 text-left text-sm hover:bg-muted aria-checked:border-brand"
        @click="choose(item)"
      >
        <span class="font-medium">{{ item.label }}</span
        ><span class="ml-2 font-mono text-xs text-muted-foreground">{{ item.key }}</span
        ><span v-if="item.detail" class="block text-muted-foreground">{{ item.detail }}</span>
      </button>
    </div>
  </section>
</template>
