<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import {
  NvApp,
  NvButton,
  NvSelect,
  NvSelectContent,
  NvSelectItem,
  NvSelectTrigger,
  NvSelectValue,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  toast,
} from '@nerv-ui/ui'

const delay = ref(200)
const confirmed = ref(false)
let notification: string | number | undefined
function notify() {
  confirmed.value = true
  notification = toast('阅读安排已确认', {
    ...(notification === undefined ? {} : { id: notification }),
    description: '仅在本页演示，刷新后不保留。',
    closeButton: true,
  })
}
function closeNotification() {
  if (notification !== undefined) toast.dismiss(notification)
}
onBeforeUnmount(closeNotification)
</script>

<template>
  <NvApp :tooltip-delay="delay" class="min-h-0 w-full min-w-0 rounded-xl p-4">
    <div class="flex min-w-0 flex-col items-start gap-4 break-words">
      <p class="text-sm text-muted-foreground">
        将指针停在“阅读提示”上，或用 Tab 聚焦它。确认操作只在本页生效。
      </p>
      <label class="flex max-w-full flex-wrap items-center gap-2 text-sm">
        提示延迟
        <NvSelect v-model="delay">
          <NvSelectTrigger class="w-44"><NvSelectValue placeholder="选择延迟" /></NvSelectTrigger>
          <NvSelectContent>
            <NvSelectItem :value="200">默认 200 毫秒</NvSelectItem>
            <NvSelectItem :value="800">显式 800 毫秒</NvSelectItem>
          </NvSelectContent>
        </NvSelect>
      </label>
      <Tooltip>
        <TooltipTrigger as-child>
          <NvButton type="button" variant="outline">阅读提示</NvButton>
        </TooltipTrigger>
        <TooltipContent>带一本喜欢的书，也可以只来听听。</TooltipContent>
      </Tooltip>
      <div class="flex flex-wrap gap-2">
        <NvButton type="button" data-action="notify" @click="notify">确认阅读安排</NvButton>
        <NvButton type="button" variant="outline" data-action="close" @click="closeNotification">
          关闭本页通知
        </NvButton>
      </div>
      <p role="status" class="text-sm text-muted-foreground">
        {{ confirmed ? '已在本页确认阅读安排；刷新后不保留。' : '尚未确认阅读安排。' }}
      </p>
    </div>
  </NvApp>
</template>
