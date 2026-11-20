<script setup lang="ts">
import { Switch, SwitchThumb } from '@ui-sdk/vue/switch'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Switch.styles'

/**
 * 大屏开关。行为交给 `@ui-sdk/vue/switch`（`aria-checked`、键盘、受控/非受控、
 * 隐藏的原生 input），外观用 StyleX。开态同时改填充与手柄位置——不是只靠颜色。
 */
withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })

const rootSx = computed(() => stylex.props(styles.root))
const thumbSx = computed(() => stylex.props(styles.thumb))
</script>

<template>
  <Switch
    v-bind="$attrs"
    :disabled="disabled"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <SwitchThumb :class="thumbSx.className" :style="thumbSx.style" />
  </Switch>
</template>
