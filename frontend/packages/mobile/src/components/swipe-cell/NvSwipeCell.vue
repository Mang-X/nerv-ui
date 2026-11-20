<script setup lang="ts">
import { bindDrag } from '@ui-sdk/core'
import { rubberBand } from '@ui-sdk/core/gesture'
import { Button } from '@ui-sdk/vue/button'
import * as stylex from '@stylexjs/stylex'
import { computed, onBeforeUnmount, ref } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './SwipeCell.styles'
import type { MobileSwipeAction, MobileSwipeCellProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MobileSwipeCellProps>(), {
  actions: () => [],
  actionWidth: 76,
  disabled: false,
  actionsLabel: '操作',
  side: 'end',
})

const emit = defineEmits<{
  action: [value: string]
  'open-change': [open: boolean]
}>()

const offset = ref(0)
const dragging = ref(false)
let stopDrag: (() => void) | undefined
let startOffset = 0
onBeforeUnmount(() => stopDrag?.())

const panelWidth = computed(() => props.actions.length * props.actionWidth)
const sign = computed(() => (props.side === 'end' ? -1 : 1))

const contentSx = computed(() =>
  stylex.props(styles.content, dragging.value && styles.contentDragging),
)

const contentStyle = computed(() => ({ transform: `translateX(${offset.value}px)` }))

const actionsSx = computed(() =>
  stylex.props(styles.actions, props.side === 'end' ? styles.actionsEnd : styles.actionsStart),
)

const isOpen = computed(() => Math.abs(offset.value) > 8)

function actionSx(action: MobileSwipeAction) {
  return stylex.props(
    styles.action,
    focus.subtle,
    action.variant === 'danger' && styles.actionDanger,
    action.variant === 'neutral' && styles.actionNeutral,
  )
}

/**
 * 手势交给 ui-sdk 的 bindDrag：阈值判断、每帧采样、指针丢失与 Escape 取消
 * 都由它负责。越界阻力用同一 foundation 的 rubberBand。
 */
function onPointerDown(event: PointerEvent) {
  if (props.disabled || event.button !== 0) return
  const el = event.currentTarget as HTMLElement | null
  if (!el) return
  startOffset = offset.value
  stopDrag?.()
  stopDrag = bindDrag(el, event, {
    threshold: 6,
    onStart: () => {
      dragging.value = true
      return true
    },
    onMove: (sample) => {
      // 有效行程是 [0, -panelWidth]；超出的那一段用橡皮筋衰减，而不是硬夹住。
      const raw = startOffset + sample.x
      const limit = panelWidth.value
      const overshoot = raw > 0 ? raw : raw < -limit ? -raw - limit : 0
      if (!overshoot) {
        offset.value = raw
        return
      }
      const shown = rubberBand(overshoot, limit)
      offset.value = raw > 0 ? shown : -limit - shown
    },
    onEnd: () => {
      dragging.value = false
      stopDrag = undefined
      settle()
    },
  })
}

/** 松手后吸附到「完全打开」或「关闭」。 */
function settle() {
  const wasOpen = isOpen.value
  const resting =
    Math.abs(offset.value) > panelWidth.value / 2 ? sign.value * panelWidth.value : 0
  offset.value = resting
  if (wasOpen !== (resting !== 0)) emit('open-change', resting !== 0)
}

function close() {
  if (offset.value === 0) return
  offset.value = 0
  emit('open-change', false)
}

function run(action: MobileSwipeAction) {
  if (action.disabled) return
  emit('action', action.value)
  close()
}

defineExpose({ close })
</script>

<template>
  <div
    v-bind="$attrs"
    :class="[stylex.props(styles.root).className, $attrs.class]"
    :style="[stylex.props(styles.root).style, $attrs.style]"
  >
    <div :class="actionsSx.className" :style="actionsSx.style" role="group" :aria-label="actionsLabel">
      <Button
        v-for="action in actions"
        :key="action.value"
        type="button"
        :disabled="action.disabled"
        :tabindex="isOpen ? 0 : -1"
        :class="actionSx(action).className"
        :style="[actionSx(action).style, { width: `${actionWidth}px` }]"
        @click="run(action)"
      >
        {{ action.label }}
      </Button>
    </div>
    <div
      :class="contentSx.className"
      :style="[contentSx.style, contentStyle]"
      @pointerdown="onPointerDown"
      style="touch-action: pan-y"
    >
      <slot />
    </div>
  </div>
</template>
