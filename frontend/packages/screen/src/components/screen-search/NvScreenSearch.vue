<script setup lang="ts">
import { Input, InputClear, InputGroup } from '@ui-sdk/vue/input'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Search.styles'

/**
 * 大屏搜索框。行为交给 `@ui-sdk/vue/input`（受控/非受控、清空、原生 type=search），
 * 外观用 StyleX。搜索图标只是装饰，`aria-hidden`。
 */
const props = withDefaults(
  defineProps<{
    placeholder?: string
    disabled?: boolean
    /**
     * 输入框的无障碍名称。大屏上常常没有可见标签，所以默认用 placeholder 顶上，
     * 但调用方仍应尽量显式给一个不随占位符变化的稳定名字。
     */
    label?: string
  }>(),
  { placeholder: '搜索工单号 / 产线 / 设备', disabled: false },
)

defineOptions({ inheritAttrs: false })

const groupSx = computed(() => stylex.props(styles.root))
const fieldSx = computed(() => stylex.props(styles.field))
const iconSx = computed(() => stylex.props(styles.icon))
const clearSx = computed(() => stylex.props(styles.clear))
</script>

<template>
  <InputGroup
    v-bind="$attrs"
    :class="[groupSx.className, $attrs.class]"
    :style="[groupSx.style, $attrs.style]"
  >
    <span :class="iconSx.className" :style="iconSx.style" aria-hidden="true">
      <NvIcon name="search" :size="16" />
    </span>
    <Input
      v-bind="omitClassStyle($attrs)"
      type="search"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :aria-label="props.label ?? props.placeholder"
      :class="fieldSx.className"
      :style="fieldSx.style"
    />
    <InputClear
      :class="clearSx.className"
      :style="clearSx.style"
      :aria-label="`清空${props.label ?? props.placeholder}`"
    >
      <NvIcon name="x" :size="14" />
    </InputClear>
  </InputGroup>
</template>
