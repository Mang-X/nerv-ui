<script setup lang="ts">
import { ref } from 'vue'
import {
  NvButton,
  NvCard,
  NvCardHeader,
  NvCardAction,
  NvCardTitle,
  NvCardDescription,
  NvCardContent,
  NvCardFooter,
} from '@nerv-iip/ui'

const confirmed = ref(false)
const tipsViewed = ref(false)
</script>

<template>
  <NvCard class="w-full min-w-0 max-w-lg break-words">
    <NvCardHeader class="grid-cols-[minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_auto]">
      <NvCardTitle class="min-w-0">周末共读与手作交流安排</NvCardTitle>
      <NvCardDescription class="min-w-0">
        邀请邻里一起阅读、交流与整理共享空间。无论是初次参加，还是带着新的想法再次到来，都可以按自己的节奏参与。
      </NvCardDescription>
      <NvCardAction
        class="col-start-1 row-start-3 row-span-1 justify-self-start sm:col-start-2 sm:row-start-1 sm:row-span-2 sm:justify-self-end"
      >
        <NvButton type="button" variant="outline" size="sm" @click="tipsViewed = true">
          查看参与提示
        </NvButton>
      </NvCardAction>
    </NvCardHeader>
    <NvCardContent class="space-y-2 text-sm">
      <p>请带上一本愿意分享的书，也可以空手前来，听听大家最近读到的故事。</p>
      <p>交流结束后，我们会一起整理书架，将想继续讨论的话题留给下一次相聚。</p>
      <p role="status" class="text-muted-foreground">
        {{
          tipsViewed
            ? '参与提示：按自己的节奏参与即可；仅在本页显示，刷新后不保留。'
            : '尚未查看参与提示'
        }}
      </p>
    </NvCardContent>
    <NvCardFooter class="flex-wrap gap-3">
      <NvButton type="button" variant="outline" @click="confirmed = true">确认阅读安排</NvButton>
      <p role="status" class="min-w-0 text-sm text-muted-foreground">
        {{ confirmed ? '已在本页确认阅读安排；刷新后不保留。' : '尚未确认' }}
      </p>
    </NvCardFooter>
  </NvCard>
</template>
