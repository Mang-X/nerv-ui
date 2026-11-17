<script setup lang="ts">
import { shallowRef } from 'vue'
import { NvSwiper, NvSwiperItem } from '@nerv-iip/ui-mobile'
const pages = [
  { title: '湖畔', note: '风掠过水面，留下一圈涟漪。' },
  { title: '小径', note: '沿着树影，慢慢走过午后。' },
  { title: '庭院', note: '读完这封信，再停留片刻。' },
]
const index = shallowRef(0)
const loop = shallowRef(false)
const autoplay = shallowRef(false)
const changes = shallowRef(0)
function move(delta: number) {
  index.value = loop.value
    ? (index.value + delta + pages.length) % pages.length
    : Math.max(0, Math.min(pages.length - 1, index.value + delta))
}
</script>

<template>
  <section aria-labelledby="carousel-title" class="space-y-3">
    <h2 id="carousel-title" class="text-lg font-semibold">沿途风景</h2>
    <p class="text-sm text-muted-foreground">左右滑动翻页，或使用下方按钮。</p>
    <div class="flex flex-wrap gap-4 text-sm">
      <label class="flex min-h-touch items-center gap-2"
        ><input v-model="loop" type="checkbox" aria-label="循环翻页" />循环翻页</label
      >
      <label class="flex min-h-touch items-center gap-2"
        ><input v-model="autoplay" type="checkbox" aria-label="自动翻页" />自动翻页</label
      >
    </div>
    <NvSwiper
      v-model:index="index"
      :loop="loop"
      :autoplay="autoplay ? 1600 : 0"
      indicator="outside"
      :frame="false"
      @change="changes++"
    >
      <NvSwiperItem v-for="page in pages" :key="page.title" class="p-1">
        <article
          class="flex h-40 flex-col justify-center gap-3 rounded-xl border border-border bg-card px-6"
        >
          <h3 class="text-xl font-semibold">{{ page.title }}</h3>
          <p class="text-sm text-muted-foreground">{{ page.note }}</p>
        </article>
      </NvSwiperItem>
    </NvSwiper>
    <output aria-label="轮播状态" class="block text-sm" aria-live="polite"
      >第 {{ index + 1 }} / 3 页 · 切换 {{ changes }} 次</output
    >
    <div class="flex flex-wrap gap-3">
      <button
        type="button"
        :disabled="!loop && index === 0"
        class="min-h-touch rounded-lg border border-border px-4 text-sm disabled:opacity-40"
        @click="move(-1)"
      >
        上一页
      </button>
      <button
        type="button"
        :disabled="!loop && index === 2"
        class="min-h-touch rounded-lg border border-border px-4 text-sm disabled:opacity-40"
        @click="move(1)"
      >
        下一页
      </button>
    </div>
  </section>
</template>
