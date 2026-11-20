<script setup lang="ts">
import { ref } from 'vue'
import { NvButton, Tabs, TabsList, TabsTrigger, TabsContent } from '@nerv-ui/ui'
const current = ref('garden')
const variant = ref<'default' | 'line'>('default')
const orientation = ref<'horizontal' | 'vertical'>('horizontal')
</script>

<template>
  <section class="min-w-0 space-y-4">
    <div class="flex flex-wrap gap-2" role="group" aria-label="标签外观">
      <NvButton :aria-pressed="variant === 'default'" @click="variant = 'default'">默认</NvButton>
      <NvButton :aria-pressed="variant === 'line'" @click="variant = 'line'">线条</NvButton>
    </div>
    <div class="flex flex-wrap gap-2" role="group" aria-label="标签方向">
      <NvButton :aria-pressed="orientation === 'horizontal'" @click="orientation = 'horizontal'"
        >横向</NvButton
      >
      <NvButton :aria-pressed="orientation === 'vertical'" @click="orientation = 'vertical'"
        >纵向</NvButton
      >
    </div>
    <Tabs v-model="current" :orientation="orientation" class="min-w-0">
      <TabsList :variant="variant" aria-label="阅读地点">
        <TabsTrigger value="garden">花园阅读</TabsTrigger>
        <TabsTrigger value="window">窗边阅读</TabsTrigger>
        <TabsTrigger value="terrace" disabled>露台</TabsTrigger>
      </TabsList>
      <TabsContent value="garden" class="min-w-0"
        >花园阅读：带一本喜欢的书，听风翻动树叶。</TabsContent
      >
      <TabsContent value="window" class="min-w-0"
        >窗边阅读：靠窗坐下，留一点安静的时间。</TabsContent
      >
      <TabsContent value="terrace" class="min-w-0">露台暂未开放。</TabsContent>
    </Tabs>
    <p role="status" class="text-sm text-muted-foreground">
      当前地点：{{ current === 'garden' ? '花园阅读' : '窗边阅读' }}
    </p>
  </section>
</template>
