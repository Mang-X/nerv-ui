<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import {
  NvAppShellInset,
  NvButton,
  NvSidebarBrand,
  NvDropdownMenu,
  NvDropdownMenuTrigger,
  NvDropdownMenuContent,
  NvDropdownMenuItem,
} from '@nerv-iip/ui'
import NeutralShellPages from './NeutralShellPages.vue'
import NeutralShellDomains from './NeutralShellDomains.vue'
import type { ShellEntry } from './neutral-shell-types'
const props = withDefaults(
  defineProps<{
    title: string
    logo?: string
    layout: 'side' | 'top'
    items: ShellEntry[]
    topDomains?: ShellEntry[]
    currentDomainKey?: string
    currentKey?: string
    user?: { key: string; name: string }
    recent?: ShellEntry[]
    starred?: ShellEntry[]
    searchLabel?: string
    moreLabel?: string
    signOutLabel?: string
    navLabel?: string
    domainsLabel?: string
    starredLabel?: string
    recentLabel?: string
    userMenuLabel?: string
  }>(),
  {
    logo: 'N',
    searchLabel: '查找空间',
    moreLabel: '更多空间',
    signOutLabel: '退出当前用户',
    navLabel: '空间菜单',
    domainsLabel: '常用空间',
    starredLabel: '星标',
    recentLabel: '最近访问',
  },
)
const emit = defineEmits<{
  navigate: [key: string]
  selectDomain: [key: string]
  openSearch: []
  signOut: [key: string]
}>()
const root = ref<HTMLElement>()
// A document event is claimed once. Focus owns the gesture; without focus the
// first live shell owns it. Each instance removes only its own listener.
function onKeydown(e: KeyboardEvent) {
  if (e.defaultPrevented || e.repeat || !(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'k')
    return
  const focused = document.activeElement
  const shell = focused instanceof Element ? focused.closest('[data-neutral-shell]') : null
  if (shell && shell !== root.value) return
  e.preventDefault()
  emit('openSearch')
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
<template>
  <div ref="root" data-neutral-shell>
    <NvAppShellInset>
      <template #sidebar-header
        ><NvSidebarBrand :name="title" :logo="logo" :caret="false"
      /></template>
      <template #sidebar>
        <nav :aria-label="navLabel" class="grid gap-1 p-2">
          <NeutralShellPages
            :items="items"
            :current-key="currentKey"
            @navigate="emit('navigate', $event)"
          />
        </nav>
        <nav
          v-for="group in [
            { label: starredLabel, items: starred },
            { label: recentLabel, items: recent },
          ]"
          :key="group.label"
          :aria-label="group.label"
          class="grid gap-1 p-2"
        >
          <p
            v-if="group.items?.length"
            class="text-xs text-muted-foreground group-data-[collapsible=icon]:sr-only"
          >
            {{ group.label }}
          </p>
          <NvButton
            v-for="item in group.items"
            :key="item.key"
            variant="ghost"
            :aria-label="item.label"
            :title="item.label"
            :disabled="item.disabled"
            class="h-auto justify-start whitespace-normal break-words text-left"
            @click="emit('navigate', item.key)"
            ><svg
              class="size-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="8" /></svg
            ><span class="group-data-[collapsible=icon]:sr-only">{{ item.label }}</span></NvButton
          >
        </nav>
      </template>
      <template #sidebar-footer><slot name="sidebar-footer" :user="user" /></template>
      <template #header>
        <NeutralShellDomains
          v-if="layout === 'top'"
          :items="topDomains ?? items"
          :current-key="topDomains ? currentDomainKey : currentKey"
          :more-label="moreLabel"
          :label="domainsLabel"
          @select="topDomains ? emit('selectDomain', $event) : emit('navigate', $event)"
        />
        <NvButton variant="outline" :aria-label="searchLabel" @click="emit('openSearch')">{{
          searchLabel
        }}</NvButton>
        <slot name="header" :user="user" />
        <NvDropdownMenu v-if="user"
          ><NvDropdownMenuTrigger as-child
            ><NvButton
              variant="ghost"
              class="h-auto whitespace-normal break-words"
              :aria-label="userMenuLabel ?? `${user.name}的用户菜单`"
              >{{ user.name }}</NvButton
            ></NvDropdownMenuTrigger
          ><NvDropdownMenuContent
            ><slot name="user-menu-items" :user="user" /><NvDropdownMenuItem
              @select="emit('signOut', user!.key)"
              >{{ signOutLabel }}</NvDropdownMenuItem
            ></NvDropdownMenuContent
          ></NvDropdownMenu
        >
      </template>
      <slot :user="user" />
    </NvAppShellInset>
  </div>
</template>
