<script setup lang="ts">
import { Separator } from '@ui-sdk/vue/separator'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './MobileDivider.styles'
import type { MobileDividerOrientation } from './types'

const props = withDefaults(
  defineProps<{
    orientation?: MobileDividerOrientation
    decorative?: boolean
    label?: string
  }>(),
  {
    orientation: 'horizontal',
    decorative: false,
    label: undefined,
  },
)

const vertical = computed(() => props.orientation === 'vertical')
</script>

<template>
  <div :class="stylex.props(styles.root, vertical && styles.rootVertical).className">
    <Separator
      v-if="vertical"
      orientation="vertical"
      :decorative="decorative"
      :class="stylex.props(styles.line, styles.lineVertical).className"
    />
    <template v-else>
      <Separator
        orientation="horizontal"
        :decorative="decorative"
        :class="stylex.props(styles.line).className"
      />
      <span v-if="label || $slots.default" :class="stylex.props(styles.label).className">
        <slot>{{ label }}</slot>
      </span>
      <Separator
        v-if="label || $slots.default"
        orientation="horizontal"
        :decorative="decorative"
        :class="stylex.props(styles.line).className"
      />
    </template>
  </div>
</template>
