<script setup lang="ts">
import { NvAppShellMobile, NvNavBar } from '@nerv-ui/ui-mobile'
import { useColorMode } from '@nerv-ui/ui'
import FeedbackStates from './mobile-feedback/FeedbackStates.vue'
import FeedbackSignals from './mobile-feedback/FeedbackSignals.vue'
import FeedbackMedia from './mobile-feedback/FeedbackMedia.vue'
const { isDark, toggle } = useColorMode()
</script>
<template>
  <NvAppShellMobile class="relative">
    <template #header
      ><NvNavBar title="片刻回响"
        ><template #right
          ><button
            type="button"
            aria-label="切换明暗"
            :aria-pressed="isDark"
            class="size-11"
            @click="toggle"
          >
            {{ isDark ? '浅色' : '深色' }}
          </button></template
        ></NvNavBar
      ></template
    >
    <div class="mx-auto max-w-2xl space-y-8 px-5 pt-5 pb-12">
      <header class="space-y-2">
        <p class="text-sm text-muted-foreground">日常的小事，也有温柔的回应</p>
        <h1 class="text-2xl font-semibold">片刻回响</h1>
        <nav aria-label="演示入口" class="flex flex-wrap gap-4 text-sm underline">
          <a href="#files" class="inline-flex min-h-11 items-center px-3 underline">留住片刻</a>
          <a href="#mobile" class="inline-flex min-h-touch items-center">随行手记</a
          ><a href="#mobile-input" class="inline-flex min-h-touch items-center">随心记录</a
          ><a href="#mobile-overlays" class="inline-flex min-h-touch items-center">片刻安排</a
          ><a href="#mobile-lists" class="inline-flex min-h-touch items-center">翻阅时光</a
          ><a href="#desktop" class="inline-flex min-h-touch items-center">桌面演示</a
          ><a href="#touch" class="inline-flex min-h-touch items-center">触屏演示</a>
        </nav>
      </header>
      <FeedbackStates /><FeedbackSignals /><FeedbackMedia />
    </div>
  </NvAppShellMobile>
</template>
