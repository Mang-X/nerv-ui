<script setup lang="ts">
import { useDocumentState } from '@embedpdf/core/vue'
import { useRenderCapability } from '@embedpdf/plugin-render/vue'
import { computed, shallowRef, watch } from 'vue'

const props = defineProps<{
  documentId: string
  pageIndex: number
}>()

const { provides: renderCapability } = useRenderCapability()
const documentState = useDocumentState(() => props.documentId)
const scale = computed(() => documentState.value?.scale ?? 1)
const refreshVersion = computed(
  () => documentState.value?.pageRefreshVersions[props.pageIndex] ?? 0,
)
const imageUrl = shallowRef<string | null>(null)

// Preserve the 2.14.4 render parameters. Each run owns its task and URL,
// independently of whether the browser has decoded the image yet.
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
      // PdfErrorCode.Cancelled = 9 in the fixed 2.14.4 producer.
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
  <img v-if="imageUrl" :src="imageUrl" style="width: 100%; height: 100%" />
</template>
