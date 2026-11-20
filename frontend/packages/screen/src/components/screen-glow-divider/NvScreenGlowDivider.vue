<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './GlowDivider.styles'

/**
 * 大屏分隔线：一条渐变细线加中点亮斑，可选的流光沿线条滑动。
 * 纯装饰，没有交互也没有代理动作。
 */
const props = withDefaults(defineProps<{ flow?: boolean }>(), { flow: true })

const rootSx = computed(() => stylex.props(styles.root))
const dotSx = computed(() => stylex.props(styles.dot))
const sheenSx = computed(() => stylex.props(styles.sheen))
</script>

<template>
  <div :class="rootSx.className" :style="rootSx.style" role="separator" aria-hidden="true">
    <span :class="dotSx.className" :style="dotSx.style" />
    <span v-if="props.flow" :class="sheenSx.className" :style="sheenSx.style" />
  </div>
</template>
