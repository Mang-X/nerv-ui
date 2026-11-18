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
/* block 只是把主轴换成纵向，仍然走 flex 的 gap：
   用 display:block 会让多段演示（进度条、分割线、树等）互相贴住。 */
.nv-demo-stage--block {
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
}
</style>
