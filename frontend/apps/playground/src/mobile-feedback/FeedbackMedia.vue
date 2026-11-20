<script setup lang="ts">
import { shallowRef } from 'vue'
import {
  NvMobileAvatar,
  NvMobileButton,
  NvMobileImage,
  NvMobileProgress,
  NvMobileSkeleton,
} from '@nerv-ui/ui-mobile'
const image = shallowRef('/media/lake.svg')
const avatar = shallowRef('/media/portrait.svg')
const progress = shallowRef<number | null>(null)
const failed = shallowRef(false)
const loaded = shallowRef(false)
function update(value: number | null, error = false) {
  progress.value = value
  failed.value = error
  loaded.value = value === 100
}
</script>
<template>
  <section aria-labelledby="feedback-media-title" class="space-y-4">
    <h2 id="feedback-media-title" class="text-lg font-semibold">把风景收入手记</h2>
    <div class="flex items-center gap-4">
      <NvMobileAvatar data-live-avatar :src="avatar" name="林悦" alt="林悦的手绘头像" size="lg" />
      <NvMobileAvatar name="Alex River" size="sm" />
      <NvMobileAvatar data-slot-avatar shape="square"><span>旅</span></NvMobileAvatar>
      <p class="text-sm text-muted-foreground">与林悦一起，收藏日常</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <NvMobileButton size="lg" variant="outline" @click="avatar = '/media/missing-avatar.png'"
        >损坏的头像</NvMobileButton
      ><NvMobileButton size="lg" variant="outline" @click="avatar = '/media/portrait.svg'"
        >恢复头像</NvMobileButton
      >
    </div>
    <NvMobileImage :src="image" alt="手绘的湖畔与草地" ratio="16/9" radius="lg" />
    <div class="flex flex-wrap gap-2">
      <NvMobileButton size="lg" variant="outline" @click="image = '/media/missing-landscape.png'"
        >损坏的风景</NvMobileButton
      ><NvMobileButton size="lg" variant="outline" @click="image = '/media/meadow.svg'"
        >换一张风景</NvMobileButton
      ><NvMobileButton size="lg" variant="text" @click="image = '/media/lake.svg'"
        >回到湖畔</NvMobileButton
      >
    </div>
    <p aria-label="进度状态" aria-live="polite" class="text-sm text-muted-foreground">
      {{
        failed
          ? '整理失败，进度不可用'
          : progress === null
            ? '进度未知，等待开始'
            : `已整理 ${progress}%`
      }}
    </p>
    <NvMobileProgress
      v-if="progress !== null && !failed"
      :value="progress"
      :tone="progress === 100 ? 'success' : 'brand'"
      show-label
    />
    <div
      v-if="!loaded"
      aria-label="手记内容加载中"
      class="flex items-center gap-3 rounded-xl border border-border p-4"
    >
      <NvMobileSkeleton variant="circle" />
      <div class="flex-1 space-y-3">
        <NvMobileSkeleton /><NvMobileSkeleton variant="rect" class="h-12" />
      </div>
    </div>
    <p v-else class="rounded-xl border border-border bg-card p-4">湖畔的风，已收入手记。</p>
    <div class="flex flex-wrap gap-2">
      <NvMobileButton size="lg" @click="update(0)">开始整理</NvMobileButton
      ><NvMobileButton size="lg" variant="outline" @click="update(50)">整理到一半</NvMobileButton
      ><NvMobileButton size="lg" variant="outline" @click="update(null, true)"
        >整理失败</NvMobileButton
      ><NvMobileButton size="lg" variant="outline" @click="update(100)">完成整理</NvMobileButton
      ><NvMobileButton size="lg" variant="text" @click="update(null)">未知进度</NvMobileButton>
    </div>
  </section>
</template>
