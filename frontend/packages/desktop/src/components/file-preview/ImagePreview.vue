<script setup lang="ts">
import { MaximizeIcon, RotateCcwIcon, RotateCwIcon, ZoomInIcon, ZoomOutIcon } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { styles } from './viewer.styles'

const props = defineProps<{ src: string; fileName: string }>()

const emit = defineEmits<{ ready: []; error: [message: string] }>()

const rootSx = stylex.props(styles.viewer)
const toolbarSx = stylex.props(styles.toolbar)
const iconButtonSx = stylex.props(styles.iconButton)
const labelSx = stylex.props(styles.label)
const spacerSx = stylex.props(styles.toolbarSpacer)
const canvasSx = stylex.props(styles.canvasArea)

const scale = ref(1)
const rotation = ref(0)

/** 图片自己在画布内缩放/旋转，不依赖容器滚动。 */
const imageStyle = computed(() => ({
  transform: `scale(${scale.value}) rotate(${rotation.value}deg)`,
}))

function zoomIn() {
  scale.value = Math.min(scale.value + 0.1, 3)
}
function zoomOut() {
  scale.value = Math.max(scale.value - 0.1, 0.2)
}
function rotateLeft() {
  rotation.value -= 90
}
function rotateRight() {
  rotation.value += 90
}
function reset() {
  scale.value = 1
  rotation.value = 0
}
function onError() {
  emit('error', `无法加载 ${props.fileName}。`)
}
</script>

<template>
  <div data-slot="nv-file-preview-image" :class="rootSx.className" :style="rootSx.style">
    <div :class="toolbarSx.className" :style="toolbarSx.style">
      <button
        type="button"
        aria-label="缩小图片"
        :class="iconButtonSx.className"
        :style="iconButtonSx.style"
        @click="zoomOut"
      >
        <ZoomOutIcon :size="16" aria-hidden="true" />
      </button>
      <span :class="labelSx.className" :style="labelSx.style">{{ Math.round(scale * 100) }}%</span>
      <button
        type="button"
        aria-label="放大图片"
        :class="iconButtonSx.className"
        :style="iconButtonSx.style"
        @click="zoomIn"
      >
        <ZoomInIcon :size="16" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="向左旋转"
        :class="iconButtonSx.className"
        :style="iconButtonSx.style"
        @click="rotateLeft"
      >
        <RotateCcwIcon :size="16" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="向右旋转"
        :class="iconButtonSx.className"
        :style="iconButtonSx.style"
        @click="rotateRight"
      >
        <RotateCwIcon :size="16" aria-hidden="true" />
      </button>

      <span :class="spacerSx.className" :style="spacerSx.style" />

      <button
        type="button"
        aria-label="复位图片"
        :class="iconButtonSx.className"
        :style="iconButtonSx.style"
        @click="reset"
      >
        <MaximizeIcon :size="16" aria-hidden="true" />
      </button>
    </div>

    <div :class="canvasSx.className" :style="canvasSx.style">
      <img
        :src="src"
        :alt="fileName"
        draggable="false"
        style="max-width: 100%; max-height: 100%; object-fit: contain; user-select: none; transition: transform 0.2s ease; border-radius: 6px"
        :style="imageStyle"
        @load="emit('ready')"
        @error="onError"
      />
    </div>
  </div>
</template>
