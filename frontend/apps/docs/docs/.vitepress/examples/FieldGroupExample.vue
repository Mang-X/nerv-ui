<script setup lang="ts">
import { ref, useId } from 'vue'
import {
  NvFieldSet,
  NvFieldLegend,
  NvField,
  NvFieldLabel,
  NvFieldDescription,
  NvInput,
  NvButton,
} from '@nerv-ui/ui'
const id = useId()
const preparation = ref('带一本愿意分享的书')
const feedback = ref('尚未确认')
function confirm() {
  feedback.value = `本页已确认：${preparation.value}；刷新后不保留。`
}
</script>

<template>
  <form class="w-full min-w-0 space-y-4" @submit.prevent="confirm">
    <NvFieldSet class="min-w-0">
      <NvFieldLegend>周末共读活动的准备安排</NvFieldLegend>
      <NvField>
        <NvFieldLabel :for="`${id}-preparation`">准备内容</NvFieldLabel>
        <NvInput
          :id="`${id}-preparation`"
          v-model="preparation"
          :aria-describedby="`${id}-description`"
        />
        <NvFieldDescription :id="`${id}-description`"
          >写下你愿意为周末共读准备的内容，例如带一本书、整理共享书架或分享阅读感受。这里只演示本页确认，不会发送或保存安排。</NvFieldDescription
        >
      </NvField>
    </NvFieldSet>
    <NvButton type="submit">确认本页安排</NvButton>
    <p role="status" class="break-words text-sm text-muted-foreground">{{ feedback }}</p>
  </form>
</template>
