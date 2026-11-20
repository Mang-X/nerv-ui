<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { styles } from './Cell.styles'

defineProps<{
  title?: string
}>()
</script>

<template>
  <div :class="stylex.props(styles.group).className">
    <div v-if="title || $slots.title" :class="stylex.props(styles.groupTitle).className">
      <slot name="title">{{ title }}</slot>
    </div>
    <div :class="stylex.props(styles.groupBody).className">
      <slot />
    </div>
  </div>
</template>
