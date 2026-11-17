<script setup lang="ts">
import { ref } from 'vue'
import { BookOpenIcon } from '@lucide/vue'
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@nerv-iip/ui'
const fixed = ref(false)
const open = ref(true)
const current = ref('随手收藏')
</script>

<template>
  <section aria-label="原版阅读侧栏" class="w-full min-w-0 space-y-3">
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="rounded-md border px-3 py-2"
        :aria-pressed="fixed"
        @click="fixed = true"
      >
        固定侧栏
      </button>
      <button
        type="button"
        class="rounded-md border px-3 py-2"
        :aria-pressed="!fixed"
        @click="fixed = false"
      >
        可折叠侧栏
      </button>
    </div>
    <p role="status">当前菜单：{{ current }}</p>
    <div class="base-sidebar-frame">
      <SidebarProvider
        v-model:open="open"
        class="h-full min-h-0"
        style="--sidebar-width: min(12rem, 45vw)"
      >
        <Sidebar :collapsible="fixed ? 'none' : 'icon'">
          <SidebarHeader>
            <span class="group-data-[collapsible=icon]:hidden">片刻阅读</span>
            <div v-if="!fixed" class="md:hidden">
              <SidebarTrigger aria-label="关闭阅读导航" />
              <span>关闭导航</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu aria-label="阅读菜单">
              <SidebarMenuItem v-for="item in ['随手收藏', '阅读记录']" :key="item">
                <SidebarMenuButton
                  :is-active="current === item"
                  :aria-label="item"
                  @click="current = item"
                >
                  <BookOpenIcon /><span>{{ item }}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main class="min-w-0 flex-1 space-y-3 p-3">
          <SidebarTrigger v-if="!fixed" aria-label="切换阅读导航" />
          <h3 class="text-sm font-medium">{{ current }}</h3>
          <p class="text-sm">
            {{ current === '随手收藏' ? '把想再读的片段留在这里。' : '回顾最近读过的篇章。' }}
          </p>
        </main>
      </SidebarProvider>
    </div>
  </section>
</template>

<style scoped>
/* Same containing-block approach as the existing sidebar page, bounded to this host. */
.base-sidebar-frame {
  transform: translateZ(0);
  height: 340px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.base-sidebar-frame :deep([data-slot='sidebar-container']) {
  height: 100%;
}
</style>
