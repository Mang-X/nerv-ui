<script setup lang="ts">
import { DrawerDescription } from '@ui-sdk/vue/drawer'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles as dialogStyles } from '../dialog/Dialog.styles'

defineOptions({ inheritAttrs: false })

const sx = computed(() => stylex.props(dialogStyles.description))
</script>

<template>
  <DrawerDescription v-bind="$attrs" :class="[sx.className]" :style="[sx.style]">
    <slot />
  </DrawerDescription>
</template>
