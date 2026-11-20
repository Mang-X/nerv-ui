<script setup lang="ts">
import { AlertDialogDescription } from '@ui-sdk/vue/alert-dialog'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles as dialogStyles } from '../dialog/Dialog.styles'

defineOptions({ inheritAttrs: false })

const sx = computed(() => stylex.props(dialogStyles.description))
</script>

<template>
  <AlertDialogDescription v-bind="$attrs" :class="[sx.className]" :style="[sx.style]">
    <slot />
  </AlertDialogDescription>
</template>
