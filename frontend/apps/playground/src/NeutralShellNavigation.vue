<script setup lang="ts">
import { useSidebar } from '@nerv-iip/ui'
const { setOpenMobile } = useSidebar()
function onNavigate(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return
  const target = event.target
  const link = target instanceof Element ? target.closest('a[href]') : null
  if (link && event.currentTarget instanceof Element && event.currentTarget.contains(link)) {
    setOpenMobile(false)
  }
}
</script>
<template>
  <div class="flex flex-col" @click="onNavigate"><slot /></div>
</template>
