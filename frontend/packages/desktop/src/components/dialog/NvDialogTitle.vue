<script setup lang="ts">
import { DialogTitle } from '@ui-sdk/vue/dialog'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Dialog.styles'

defineOptions({ inheritAttrs: false })

const sx = computed(() => stylex.props(styles.title))
</script>

<template>
  <DialogTitle v-bind="$attrs" :class="[sx.className]" :style="[sx.style]">
    <slot />
  </DialogTitle>
</template>
