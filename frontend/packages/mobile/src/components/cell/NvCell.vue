<script setup lang="ts">
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed, useAttrs } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Cell.styles'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    value?: string
    to?: string
    clickable?: boolean
    disabled?: boolean
    arrow?: boolean
  }>(),
  {
    description: undefined,
    value: undefined,
    to: undefined,
    clickable: false,
    disabled: false,
    arrow: true,
  },
)

const attrs = useAttrs()
const interactive = computed(
  () => !props.disabled && (props.clickable || !!props.to || typeof attrs.onClick === 'function'),
)
const tag = computed(() =>
  interactive.value && props.to ? 'a' : interactive.value ? 'button' : 'div',
)
const sx = computed(() =>
  stylex.props(
    styles.cell,
    interactive.value && focus.subtle,
    interactive.value && styles.interactive,
    props.disabled && styles.disabled,
  ),
)

function onClick(event: MouseEvent) {
  if (!props.disabled) return
  event.preventDefault()
  event.stopImmediatePropagation()
}
</script>

<template>
  <component
    :is="tag"
    :href="to"
    :type="tag === 'button' ? 'button' : undefined"
    :disabled="tag === 'button' ? disabled : undefined"
    :aria-disabled="disabled || undefined"
    :tabindex="disabled && tag === 'a' ? -1 : undefined"
    :class="sx.className"
    :style="sx.style"
    @click="onClick"
  >
    <span v-if="$slots.icon" :class="stylex.props(styles.icon).className">
      <slot name="icon" />
    </span>
    <span :class="stylex.props(styles.body).className">
      <span v-if="title || $slots.title" :class="stylex.props(styles.title).className">
        <slot name="title">{{ title }}</slot>
      </span>
      <span v-if="description || $slots.description" :class="stylex.props(styles.description).className">
        <slot name="description">{{ description }}</slot>
      </span>
    </span>
    <span v-if="value || $slots.value" :class="stylex.props(styles.value).className">
      <slot name="value">{{ value }}</slot>
    </span>
    <span v-if="$slots.extra" :class="stylex.props(styles.value).className">
      <slot name="extra" />
    </span>
    <slot name="arrow">
      <NvIcon name="chevron-right"
        v-if="interactive && arrow"
        :size="18"
        :class="stylex.props(styles.arrow).className"
      />
    </slot>
  </component>
</template>
