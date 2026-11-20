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
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { darkTheme } from '../../theme/tokens.stylex'
import { focus } from '../../theme/shared.stylex'
import { styles } from './ScreenPagination.styles'
import type { ScreenPaginationProps } from './types'

// `v-model:page` arrives as `page` plus an `onUpdate:page` listener in `$attrs`.
// Forward attrs untouched: ui-sdk treats any attached `onUpdate:*` as a
// controller, so this wrapper must not add its own.
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<ScreenPaginationProps>(), {
  page: undefined,
  defaultPage: undefined,
  pageCount: undefined,
  total: undefined,
  pageSize: 10,
  siblings: 1,
  boundaries: 1,
  label: '分页',
  prevLabel: '上一页',
  nextLabel: '下一页',
  firstLabel: '第一页',
  lastLabel: '最后一页',
  showEdges: false,
  size: 'md',
  hideSummary: false,
})

const summaryFormat = new Intl.NumberFormat('en-US')

const rootSx = computed(() => stylex.props(darkTheme, styles.root))
const listSx = computed(() => stylex.props(styles.list))
const itemSx = computed(() => stylex.props(styles.item))
const linkSx = computed(() =>
  stylex.props(styles.link, focus.subtle, props.size === 'lg' && styles.lgLink),
)
const stepSx = computed(() =>
  stylex.props(styles.step, focus.subtle, props.size === 'lg' && styles.lgStep),
)
const ellipsisSx = computed(() =>
  stylex.props(styles.ellipsis, props.size === 'lg' && styles.lgEllipsis),
)

function summaryText(state: { page: number; pageCount: number }): string {
  if (props.total === undefined) return `第 ${state.page} / ${state.pageCount} 页`
  const size =
    Number.isFinite(props.pageSize) && props.pageSize > 0 ? props.pageSize : 10
  const from = (state.page - 1) * size + 1
  const to = Math.min(props.total, state.page * size)
  const range = props.total === 0 ? '0' : `${summaryFormat.format(from)}–${summaryFormat.format(to)}`
  return `共 ${summaryFormat.format(props.total)} 条 · ${range}`
}
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
    :aria-label="label"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <template #default="{ state }">
      <span v-if="!hideSummary" :class="stylex.props(styles.summary).className">
        {{ summaryText(state) }}
      </span>
      <PaginationList :class="listSx.className" :style="listSx.style">
        <PaginationItem v-if="showEdges" :class="itemSx.className" :style="itemSx.style">
          <PaginationFirst :aria-label="firstLabel" :class="stepSx.className" :style="stepSx.style">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M6 6v12M18 6l-6 6 6 6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </PaginationFirst>
        </PaginationItem>
        <PaginationItem :class="itemSx.className" :style="itemSx.style">
          <PaginationPrevious :aria-label="prevLabel" :class="stepSx.className" :style="stepSx.style">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M15 6l-6 6 6 6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </PaginationPrevious>
        </PaginationItem>
        <PaginationItem
          v-for="(entry, index) in state.items"
          :key="`${index}-${entry}`"
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
            <span aria-hidden="true">…</span>
          </PaginationEllipsis>
        </PaginationItem>
        <PaginationItem :class="itemSx.className" :style="itemSx.style">
          <PaginationNext :aria-label="nextLabel" :class="stepSx.className" :style="stepSx.style">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M9 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </PaginationNext>
        </PaginationItem>
        <PaginationItem v-if="showEdges" :class="itemSx.className" :style="itemSx.style">
          <PaginationLast :aria-label="lastLabel" :class="stepSx.className" :style="stepSx.style">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M6 6l6 6-6 6M18 6v12"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </PaginationLast>
        </PaginationItem>
      </PaginationList>
    </template>
  </Pagination>
</template>
