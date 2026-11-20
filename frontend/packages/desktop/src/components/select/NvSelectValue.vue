<script setup lang="ts">
import { SelectValue } from '@ui-sdk/vue/select'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Select.styles'
import type { NvSelectValueProps } from './types'

defineOptions({ inheritAttrs: false })

defineProps<NvSelectValueProps>()

const sx = computed(() => stylex.props(styles.value))
</script>

<template>
  <SelectValue
    v-bind="$attrs"
    :placeholder="placeholder"
    :max-labels="maxLabels"
    :class="[sx.className]"
    :style="[sx.style]"
  />
</template>
