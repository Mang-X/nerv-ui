<script setup lang="ts">
import { Tree } from '@ui-sdk/vue/tree'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Tree.styles'
import NvTreeItems from './NvTreeItems.vue'
import type { NvTreeProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvTreeProps>(), {
  mode: undefined,
  value: undefined,
  defaultValue: undefined,
  expanded: undefined,
  defaultExpanded: undefined,
  activation: undefined,
  expandOnPress: undefined,
  current: undefined,
  disabled: false,
  focusableWhenDisabled: undefined,
  keepMounted: undefined,
  hiddenUntilFound: undefined,
  controller: undefined,
})

const sx = computed(() => stylex.props(styles.root))
</script>

<template>
  <Tree
    v-bind="omitClassStyle($attrs)"
    :items="items"
    :mode="mode"
    :value="value"
    :default-value="defaultValue"
    :expanded="expanded"
    :default-expanded="defaultExpanded"
    :activation="activation"
    :expand-on-press="expandOnPress"
    :current="current"
    :disabled="disabled"
    :focusable-when-disabled="focusableWhenDisabled"
    :keep-mounted="keepMounted"
    :hidden-until-found="hiddenUntilFound"
    :controller="controller"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <NvTreeItems v-if="$slots.label" :items="items">
      <template #label="slotProps">
        <slot name="label" v-bind="slotProps" />
      </template>
    </NvTreeItems>
    <NvTreeItems v-else :items="items" />
  </Tree>
</template>
