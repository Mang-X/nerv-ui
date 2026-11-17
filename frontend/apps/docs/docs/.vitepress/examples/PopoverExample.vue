<script setup lang="ts">
import { ref } from 'vue'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  NvButton,
} from '@nerv-iip/ui'

const open = ref(false)
const feedback = ref('可以打开阅读提示。')
function finish() {
  feedback.value = '已读完本页提示。'
  open.value = false
}
</script>

<template>
  <section class="w-full min-w-0 space-y-4 break-words" aria-label="阅读提示">
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <NvButton type="button" variant="outline">查看阅读提示</NvButton>
      </PopoverTrigger>
      <PopoverContent
        class="vp-raw max-w-[calc(100vw-2rem)] break-words"
        align="start"
        :collision-padding="16"
      >
        <PopoverHeader>
          <PopoverTitle>留一点阅读时间</PopoverTitle>
          <PopoverDescription>选一本喜欢的书，留一点时间慢慢翻阅。</PopoverDescription>
        </PopoverHeader>
        <p>不必一次读完，按自己的节奏继续就好。</p>
        <NvButton type="button" @click="finish">读完提示</NvButton>
      </PopoverContent>
    </Popover>
    <p role="status" aria-live="polite" class="text-sm text-muted-foreground">{{ feedback }}</p>
  </section>
</template>
