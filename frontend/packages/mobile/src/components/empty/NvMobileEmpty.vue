<script setup lang="ts">
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Empty.styles'
import type { MobileEmptyProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MobileEmptyProps>(), {
  title: undefined,
  description: undefined,
  icon: undefined,
  bordered: true,
  size: 'md',
})

const rootSx = computed(() =>
  stylex.props(styles.root, props.bordered && styles.bordered, props.size === 'sm' && styles.sm),
)
const iconSize = computed(() => (props.size === 'sm' ? 28 : 36))
</script>

<template>
  <div
    v-bind="$attrs"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <div :class="stylex.props(styles.icon).className">
      <slot name="icon">
        <component v-if="icon" :is="icon" aria-hidden="true" :size="iconSize" />
        <NvIcon v-else name="inbox" :size="iconSize" />
      </slot>
    </div>
    <div :class="stylex.props(styles.content).className">
      <slot name="title">
        <h3 v-if="title" :class="stylex.props(styles.title).className">{{ title }}</h3>
      </slot>
      <slot name="description">
        <p v-if="description" :class="stylex.props(styles.description).className">{{ description }}</p>
      </slot>
    </div>
    <div v-if="$slots.default" :class="stylex.props(styles.actions).className">
      <slot />
    </div>
  </div>
</template>
