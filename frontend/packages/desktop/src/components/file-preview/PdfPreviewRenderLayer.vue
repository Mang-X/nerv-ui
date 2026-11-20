<script setup lang="ts">
import { useDocumentState } from '@embedpdf/core/vue'
import { useRenderCapability } from '@embedpdf/plugin-render/vue'
import { computed, shallowRef, watch } from 'vue'

const props = defineProps<{ documentId: string; pageIndex: number }>()

const { provides: renderCapability } = useRenderCapability()
const documentState = useDocumentState(() => props.documentId)
const scale = computed(() => documentState.value?.scale ?? 1)
const refreshVersion = computed(
  () => documentState.value?.pageRefreshVersions[props.pageIndex] ?? 0,
)
const imageUrl = shallowRef<string | null>(null)

// 保留 2.14.4 的渲染参数；每次渲染自己持有 task 与 URL，与浏览器是否已解码无关。
watch(
  [() => props.documentId, () => props.pageIndex, scale, renderCapability, refreshVersion],
  ([documentId, pageIndex, scaleFactor, capability], _previous, onCleanup) => {
    if (!capability) {
      imageUrl.value = null
      return
    }
    let active = true
    let objectUrl: string | undefined
    const task = capability.forDocument(documentId).renderPage({
      pageIndex,
      options: { scaleFactor, dpr: window.devicePixelRatio },
    })
    onCleanup(() => {
      active = false
      // 2.14.4 里 PdfErrorCode.Cancelled = 9。
      task.abort({ code: 9, message: 'canceled render task' })
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    })
    task.wait(
      (blob) => {
        if (!active) return
        objectUrl = URL.createObjectURL(blob)
        imageUrl.value = objectUrl
      },
      () => {},
    )
  },
  { immediate: true },
)
</script>

<template>
  <img v-if="imageUrl" :src="imageUrl" style="width: 100%; height: 100%" alt="" />
</template>
