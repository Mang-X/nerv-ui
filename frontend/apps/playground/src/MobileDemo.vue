<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useColorMode } from '@nerv-iip/ui'
import {
  NvAppShellMobile,
  NvNavBar,
  NvTabBar,
  NvCell,
  NvCellGroup,
  NvListRow,
  NvMobileTabs,
  NvMobileSteps,
  NvMobileGrid,
  NvMobileDivider,
  NvFab,
  type FabAction,
  type GridItem,
} from '@nerv-iip/ui-mobile'

const page = shallowRef('discover')
const pages = [
  { value: 'discover', label: '发现' },
  { value: 'saved', label: '收藏' },
]
const category = shallowRef('lakes')
const categories = [
  { value: 'lakes', label: '湖畔' },
  { value: 'paths', label: '小径' },
]
const places = {
  lakes: ['湖畔书屋', '水岸长椅', '芦苇小桥', '向晚茶室', '白鹭观景台', '湖心花园'],
  paths: ['林间小径', '树影咖啡', '山脚花铺', '听风亭', '石阶小院', '日光草坪'],
}
const visiblePlaces = computed(() => (category.value === 'lakes' ? places.lakes : places.paths))
const message = shallowRef('选一个去处，留一点空闲。')
const selected = shallowRef('')
function selectPlace(title: string) {
  selected.value = title
  message.value = `已选择：${title}`
}
const step = shallowRef(0)
const steps = [{ label: '准备' }, { label: '出发' }, { label: '抵达' }]
const progress = computed(() => `${steps[step.value]!.label} · ${step.value + 1}/3`)
const shortcuts: GridItem[] = [
  { key: 'lakes', text: '湖畔' },
  { key: 'paths', text: '步行', badge: 2 },
  { key: 'saved', text: '心愿', badge: true },
  { key: 'rest', text: '休息' },
]
function selectShortcut(item: GridItem, index: number) {
  message.value = `快捷入口：${item.text} · ${item.key} · ${index + 1}`
}
const notes = shallowRef(0)
const actions: FabAction[] = [
  { key: 'save', text: '收好行程' },
  { key: 'share', text: '留张便签' },
]
function selectAction(action: FabAction, index: number) {
  message.value = `随行操作：${action.text} · ${action.key} · ${index + 1}`
}
function addNote() {
  notes.value++
  message.value = `已记下第 ${notes.value} 笔心情`
}
const { isDark, toggle } = useColorMode()
const controlClass =
  'min-h-touch rounded-lg border border-border px-3 text-sm focus-visible:outline-2 disabled:opacity-50'
</script>

<template>
  <NvAppShellMobile class="relative">
    <template #header>
      <NvNavBar title="随行手记" back @back="page = 'discover'">
        <template #right>
          <button
            type="button"
            aria-label="切换明暗"
            :aria-pressed="isDark"
            class="flex size-11 items-center justify-center rounded-lg text-sm focus-visible:outline-2"
            @click="toggle"
          >
            {{ isDark ? '浅色' : '深色' }}
          </button>
        </template>
      </NvNavBar>
    </template>
    <div class="mx-auto max-w-2xl space-y-5 px-4 pt-5 pb-28">
      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">把时间留给喜欢的风景</p>
        <h1 class="text-2xl font-semibold tracking-tight">周末随行</h1>
        <nav class="flex flex-wrap gap-4 text-sm underline" aria-label="演示入口">
          <a href="#files" class="inline-flex min-h-11 items-center px-3 underline">留住片刻</a>
          <a href="#mobile-feedback" class="inline-flex min-h-touch items-center">片刻回响</a>
          <a href="#mobile-lists" class="inline-flex min-h-touch items-center">翻阅时光</a>
          <a href="#mobile-overlays" class="inline-flex min-h-touch items-center">片刻安排</a>
          <a href="#mobile-input" class="inline-flex min-h-touch items-center">随心记录</a>
          <a href="#desktop" class="inline-flex min-h-touch items-center">桌面演示</a>
          <a href="#touch" class="inline-flex min-h-touch items-center">触屏演示</a>
        </nav>
      </div>
      <p role="status" class="rounded-xl bg-muted p-3 text-sm">{{ message }}</p>
      <h2 aria-label="当前页面" class="text-lg font-semibold">
        {{ page === 'discover' ? '附近好去处' : '我的收藏' }}
      </h2>
      <div v-show="page === 'discover'" class="space-y-5">
        <NvMobileGrid :items="shortcuts" bordered @select="selectShortcut">
          <template #icon-lakes>湖</template>
          <template #icon-paths>径</template>
          <template #icon-saved>愿</template>
          <template #icon-rest>歇</template>
        </NvMobileGrid>
        <NvCellGroup title="出行信息">
          <NvCell title="湖畔书屋" note="沿湖步行十分钟" arrow @click="selectPlace('湖畔书屋')" />
          <NvCell title="开放时间" value="09:00–18:00" />
        </NvCellGroup>
        <NvMobileDivider>一步一景</NvMobileDivider>
        <section aria-label="行程" class="space-y-4">
          <NvMobileSteps :steps="steps" :current="step" />
          <p aria-label="行程进度" class="text-center text-sm">{{ progress }}</p>
          <div class="flex justify-center gap-3">
            <button
              type="button"
              aria-label="下一步"
              :class="controlClass"
              :disabled="step === 2"
              @click="step++"
            >
              下一步
            </button>
            <button type="button" aria-label="重新准备" :class="controlClass" @click="step = 0">
              重新准备
            </button>
          </div>
        </section>
        <NvMobileDivider />
        <section aria-label="去处">
          <NvMobileTabs v-model="category" :items="categories" aria-label="去处分类" />
          <div role="tabpanel" :aria-label="category === 'lakes' ? '湖畔' : '小径'">
            <NvListRow
              v-for="(place, index) in visiblePlaces"
              :key="place"
              :title="place"
              :subtitle="`步行 ${10 + index * 5} 分钟 · 可随时停留`"
              @select="selectPlace(place)"
            />
          </div>
        </section>
      </div>
      <section v-if="page === 'saved'" aria-label="收藏去处">
        <NvListRow v-if="selected" :title="selected" subtitle="留在心愿清单" :interactive="false" />
        <p v-else class="text-sm text-muted-foreground">选中一个去处后，在这里回看。</p>
      </section>
    </div>
    <NvFab text="记一笔" class="mobile-demo-actions" @click="addNote" />
    <NvFab
      text="更多随行操作"
      position="bottom-left"
      tone="default"
      :actions="actions"
      class="mobile-demo-actions"
      @select="selectAction"
    />
    <template #footer><NvTabBar v-model="page" :items="pages" /></template>
  </NvAppShellMobile>
</template>

<style scoped>
@layer app {
  /* Public class on the positioned FAB root reserves the shell's navigation regions. */
  .mobile-demo-actions {
    top: calc(3rem + max(0.75rem, env(safe-area-inset-top)));
    bottom: calc(3rem + max(0.5rem, env(safe-area-inset-bottom)));
    left: env(safe-area-inset-left);
    right: env(safe-area-inset-right);
  }
}
</style>
