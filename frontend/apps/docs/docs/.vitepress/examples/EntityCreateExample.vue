<script setup lang="ts">
import { computed, ref } from 'vue'
import { NvButton, NvEntityPicker, NvField, NvFieldLabel, NvInput } from '@nerv-iip/ui'

const group = ref('')
const options = ref([
  { value: 'GRP-01', label: '分组 Alpha' },
  { value: 'GRP-02', label: '分组 Beta' },
])
const editing = ref(false)
const name = ref('')
let nextLocalId = 1
const selected = computed(() => options.value.find((option) => option.value === group.value))
const canSave = computed(() => name.value.trim().length > 0)

function beginCreate() {
  name.value = ''
  editing.value = true
}
function confirmCreate() {
  if (!canSave.value) return
  const value = `LOCAL-${String(nextLocalId++).padStart(3, '0')}`
  options.value.push({ value, label: name.value.trim() })
  group.value = value
  editing.value = false
}
</script>

<template>
  <section class="w-full min-w-0 max-w-sm space-y-3" aria-label="就地新增分组示例">
    <NvField>
      <NvFieldLabel for="ep-create-group">本地分组</NvFieldLabel>
      <NvEntityPicker
        id="ep-create-group"
        v-model="group"
        :options="options"
        title="选择本地分组"
        aria-label="本地分组"
        create-text="新增本地分组"
        clearable
        @create="beginCreate"
      />
    </NvField>
    <form
      v-if="editing"
      aria-label="新增本地分组"
      class="space-y-3 rounded-md border border-border p-4"
      @submit.prevent="confirmCreate"
    >
      <p class="text-sm font-medium">新增本地分组</p>
      <NvField>
        <NvFieldLabel for="ep-create-name">分组名称</NvFieldLabel>
        <NvInput id="ep-create-name" v-model="name" autocomplete="off" required />
      </NvField>
      <div class="flex flex-wrap gap-2">
        <NvButton type="submit" variant="brand" :disabled="!canSave">确认新增</NvButton>
        <NvButton type="button" variant="outline" @click="editing = false">取消新增</NvButton>
      </div>
    </form>
    <p role="status" class="text-sm break-words text-muted-foreground">
      当前选择：{{ selected ? `${selected.label}（${selected.value}）` : '（未选）' }}
    </p>
    <p class="text-sm text-muted-foreground">确认时生成本地示例编码；刷新页面后不保留。</p>
  </section>
</template>
