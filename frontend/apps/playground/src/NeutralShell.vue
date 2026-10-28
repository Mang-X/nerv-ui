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
export interface ShellEntry {
  key: string
  label: string
  disabled?: boolean
}
const props = defineProps<{
  title: string
  layout: 'side' | 'top'
  items: ShellEntry[]
  currentKey?: string
  user?: { key: string; name: string }
  recent?: ShellEntry[]
  starred?: ShellEntry[]
}>()
const emit = defineEmits<{ navigate: [key: string]; openSearch: []; signOut: [key: string] }>()
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
      <template #sidebar-header><NvSidebarBrand :name="title" logo="N" :caret="false" /></template>
      <template #sidebar>
        <nav aria-label="空间菜单" class="grid gap-1 p-2">
          <NvButton
            v-for="item in items"
            :key="item.key"
            :data-nav="item.key"
            :aria-label="item.label"
            :title="item.label"
            :disabled="item.disabled"
            :aria-current="item.key === currentKey ? 'page' : undefined"
            :variant="item.key === currentKey ? 'secondary' : 'ghost'"
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
        <nav
          v-for="group in [
            { label: '星标', items: starred },
            { label: '最近访问', items: recent },
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
        <nav v-if="layout === 'top'" aria-label="常用空间" class="flex min-w-0 flex-1 gap-2">
          <NvButton
            v-if="items[0]"
            variant="ghost"
            :disabled="items[0].disabled"
            :aria-current="items[0].key === currentKey ? 'page' : undefined"
            @click="emit('navigate', items[0].key)"
            >{{ items[0].label }}</NvButton
          >
          <NvDropdownMenu v-if="items.length > 1"
            ><NvDropdownMenuTrigger as-child
              ><NvButton variant="ghost">更多空间</NvButton></NvDropdownMenuTrigger
            ><NvDropdownMenuContent
              ><NvDropdownMenuItem
                v-for="item in items.slice(1)"
                :key="item.key"
                :disabled="item.disabled"
                :aria-current="item.key === currentKey ? 'page' : undefined"
                @select="emit('navigate', item.key)"
                >{{ item.label }}</NvDropdownMenuItem
              ></NvDropdownMenuContent
            ></NvDropdownMenu
          >
        </nav>
        <NvButton variant="outline" aria-label="查找空间" @click="emit('openSearch')"
          >查找空间</NvButton
        >
        <slot name="header" :user="user" />
        <NvDropdownMenu v-if="user"
          ><NvDropdownMenuTrigger as-child
            ><NvButton
              variant="ghost"
              class="h-auto whitespace-normal break-words"
              :aria-label="`${user.name}的用户菜单`"
              >{{ user.name }}</NvButton
            ></NvDropdownMenuTrigger
          ><NvDropdownMenuContent
            ><slot name="user-menu-items" :user="user" /><NvDropdownMenuItem
              @select="emit('signOut', user!.key)"
              >退出当前用户</NvDropdownMenuItem
            ></NvDropdownMenuContent
          ></NvDropdownMenu
        >
      </template>
      <slot :user="user" />
    </NvAppShellInset>
  </div>
</template>
