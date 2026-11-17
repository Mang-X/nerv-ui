<script setup lang="ts">
import { useColorMode } from '@nerv-iip/ui'
import { NvAppShellMobile, NvNavBar } from '@nerv-iip/ui-mobile'
import { shallowRef } from 'vue'
import MobileInputFields from './mobile-input/MobileInputFields.vue'
import MobileCaptureInput from './mobile-input/MobileCaptureInput.vue'

const { isDark, toggle } = useColorMode()
const editing = shallowRef(false)
function trackEditor(target: EventTarget | null, host: EventTarget | null) {
  editing.value =
    target instanceof HTMLElement &&
    host instanceof HTMLElement &&
    host.contains(target) &&
    !target.closest('[data-scan-region]') &&
    target.matches(
      'input, textarea, select, button, a[href], [tabindex], [contenteditable], [role="radio"], [role="checkbox"], [role="switch"], [role="slider"]',
    )
}
</script>

<template>
  <NvAppShellMobile
    @focusin="trackEditor($event.target, $event.currentTarget)"
    @focusout="trackEditor($event.relatedTarget, $event.currentTarget)"
  >
    <template #header>
      <NvNavBar title="随心记录">
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
        <p class="text-sm text-muted-foreground">留住生活里的小小灵感</p>
        <h1 class="text-2xl font-semibold">随心记录</h1>
        <nav aria-label="演示入口" class="flex flex-wrap gap-4 text-sm underline">
          <a href="#files" class="inline-flex min-h-11 items-center px-3 underline">留住片刻</a>
          <a href="#mobile-feedback" class="inline-flex min-h-touch items-center">片刻回响</a>
          <a href="#mobile-lists" class="inline-flex min-h-touch items-center">翻阅时光</a>
          <a href="#mobile" class="inline-flex min-h-touch items-center">随行手记</a>
          <a href="#desktop" class="inline-flex min-h-touch items-center">桌面演示</a>
          <a href="#touch" class="inline-flex min-h-touch items-center">触屏演示</a>
        </nav>
      </header>
      <MobileCaptureInput :editing="editing" />
      <div data-form-region class="space-y-6"><MobileInputFields /></div>
    </div>
  </NvAppShellMobile>
</template>
