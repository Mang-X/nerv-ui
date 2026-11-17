<script setup lang="ts">
import { ref } from 'vue'
import {
  NvButton,
  NvDropdownMenu,
  NvDropdownMenuTrigger,
  NvDropdownMenuContent,
  NvDropdownMenuLabel,
  NvDropdownMenuSeparator,
  NvDropdownMenuItem,
  NvDropdownMenuCheckboxItem,
  NvDropdownMenuGroup,
  NvDropdownMenuRadioGroup,
  NvDropdownMenuRadioItem,
  NvDropdownMenuShortcut,
  NvDropdownMenuSub,
  NvDropdownMenuPortal,
  NvDropdownMenuSubContent,
  NvDropdownMenuSubTrigger,
  DropdownMenuGroup,
} from '@nerv-iip/ui'
const open = ref(false)
const summary = ref(true)
const order = ref('按时间')
const destination = ref('尚未选择位置')
</script>

<template>
  <div class="space-y-4">
    <NvDropdownMenu v-model:open="open">
      <NvDropdownMenuTrigger as-child>
        <NvButton variant="outline">阅读偏好</NvButton>
      </NvDropdownMenuTrigger>
      <NvDropdownMenuContent
        align="start"
        :collision-padding="8"
        class="w-56 max-w-[calc(100vw-1rem)]"
      >
        <NvDropdownMenuGroup aria-label="显示偏好">
          <NvDropdownMenuLabel>显示偏好</NvDropdownMenuLabel>
          <NvDropdownMenuCheckboxItem v-model="summary">显示摘要</NvDropdownMenuCheckboxItem>
          <NvDropdownMenuRadioGroup v-model="order" aria-label="排序方式">
            <NvDropdownMenuRadioItem value="按时间">按时间</NvDropdownMenuRadioItem>
            <NvDropdownMenuRadioItem value="按标题">按标题</NvDropdownMenuRadioItem>
          </NvDropdownMenuRadioGroup>
        </NvDropdownMenuGroup>
        <NvDropdownMenuSeparator />
        <DropdownMenuGroup aria-label="本页操作">
          <NvDropdownMenuLabel>本页操作</NvDropdownMenuLabel>
          <NvDropdownMenuSub>
            <NvDropdownMenuSubTrigger>选择位置</NvDropdownMenuSubTrigger>
            <NvDropdownMenuPortal>
              <NvDropdownMenuSubContent
                :collision-padding="8"
                class="w-40 max-w-[calc(100vw-1rem)] max-h-(--reka-dropdown-menu-content-available-height) overflow-y-auto"
              >
                <NvDropdownMenuItem @select="destination = '阅读清单'">阅读清单</NvDropdownMenuItem>
                <NvDropdownMenuItem @select="destination = '稍后阅读'">稍后阅读</NvDropdownMenuItem>
              </NvDropdownMenuSubContent>
            </NvDropdownMenuPortal>
          </NvDropdownMenuSub>
          <NvDropdownMenuItem disabled @select="destination = '云端'">
            同步到云端<NvDropdownMenuShortcut>⌘S</NvDropdownMenuShortcut>
          </NvDropdownMenuItem>
        </DropdownMenuGroup>
      </NvDropdownMenuContent>
    </NvDropdownMenu>
    <p role="status" class="text-sm text-muted-foreground break-words">
      菜单：{{ open ? '展开' : '收起' }}；摘要：{{ summary ? '显示' : '隐藏' }}；排序：{{
        order
      }}；位置：{{ destination }}；仅本页有效，刷新后不保留。
    </p>
  </div>
</template>
