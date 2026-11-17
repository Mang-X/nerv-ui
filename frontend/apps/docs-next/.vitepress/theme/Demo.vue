<template>
  <div class="nv-demo">
    <div class="nv-demo-stage"><slot /></div>
  </div>
</template>

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
</style>
