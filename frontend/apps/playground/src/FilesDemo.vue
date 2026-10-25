<script setup lang="ts">
import { NvApp, NvButton, useColorMode, useTheme } from '@nerv-iip/ui'
import { ref } from 'vue'
import NativeUploadPanel from './files/NativeUploadPanel.vue'
const uploadMode = ref('memory')
import UploadPanel from './files/UploadPanel.vue'
import PreviewPanel from './files/PreviewPanel.vue'
const { isDark, toggle } = useColorMode()
const { theme, setTheme } = useTheme()
const routes = [
  ['desktop', '桌面演示'],
  ['touch', '触屏演示'],
  ['mobile', '随行手记'],
  ['mobile-input', '随心记录'],
  ['mobile-overlays', '片刻安排'],
  ['mobile-lists', '翻阅时光'],
  ['mobile-feedback', '片刻回响'],
  ['screen/stage', '空间舞台'],
  ['screen/controls', '随心安排'],
  ['screen/indicators', '阅读与到访'],
  ['screen/data', '流动消息'],
  ['screen/charts', '内容与到访'],
  ['screen/tables', '清单与事件'],
  ['screen/summary', '空间使用概况'],
]
</script>
<template>
  <NvApp>
    <main class="mx-auto max-w-7xl space-y-8 p-4 sm:p-8">
      <nav
        aria-label="显示表面"
        class="flex flex-wrap gap-x-4 text-sm text-muted-foreground underline"
      >
        <a
          v-for="[hash, label] in routes"
          :key="hash"
          :href="`#${hash}`"
          class="inline-flex min-h-11 items-center"
          >{{ label }}</a
        >
      </nav>
      <header class="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight">留住片刻</h1>
          <p class="mt-2 max-w-xl text-sm text-muted-foreground">
            整理旅途中的图片与便笺，放大看看值得记住的细节。文件只留在本页。
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <NvButton variant="outline" :aria-pressed="isDark" @click="toggle">{{
            isDark ? '切换亮色' : '切换暗色'
          }}</NvButton
          ><NvButton
            variant="outline"
            :aria-pressed="theme === 'blue'"
            @click="setTheme(theme === 'blue' ? 'neutral' : 'blue')"
            >蓝色强调色</NvButton
          >
        </div>
      </header>
      <label class="block text-sm"
        >传输方式
        <select
          v-model="uploadMode"
          aria-label="传输方式"
          class="min-h-11 rounded-md border bg-background px-3"
        >
          <option value="memory">内存适配器</option>
          <option value="native">本机原生 HTTP</option>
        </select></label
      >
      <div class="grid items-start gap-10 xl:grid-cols-2">
        <UploadPanel v-if="uploadMode === 'memory'" /><NativeUploadPanel v-else /><PreviewPanel />
      </div>
    </main>
  </NvApp>
</template>
