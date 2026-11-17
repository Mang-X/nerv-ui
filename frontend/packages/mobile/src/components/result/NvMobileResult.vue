<script setup lang="ts">
import { CircleCheck, CircleX, Info, TriangleAlert } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Result.styles'
import type { MobileResultProps, MobileResultStatus } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MobileResultProps>(), {
  status: 'success',
  title: undefined,
  description: undefined,
  icon: undefined,
  actionText: undefined,
})

const emit = defineEmits<{ action: [] }>()

const defaultIcons = {
  success: CircleCheck,
  error: CircleX,
  warning: TriangleAlert,
  info: Info,
} as const

const statusIcon = computed(() => props.icon ?? defaultIcons[props.status as MobileResultStatus])

const iconSx = computed(() =>
  stylex.props(
    styles.icon,
    props.status === 'success' && styles.iconBrand,
    props.status === 'error' && styles.iconDanger,
    props.status === 'warning' && styles.iconWarning,
  ),
)
</script>

<template>
  <div
    v-bind="$attrs"
    :class="[stylex.props(styles.root).className, $attrs.class]"
    :style="[stylex.props(styles.root).style, $attrs.style]"
  >
    <div :class="iconSx.className" :style="iconSx.style">
      <slot name="icon">
        <component :is="statusIcon" aria-hidden="true" :size="40" />
      </slot>
    </div>
    <div :class="stylex.props(styles.content).className" role="status" aria-live="polite">
      <slot name="title">
        <h2 v-if="title" :class="stylex.props(styles.title).className">{{ title }}</h2>
      </slot>
      <slot name="description">
        <p v-if="description" :class="stylex.props(styles.description).className">{{ description }}</p>
      </slot>
    </div>
    <div v-if="actionText || $slots.default" :class="stylex.props(styles.actions).className">
      <slot>
        <button
          v-if="actionText"
          type="button"
          :class="stylex.props(styles.action, focus.ring).className"
          @click="emit('action')"
        >
          {{ actionText }}
        </button>
      </slot>
    </div>
  </div>
</template>
