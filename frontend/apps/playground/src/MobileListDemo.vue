<script setup lang="ts">
import { NvAppShellMobile, NvNavBar } from '@nerv-iip/ui-mobile'
import { useColorMode } from '@nerv-iip/ui'
import LetterCarousel from './mobile-lists/LetterCarousel.vue'
import WindowLetters from './mobile-lists/WindowLetters.vue'
import PagedLetters from './mobile-lists/PagedLetters.vue'
import RefreshList from './mobile-lists/RefreshList.vue'
import SwipeActions from './mobile-lists/SwipeActions.vue'
const { isDark, toggle } = useColorMode()
</script>

<template>
  <NvAppShellMobile class="relative">
    <template #header>
      <NvNavBar title="翻阅时光">
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
    <div class="mx-auto max-w-2xl space-y-8 px-5 pt-5 pb-12">
      <header class="space-y-2">
        <p class="text-sm text-muted-foreground">来信、书签与沿途的风景</p>
        <h1 class="text-2xl font-semibold">翻阅时光</h1>
        <nav aria-label="演示入口" class="flex flex-wrap gap-4 text-sm underline">
          <a href="#mobile-feedback" class="inline-flex min-h-touch items-center">片刻回响</a>
          <a href="#mobile" class="inline-flex min-h-touch items-center">随行手记</a>
          <a href="#mobile-input" class="inline-flex min-h-touch items-center">随心记录</a>
          <a href="#mobile-overlays" class="inline-flex min-h-touch items-center">片刻安排</a>
          <a href="#desktop" class="inline-flex min-h-touch items-center">桌面演示</a>
          <a href="#touch" class="inline-flex min-h-touch items-center">触屏演示</a>
        </nav>
      </header>
      <SwipeActions />
      <RefreshList />
      <PagedLetters />
      <WindowLetters />
      <LetterCarousel />
    </div>
  </NvAppShellMobile>
</template>
