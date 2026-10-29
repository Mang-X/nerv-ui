<script setup lang="ts">
import { ref } from 'vue'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogScrollContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  NvButton,
} from '@nerv-iip/ui'
const fixedOpen = ref(false)
const scrollOpen = ref(false)
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <Dialog v-model:open="fixedOpen">
      <DialogTrigger as-child><NvButton data-open="fixed">阅读提示</NvButton></DialogTrigger>
      <DialogContent id="base-dialog-fixed" data-reading="fixed" :show-close-button="false">
        <DialogHeader>
          <DialogTitle as="h3">留一点阅读时间</DialogTitle>
          <DialogDescription as-child>
            <div>选一本喜欢的书。<a href="#基础-dialog固定与滚动内容">查看阅读说明</a></div>
          </DialogDescription>
        </DialogHeader>
        <p>在窗边坐一会儿，让翻页的声音陪伴片刻。</p>
        <DialogFooter show-close-button />
      </DialogContent>
    </Dialog>
    <Dialog v-model:open="scrollOpen">
      <DialogTrigger as-child
        ><NvButton data-open="scroll" variant="outline">阅读长文</NvButton></DialogTrigger
      >
      <DialogScrollContent
        id="base-dialog-scroll"
        data-reading="scroll"
        class="max-w-[calc(100%-2rem)] sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle as-child><h2>沿着书页散步</h2></DialogTitle>
          <DialogDescription as="p"
            >向下阅读到末端。<a href="#基础-dialog固定与滚动内容"
              >查看阅读说明</a
            ></DialogDescription
          >
        </DialogHeader>
        <article class="grid gap-4">
          <p v-for="row in 24" :key="row">
            第 {{ row }} 页：{{
              row === 24
                ? '阅读到这里，给今天留一点安静。'
                : '树影落在书页上，风穿过窗边。放慢脚步，读完这一段，再看看远处的天空。'
            }}
          </p>
        </article>
        <DialogFooter show-close-button />
      </DialogScrollContent>
    </Dialog>
  </div>
</template>
