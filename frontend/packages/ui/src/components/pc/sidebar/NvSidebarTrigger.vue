<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { PanelLeftIcon } from '@lucide/vue'
import { cn } from '../../../lib/utils'
import { Button } from '../../ui/button'
import { useSidebar } from '../../ui/sidebar'

/**
 * 侧栏折叠按钮。与原版 `SidebarTrigger` 同形，只把读屏名称换成中文
 * （原版写死英文 `Toggle Sidebar`，原版零改动，故在品牌层复制重建）。
 */
const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const { toggleSidebar } = useSidebar()
</script>

<template>
  <!-- The wrapped ui Button carries `focus-visible:ring-3 ring-ring/50`; utility
       sort order puts those after `ring-1`/`ring-brand`, so `!` is required. -->
  <Button
    data-sidebar="trigger"
    data-slot="nv-sidebar-trigger"
    variant="ghost"
    size="icon-sm"
    :class="cn('focus-visible:ring-1! focus-visible:ring-brand!', props.class)"
    @click="toggleSidebar"
  >
    <PanelLeftIcon class="cn-rtl-flip" />
    <span class="sr-only">展开或收起侧栏</span>
  </Button>
</template>
