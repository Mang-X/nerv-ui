<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './TitleBar.styles'

/**
 * 大屏分区标题：居中标题加短下划线与两侧渐变细线，细线内端各有一个菱形节点。
 * 纯展示，不进代理桥。
 */
const props = withDefaults(defineProps<{ title?: string; sub?: string }>(), {
  title: '产线综合监控',
})

const sx = computed(() => ({
  root: stylex.props(styles.root),
  left: stylex.props(styles.ruleLeft),
  right: stylex.props(styles.ruleRight),
  nodeL: stylex.props(styles.node, styles.nodeLeft),
  nodeR: stylex.props(styles.node, styles.nodeRight),
  mid: stylex.props(styles.mid),
  title: stylex.props(styles.title),
  sub: stylex.props(styles.sub),
  underline: stylex.props(styles.underline),
}))
</script>

<template>
  <div :class="sx.root.className" :style="sx.root.style">
    <span :class="sx.left.className" :style="sx.left.style">
      <i :class="sx.nodeL.className" :style="sx.nodeL.style" />
    </span>
    <div :class="sx.mid.className" :style="sx.mid.style">
      <h2 :class="sx.title.className" :style="sx.title.style">{{ props.title }}</h2>
      <p v-if="props.sub" :class="sx.sub.className" :style="sx.sub.style">{{ props.sub }}</p>
      <span :class="sx.underline.className" :style="sx.underline.style" />
    </div>
    <span :class="sx.right.className" :style="sx.right.style">
      <i :class="sx.nodeR.className" :style="sx.nodeR.style" />
    </span>
  </div>
</template>
