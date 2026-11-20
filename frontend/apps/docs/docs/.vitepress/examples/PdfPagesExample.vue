<script setup lang="ts">
import { ref } from 'vue'
import { withBase } from 'vitepress'
import { FilePreview } from '@nerv-ui/ui/file-preview'

// Byte-identical fixture from apps/playground/public/files/reading-journey.pdf.
// Original provenance: apps/playground/public/files/PDF-SOURCES.md.
const source = withBase('/file-preview/reading-journey.pdf')
const openedSource = ref('')
</script>

<template>
  <section class="w-full min-w-0 space-y-3" aria-label="多页 PDF 导航示例">
    <p class="text-sm text-muted-foreground">
      使用上一页、下一页或页码选择切换页面；窄屏可聚焦下方预览区域，横向滚动查看完整工具栏与页面。
    </p>
    <div
      role="region"
      aria-label="多页 PDF 预览横向滚动区"
      tabindex="0"
      class="w-full min-w-0 overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-ring"
    >
      <div class="min-w-[480px]">
        <FilePreview
          :src="source"
          file-name="reading-journey.pdf"
          content-type="application/pdf"
          :size-bytes="3782"
          :height="520"
          @open-source="openedSource = $event"
        />
      </div>
    </div>
    <p v-if="openedSource" role="status" class="text-sm break-words text-muted-foreground">
      已选择源文件：
      <a :href="openedSource" target="_blank" rel="noopener noreferrer">reading-journey.pdf</a>
    </p>
  </section>
</template>
