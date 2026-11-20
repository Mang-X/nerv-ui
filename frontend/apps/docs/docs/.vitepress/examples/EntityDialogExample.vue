<script setup lang="ts">
import { computed, ref } from 'vue'
import { NvEntityPicker, NvField, NvFieldLabel } from '@nerv-ui/ui'

const material = ref('')
const options = [
  { value: 'SKU-FG-100', label: '前减振器总成', hint: '成品' },
  { value: 'SKU-FG-200', label: '后减振器总成', hint: '成品' },
  { value: 'RM-200', label: '活塞杆毛坯', hint: '原材料' },
  { value: 'RM-300', label: '弹簧钢丝', hint: '原材料' },
]
const selected = computed(() => options.find((option) => option.value === material.value))
</script>

<template>
  <section class="w-full min-w-0 max-w-sm space-y-3" aria-label="对话框物料选择示例">
    <NvField>
      <NvFieldLabel for="ep-dialog-material">对话框物料</NvFieldLabel>
      <NvEntityPicker
        id="ep-dialog-material"
        v-model="material"
        :options="options"
        variant="dialog"
        title="对话框选择物料"
        placeholder="打开物料目录"
        aria-label="对话框物料"
        clearable
      />
    </NvField>
    <p role="status" class="text-sm break-words text-muted-foreground">
      当前选择：{{ selected ? `${selected.label}（${selected.value}）` : '（未选）' }}
    </p>
  </section>
</template>
