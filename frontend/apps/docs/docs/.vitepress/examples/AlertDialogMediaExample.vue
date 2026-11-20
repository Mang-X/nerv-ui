<script setup lang="ts">
import { ref } from 'vue'
import { BookOpenIcon } from '@lucide/vue'
import {
  NvAlertDialog,
  AlertDialog,
  NvAlertDialogTrigger,
  AlertDialogTrigger,
  NvAlertDialogContent,
  AlertDialogContent,
  NvAlertDialogHeader,
  AlertDialogHeader,
  NvAlertDialogMedia,
  AlertDialogMedia,
  NvAlertDialogTitle,
  AlertDialogTitle,
  NvAlertDialogDescription,
  AlertDialogDescription,
  NvAlertDialogFooter,
  AlertDialogFooter,
  NvAlertDialogAction,
  AlertDialogAction,
  NvAlertDialogCancel,
  AlertDialogCancel,
  NvButton,
} from '@nerv-ui/ui'
const brandOpen = ref(false)
const baseOpen = ref(false)
const brandReceipt = ref('尚未确认')
const baseReceipt = ref('尚未确认')
</script>
<template>
  <div class="grid gap-6">
    <section class="min-w-0">
      <h3>品牌媒体</h3>
      <NvAlertDialog v-model:open="brandOpen">
        <NvAlertDialogTrigger as-child
          ><NvButton variant="outline">查看品牌媒体共读安排</NvButton></NvAlertDialogTrigger
        >
        <NvAlertDialogContent class="max-h-[calc(100dvh-2rem)] overflow-y-auto break-words">
          <NvAlertDialogHeader>
            <NvAlertDialogMedia><BookOpenIcon aria-hidden="true" /></NvAlertDialogMedia>
            <NvAlertDialogTitle class="leading-normal">确认周末共读安排</NvAlertDialogTitle>
            <NvAlertDialogDescription
              >一起阅读、交流与整理共享空间。请带上一本愿意分享的书，为其他读者留出通道。本次确认只记录在本页内存，刷新后不保留，不会删除或保存任何业务记录。</NvAlertDialogDescription
            >
          </NvAlertDialogHeader>
          <NvAlertDialogFooter class="static flex-wrap">
            <NvAlertDialogCancel class="h-auto whitespace-normal"
              >暂不确认，继续阅读说明</NvAlertDialogCancel
            >
            <NvAlertDialogAction
              class="h-auto whitespace-normal"
              @click="brandReceipt = '已在本页确认共读安排；刷新后不保留。'"
              >确认本页共读安排</NvAlertDialogAction
            >
          </NvAlertDialogFooter>
        </NvAlertDialogContent>
      </NvAlertDialog>
      <p role="status">{{ brandReceipt }}</p>
    </section>
    <section class="min-w-0">
      <h3>基础结构</h3>
      <AlertDialog v-model:open="baseOpen">
        <AlertDialogTrigger as-child
          ><NvButton variant="outline">查看基础结构共读安排</NvButton></AlertDialogTrigger
        >
        <AlertDialogContent class="max-h-[calc(100dvh-2rem)] overflow-y-auto break-words">
          <AlertDialogHeader>
            <AlertDialogMedia><BookOpenIcon aria-hidden="true" /></AlertDialogMedia>
            <AlertDialogTitle class="leading-normal">确认周末共读安排</AlertDialogTitle>
            <AlertDialogDescription
              >一起阅读、交流与整理共享空间。请带上一本愿意分享的书，为其他读者留出通道。本次确认只记录在本页内存，刷新后不保留，不会删除或保存任何业务记录。</AlertDialogDescription
            >
          </AlertDialogHeader>
          <AlertDialogFooter class="flex-wrap">
            <AlertDialogCancel class="h-auto whitespace-normal"
              >暂不确认，继续阅读说明</AlertDialogCancel
            >
            <AlertDialogAction
              class="h-auto whitespace-normal"
              @click="baseReceipt = '已在本页确认共读安排；刷新后不保留。'"
              >确认本页共读安排</AlertDialogAction
            >
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p role="status">{{ baseReceipt }}</p>
    </section>
  </div>
</template>
