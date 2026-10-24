<script setup lang="ts">
import { useEventListener, useResizeObserver } from '@vueuse/core'
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { computeScale, type ScaleMode } from './scale'

const props = withDefaults(
  defineProps<{
    designWidth?: number
    designHeight?: number
    mode?: ScaleMode
  }>(),
  { designWidth: 1920, designHeight: 1080, mode: 'fit' },
)

const designWidth = computed(() =>
  Number.isFinite(props.designWidth) && props.designWidth > 0 ? props.designWidth : 1920,
)
const designHeight = computed(() =>
  Number.isFinite(props.designHeight) && props.designHeight > 0 ? props.designHeight : 1080,
)

const vw = ref(designWidth.value)
const vh = ref(designHeight.value)

const viewport = useTemplateRef<HTMLDivElement>('viewport')

function update() {
  if (typeof window === 'undefined') return
  vw.value = viewport.value?.clientWidth || window.innerWidth
  vh.value = viewport.value?.clientHeight || window.innerHeight
}

onMounted(update)
useEventListener('resize', update)
useResizeObserver(viewport, update)

const scale = computed(() =>
  computeScale(vw.value, vh.value, designWidth.value, designHeight.value, props.mode),
)

const stageStyle = computed(() => ({
  width: `${designWidth.value}px`,
  height: `${designHeight.value}px`,
  transform: `scale(${scale.value.x}, ${scale.value.y})`,
  transformOrigin: 'top left',
}))
const boundsStyle = computed(() => ({
  width: `${designWidth.value * scale.value.x}px`,
  height: `${designHeight.value * scale.value.y}px`,
}))
</script>

<template>
  <div ref="viewport" class="screen-scaler" :class="{ 'screen-scaler--width': mode === 'width' }">
    <div class="screen-scaler__bounds" :style="boundsStyle">
      <div class="screen-scaler__stage" :style="stageStyle">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
@layer nv-components {
  .screen-scaler {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--nv-scr-bg, #03050b);
  }
  .screen-scaler--width {
    display: block;
    overflow: auto;
  }
  .screen-scaler__bounds {
    position: relative;
    flex: none;
    margin-inline: auto;
  }
  .screen-scaler__stage {
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
