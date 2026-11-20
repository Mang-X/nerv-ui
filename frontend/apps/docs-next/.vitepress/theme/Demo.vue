<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { styles } from './demo.styles'

withDefaults(defineProps<{ block?: boolean }>(), { block: false })

const root = stylex.props(styles.root)
const stage = stylex.props(styles.stage)
const stageBlock = stylex.props(styles.stageBlock)
</script>

<template>
  <div :class="[root.className, 'nv-demo']" :style="root.style">
    <div
      :class="[stage.className, 'nv-demo-stage', block && stageBlock.className]"
      :style="stage.style"
    >
      <slot />
    </div>
  </div>
</template>
