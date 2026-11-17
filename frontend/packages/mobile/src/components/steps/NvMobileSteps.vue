<script setup lang="ts">
import { Check, X } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Steps.styles'
import type { MobileStepItem, MobileStepsStatus, MobileStepsProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MobileStepsProps>(), {
  // Undefined, not false: an explicit value would make `current` controlled,
  // so an internal press could never move it.
  current: undefined,
  defaultCurrent: 0,
  direction: 'horizontal',
  clickable: false,
  ariaLabel: '步骤',
})

const emit = defineEmits<{
  'update:current': [index: number]
  'change': [index: number]
}>()

const inner = ref(props.defaultCurrent)

const currentIndex = computed(() => {
  const raw = props.current !== undefined ? props.current : inner.value
  return Math.min(Math.max(raw, 0), Math.max(props.items.length - 1, 0))
})

function statusOf(item: MobileStepItem, index: number): MobileStepsStatus {
  if (item.status) return item.status
  if (index < currentIndex.value) return 'done'
  if (index === currentIndex.value) return 'active'
  return 'wait'
}

function markerSx(status: MobileStepsStatus, active: boolean) {
  return stylex.props(
    styles.marker,
    status === 'done' && styles.markerDone,
    (status === 'active' || status === 'process') && styles.markerActive,
    status === 'error' && styles.markerError,
    active && (status === 'active' || status === 'process') && styles.markerActiveRing,
    props.clickable && focus.subtle,
  )
}

const hitSx = computed(() => stylex.props(styles.markerHit))

function isDone(status: MobileStepsStatus) {
  return status === 'done'
}

function isError(status: MobileStepsStatus) {
  return status === 'error'
}

function goTo(index: number) {
  if (!props.clickable) return
  inner.value = index
  emit('update:current', index)
  emit('change', index)
}
</script>

<template>
  <div
    v-bind="$attrs"
    role="group"
    :aria-label="ariaLabel"
    :class="[
      stylex.props(styles.root, direction === 'vertical' ? styles.vertical : styles.horizontal).className,
      $attrs.class,
    ]"
    :style="[stylex.props(styles.root).style, $attrs.style]"
  >
    <div
      v-for="(item, index) in items"
      :key="index"
      :class="
        stylex.props(
          styles.item,
          direction === 'vertical' ? styles.itemVertical : styles.stepColumn,
        ).className
      "
    >
      <!-- Vertical: marker and its line share a rail. Horizontal: each step
           carries half the connector before and after its marker. -->
      <div v-if="direction === 'vertical'" :class="stylex.props(styles.rail).className">
        <button
          type="button"
          :disabled="!clickable"
          :aria-current="index === currentIndex ? 'step' : undefined"
          :aria-label="`第 ${index + 1} 步：${item.title}`"
          :class="hitSx.className"
          :style="hitSx.style"
          @click="goTo(index)"
        >
          <span :class="markerSx(statusOf(item, index), index === currentIndex).className">
            <X v-if="isError(statusOf(item, index))" aria-hidden="true" :size="16" />
            <Check v-else-if="isDone(statusOf(item, index))" aria-hidden="true" :size="16" />
            <span v-else>{{ index + 1 }}</span>
          </span>
        </button>
        <div
          v-if="index < items.length - 1"
          :class="
            stylex.props(
              styles.connector,
              styles.connectorVertical,
              index < currentIndex && styles.connectorDone,
            ).className
          "
          style="flex: 1"
        />
      </div>

      <div v-else :class="stylex.props(styles.markerRow).className">
        <div
          v-if="index > 0"
          :class="
            stylex.props(
              styles.connector,
              styles.connectorHorizontal,
              index <= currentIndex && styles.connectorDone,
            ).className
          "
          style="flex: 1"
        />
        <button
          type="button"
          :disabled="!clickable"
          :aria-current="index === currentIndex ? 'step' : undefined"
          :aria-label="`第 ${index + 1} 步：${item.title}`"
          :class="hitSx.className"
          :style="hitSx.style"
          @click="goTo(index)"
        >
          <span :class="markerSx(statusOf(item, index), index === currentIndex).className">
            <X v-if="isError(statusOf(item, index))" aria-hidden="true" :size="16" />
            <Check v-else-if="isDone(statusOf(item, index))" aria-hidden="true" :size="16" />
            <span v-else>{{ index + 1 }}</span>
          </span>
        </button>
        <div
          v-if="index < items.length - 1"
          :class="
            stylex.props(
              styles.connector,
              styles.connectorHorizontal,
              index < currentIndex && styles.connectorDone,
            ).className
          "
          style="flex: 1"
        />
      </div>

      <div
        :class="
          stylex.props(
            styles.content,
            direction === 'horizontal' && styles.contentHorizontal,
          ).className
        "
        style="flex: 1"
      >
        <span
          :class="stylex.props(styles.title, index === currentIndex && styles.titleActive).className"
        >{{ item.title }}</span>
        <span v-if="item.description" :class="stylex.props(styles.description).className">
          {{ item.description }}
        </span>
      </div>
    </div>
  </div>
</template>
