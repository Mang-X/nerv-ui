<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { screenDarkTheme } from '../../tokens.stylex'
import { styles } from './ScreenScaler.styles'

const props = withDefaults(
  defineProps<{
    designWidth?: number
    designHeight?: number
    ariaLabel?: string
  }>(),
  { designWidth: 1920, designHeight: 1080, ariaLabel: '数据大屏' },
)

const emit = defineEmits<{ 'scale-change': [scale: number] }>()

const host = ref<HTMLElement | null>(null)
const scale = ref(1)
let observer: ResizeObserver | undefined

const rootSx = computed(() => stylex.props(screenDarkTheme, styles.root))
const stageSx = computed(() => stylex.props(styles.stage))
const hostStyle = computed(() => ({ height: `${props.designHeight * scale.value}px` }))
const stageStyle = computed(() => ({
  width: `${props.designWidth}px`,
  height: `${props.designHeight}px`,
  transform: `scale(${scale.value || 1})`,
}))

function update() {
  const width = host.value?.clientWidth ?? 0
  if (width <= 0) return
  const next = width / props.designWidth
  if (next === scale.value) return
  scale.value = next
  emit('scale-change', next)
}

onMounted(() => {
  update()
  if (typeof ResizeObserver !== 'undefined' && host.value) {
    observer = new ResizeObserver(update)
    observer.observe(host.value)
  } else {
    window.addEventListener('resize', update)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = undefined
  if (typeof ResizeObserver === 'undefined') {
    window.removeEventListener('resize', update)
  }
})

watch(() => [props.designWidth, props.designHeight], update)
</script>

<template>
  <div
    ref="host"
    role="region"
    :aria-label="ariaLabel"
    :class="rootSx.className"
    :style="[rootSx.style, hostStyle]"
  >
    <div :class="stageSx.className" :style="[stageSx.style, stageStyle]">
      <slot :scale="scale" />
    </div>
  </div>
</template>
