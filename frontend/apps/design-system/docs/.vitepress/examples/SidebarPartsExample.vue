<script setup lang="ts">
import { ref } from 'vue'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from '@nerv-iip/ui'
const waiting = ref(true)
const showIcon = ref(true)
const current = ref('随手收藏')
</script>

<template>
  <section aria-label="本页菜单示例" class="w-full min-w-0 space-y-3">
    <div class="flex flex-wrap gap-2">
      <button type="button" class="rounded-md border px-3 py-2" @click="waiting = !waiting">
        {{ waiting ? '显示本页菜单' : '显示等待状态' }}
      </button>
      <button
        type="button"
        class="rounded-md border px-3 py-2"
        :aria-pressed="showIcon"
        @click="showIcon = !showIcon"
      >
        显示图标
      </button>
    </div>
    <p role="status">{{ waiting ? '正在等待菜单内容' : `当前菜单：${current}` }}</p>
    <SidebarGroup>
      <h3 class="text-sm font-medium">片刻阅读</h3>
      <SidebarGroupContent :aria-busy="waiting">
        <SidebarMenu v-if="waiting" aria-label="等待中的菜单占位">
          <SidebarMenuItem v-for="item in 2" :key="item">
            <SidebarMenuSkeleton :show-icon="showIcon" aria-hidden="true" />
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu v-else aria-label="本页阅读菜单">
          <SidebarMenuItem v-for="item in ['随手收藏', '阅读记录']" :key="item">
            <button
              type="button"
              class="w-full rounded-md px-3 py-2 text-left hover:bg-accent"
              :aria-pressed="current === item"
              @click="current = item"
            >
              {{ item }}
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </section>
</template>
