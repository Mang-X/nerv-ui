<script setup lang="ts">
import { ref } from 'vue'
import {
  NvButton,
  NvCard,
  NvCardHeader,
  NvCardTitle,
  NvCardDescription,
  NvCardContent,
  NvCardFooter,
} from '@nerv-iip/ui'

const confirmed = ref(false)
</script>

<template>
  <NvCard class="w-full min-w-0 max-w-lg break-words">
    <NvCardHeader>
      <NvCardTitle>周末共读与手作交流安排</NvCardTitle>
      <NvCardDescription>
        邀请邻里一起阅读、交流与整理共享空间。无论是初次参加，还是带着新的想法再次到来，都可以按自己的节奏参与。
      </NvCardDescription>
    </NvCardHeader>
    <NvCardContent class="space-y-2 text-sm">
      <p>请带上一本愿意分享的书，也可以空手前来，听听大家最近读到的故事。</p>
      <p>交流结束后，我们会一起整理书架，将想继续讨论的话题留给下一次相聚。</p>
    </NvCardContent>
    <NvCardFooter class="flex-wrap gap-3">
      <NvButton type="button" variant="outline" @click="confirmed = true">确认阅读安排</NvButton>
      <p role="status" class="min-w-0 text-sm text-muted-foreground">
        {{ confirmed ? '已在本页确认阅读安排；刷新后不保留。' : '尚未确认' }}
      </p>
    </NvCardFooter>
  </NvCard>
</template>
