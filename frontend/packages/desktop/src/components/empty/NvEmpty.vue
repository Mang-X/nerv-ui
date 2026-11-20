<script setup lang="ts">
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Empty.styles'
import type { NvEmptyProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvEmptyProps>(), { size: 'md' })

const rootSx = computed(() => stylex.props(styles.root, props.size === 'sm' && styles.sm))
const iconSx = computed(() => stylex.props(styles.icon))
const contentSx = computed(() => stylex.props(styles.content))
const titleSx = computed(() => stylex.props(styles.title))
const descriptionSx = computed(() => stylex.props(styles.description))
const actionsSx = computed(() => stylex.props(styles.actions))
</script>

<template>
  <div
    v-bind="$attrs"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <div :class="iconSx.className" :style="iconSx.style">
      <slot name="icon">
        <NvIcon name="inbox" :size="size === 'sm' ? 24 : 32" />
      </slot>
    </div>
    <div :class="contentSx.className" :style="contentSx.style">
      <slot name="title">
        <h3 v-if="title" :class="titleSx.className" :style="titleSx.style">{{ title }}</h3>
      </slot>
      <slot name="description">
        <p v-if="description" :class="descriptionSx.className" :style="descriptionSx.style">
          {{ description }}
        </p>
      </slot>
    </div>
    <div v-if="$slots.default" :class="actionsSx.className" :style="actionsSx.style">
      <slot />
    </div>
  </div>
</template>
