<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
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
let startX = 0
let startOffset = 0
let pointerId: number | null = null

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

function clamp(value: number) {
  if (props.side === 'end') return Math.min(0, Math.max(-panelWidth.value, value))
  return Math.max(0, Math.min(panelWidth.value, value))
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled) return
  pointerId = event.pointerId
  startX = event.clientX
  startOffset = offset.value
  dragging.value = false
  ;(event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (props.disabled || pointerId !== event.pointerId) return
  const delta = event.clientX - startX
  if (!dragging.value && Math.abs(delta) < 8) return
  dragging.value = true
  offset.value = clamp(startOffset + delta)
}

function onPointerUp(event: PointerEvent) {
  if (pointerId !== event.pointerId) return
  pointerId = null
  const wasOpen = isOpen.value
  dragging.value = false
  const resting = Math.abs(offset.value) > panelWidth.value / 2 ? sign.value * panelWidth.value : 0
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
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <slot />
    </div>
  </div>
</template>
