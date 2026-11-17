<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, useAttrs } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './ListRow.styles'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    meta?: string
    to?: string
    clickable?: boolean
    disabled?: boolean
    divider?: boolean
  }>(),
  {
    title: undefined,
    description: undefined,
    meta: undefined,
    to: undefined,
    clickable: false,
    disabled: false,
    divider: true,
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
    styles.row,
    !props.divider && styles.noDivider,
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
    <span v-if="$slots.leading" :class="stylex.props(styles.leading).className">
      <slot name="leading" />
    </span>
    <span :class="stylex.props(styles.body).className">
      <span v-if="title || meta || $slots.title || $slots.meta" :class="stylex.props(styles.titleRow).className">
        <span v-if="title || $slots.title" :class="stylex.props(styles.title).className">
          <slot name="title">{{ title }}</slot>
        </span>
        <span v-if="meta || $slots.meta" :class="stylex.props(styles.meta).className">
          <slot name="meta">{{ meta }}</slot>
        </span>
      </span>
      <span v-if="description || $slots.description" :class="stylex.props(styles.description).className">
        <slot name="description">{{ description }}</slot>
      </span>
      <slot />
    </span>
    <span v-if="$slots.trailing" :class="stylex.props(styles.trailing).className">
      <slot name="trailing" />
    </span>
  </component>
</template>
