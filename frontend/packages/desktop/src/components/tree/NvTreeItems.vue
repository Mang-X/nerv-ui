<script setup lang="ts">
import NvIcon from '../../theme/NvIcon.vue'
import { TreeGroup, TreeItem, TreeItemIndicator, TreeItemLabel } from '@ui-sdk/vue/tree'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Tree.styles'
import type { NvTreeItem } from './types'

defineOptions({ name: 'NvTreeItems' })

defineProps<{ items: NvTreeItem[] }>()

defineSlots<{
  label?: (props: { item: NvTreeItem }) => unknown
}>()

const itemSx = computed(() => stylex.props(styles.item))
const labelSx = computed(() => stylex.props(styles.label))
const indicatorSx = computed(() => stylex.props(styles.indicator))
const textSx = computed(() => stylex.props(styles.text))
const groupSx = computed(() => stylex.props(styles.group))
</script>

<template>
  <TreeItem
    v-for="item in items"
    :key="item.value"
    :value="item.value"
    :label="item.label"
    :disabled="item.disabled"
    :class="itemSx.className"
    :style="itemSx.style"
  >
    <TreeItemLabel :class="labelSx.className" :style="labelSx.style">
      <slot name="label" :item="item">
        <TreeItemIndicator
          v-if="item.children?.length"
          :class="indicatorSx.className"
          :style="indicatorSx.style"
        >
          <NvIcon name="chevron-right" :size="14" />
        </TreeItemIndicator>
        <span :class="textSx.className" :style="textSx.style">{{ item.label }}</span>
      </slot>
    </TreeItemLabel>
    <TreeGroup v-if="item.children?.length" :class="groupSx.className" :style="groupSx.style">
      <NvTreeItems v-if="$slots.label" :items="item.children">
        <template #label="slotProps">
          <slot name="label" v-bind="slotProps" />
        </template>
      </NvTreeItems>
      <NvTreeItems v-else :items="item.children" />
    </TreeGroup>
  </TreeItem>
</template>
