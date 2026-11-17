<template>
  <div class="nv-demo">
    <div class="nv-demo-stage" :class="{ 'nv-demo-stage--block': block }"><slot /></div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ block?: boolean }>(), { block: false })
</script>

<style scoped>
.nv-demo {
  margin: 1rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
}
.nv-demo-stage {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 20px;
}
.nv-demo-stage--block {
  display: block;
}
.nv-demo-stage--block > * {
  width: 100%;
}
</style>
