<script setup lang="ts">
import { NvAppShellMobile, NvNavBar } from '@nerv-iip/ui-mobile'
import { useColorMode } from '@nerv-iip/ui'
import OverlayDetails from './mobile-overlays/OverlayDetails.vue'
import OverlayPanels from './mobile-overlays/OverlayPanels.vue'
import OverlaySelections from './mobile-overlays/OverlaySelections.vue'
const { isDark, toggle } = useColorMode()
</script>

<template>
  <NvAppShellMobile class="relative">
    <template #header>
      <NvNavBar title="片刻安排">
        <template #right>
          <button
            type="button"
            aria-label="切换明暗"
            :aria-pressed="isDark"
            class="size-11"
            @click="toggle"
          >
            {{ isDark ? '浅色' : '深色' }}
          </button>
        </template>
      </NvNavBar>
    </template>
    <div class="mx-auto max-w-2xl space-y-6 px-5 pt-5 pb-12">
      <header class="space-y-2">
        <p class="text-sm text-muted-foreground">为闲暇留一点位置</p>
        <h1 class="text-2xl font-semibold">片刻安排</h1>
        <nav aria-label="演示入口" class="flex flex-wrap gap-4 text-sm underline">
          <a href="#files" class="inline-flex min-h-11 items-center px-3 underline">留住片刻</a>
          <a href="#mobile-feedback" class="inline-flex min-h-touch items-center">片刻回响</a>
          <a href="#mobile-lists" class="inline-flex min-h-touch items-center">翻阅时光</a>
          <a href="#mobile" class="inline-flex min-h-touch items-center">随行手记</a>
          <a href="#mobile-input" class="inline-flex min-h-touch items-center">随心记录</a>
          <a href="#desktop" class="inline-flex min-h-touch items-center">桌面演示</a>
          <a href="#touch" class="inline-flex min-h-touch items-center">触屏演示</a>
        </nav>
      </header>
      <OverlaySelections />
      <OverlayPanels />
      <OverlayDetails />
    </div>
  </NvAppShellMobile>
</template>
