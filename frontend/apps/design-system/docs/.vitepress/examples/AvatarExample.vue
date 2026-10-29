<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { Avatar, AvatarImage, AvatarFallback, NvButton } from '@nerv-iip/ui'

const mode = ref<'valid' | 'broken' | 'none'>('valid')
const src = computed(() =>
  withBase(mode.value === 'valid' ? '/media/portrait.svg' : '/media/missing-avatar.svg'),
)
</script>

<template>
  <section class="w-full min-w-0 space-y-4 break-words" aria-label="阅读伙伴图像">
    <div role="group" aria-label="图片来源" class="flex flex-wrap gap-2">
      <NvButton
        type="button"
        variant="secondary"
        :aria-pressed="mode === 'valid'"
        @click="mode = 'valid'"
      >
        本地有效图片
      </NvButton>
      <NvButton
        type="button"
        variant="secondary"
        :aria-pressed="mode === 'broken'"
        @click="mode = 'broken'"
      >
        无法加载的图片
      </NvButton>
      <NvButton
        type="button"
        variant="secondary"
        :aria-pressed="mode === 'none'"
        @click="mode = 'none'"
      >
        无图片
      </NvButton>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <Avatar :key="mode">
        <AvatarImage v-if="mode !== 'none'" :src="src" alt="阅读伙伴的本地图像" />
        <AvatarFallback>阅友</AvatarFallback>
      </Avatar>
      <p>阅读伙伴：阅友</p>
    </div>
    <p role="status" class="text-sm text-muted-foreground">
      {{
        mode === 'none'
          ? '未提供图片，显示文字回退“阅友”。'
          : mode === 'broken'
            ? '此来源的图片无法加载，显示文字回退“阅友”。'
            : '使用本地图像；加载期间显示“阅友”，成功后显示图片。'
      }}
    </p>
  </section>
</template>
