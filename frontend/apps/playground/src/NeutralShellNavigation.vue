<script setup lang="ts">
import { useSidebar } from '@nerv-ui/ui'
const { setOpenMobile } = useSidebar()
// SPA routers prevent the native default even when they accept navigation.
function onNavigate(event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
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
