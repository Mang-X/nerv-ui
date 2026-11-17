<script setup lang="ts">
import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from '@ui-sdk/vue/pagination'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  EllipsisIcon,
} from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Pagination.styles'
import type { NvPaginationProps } from './types'

// `v-model:page` arrives as the `page` prop plus an `onUpdate:page` listener in
// $attrs, which is forwarded untouched. ui-sdk treats every attached
// `onUpdate:*` listener as a controller, so the wrapper must not attach its own.
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvPaginationProps>(), {
  showEdges: false,
  label: '分页',
  prevLabel: '上一页',
  nextLabel: '下一页',
  firstLabel: '第一页',
  lastLabel: '最后一页',
  size: 'md',
})

const rootSx = computed(() => stylex.props(styles.root))
const listSx = computed(() => stylex.props(styles.list))
const itemSx = computed(() => stylex.props(styles.item))
const linkSx = computed(() =>
  stylex.props(styles.link, focus.subtle, props.size === 'sm' && styles.sm),
)
const stepSx = computed(() =>
  stylex.props(styles.step, focus.subtle, props.size === 'sm' && styles.smStep),
)
const ellipsisSx = computed(() => stylex.props(styles.ellipsis, props.size === 'sm' && styles.sm))
</script>

<template>
  <Pagination
    v-bind="$attrs"
    :page="page"
    :default-page="defaultPage"
    :page-count="pageCount"
    :total="total"
    :page-size="pageSize"
    :siblings="siblings"
    :boundaries="boundaries"
    :get-href="getHref"
    :aria-label="label"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <PaginationList v-slot="{ state }" :class="listSx.className" :style="listSx.style">
      <PaginationItem v-if="showEdges" :class="itemSx.className" :style="itemSx.style">
        <PaginationFirst :aria-label="firstLabel" :class="stepSx.className" :style="stepSx.style">
          <ChevronsLeftIcon :size="16" aria-hidden="true" />
        </PaginationFirst>
      </PaginationItem>
      <PaginationItem :class="itemSx.className" :style="itemSx.style">
        <PaginationPrevious :aria-label="prevLabel" :class="stepSx.className" :style="stepSx.style">
          <ChevronLeftIcon :size="16" aria-hidden="true" />
        </PaginationPrevious>
      </PaginationItem>
      <PaginationItem
        v-for="entry in state.items"
        :key="entry"
        :class="itemSx.className"
        :style="itemSx.style"
      >
        <PaginationLink
          v-if="typeof entry === 'number'"
          :page="entry"
          :class="linkSx.className"
          :style="linkSx.style"
        />
        <PaginationEllipsis v-else :class="ellipsisSx.className" :style="ellipsisSx.style">
          <EllipsisIcon :size="16" aria-hidden="true" />
        </PaginationEllipsis>
      </PaginationItem>
      <PaginationItem :class="itemSx.className" :style="itemSx.style">
        <PaginationNext :aria-label="nextLabel" :class="stepSx.className" :style="stepSx.style">
          <ChevronRightIcon :size="16" aria-hidden="true" />
        </PaginationNext>
      </PaginationItem>
      <PaginationItem v-if="showEdges" :class="itemSx.className" :style="itemSx.style">
        <PaginationLast :aria-label="lastLabel" :class="stepSx.className" :style="stepSx.style">
          <ChevronsRightIcon :size="16" aria-hidden="true" />
        </PaginationLast>
      </PaginationItem>
    </PaginationList>
  </Pagination>
</template>
