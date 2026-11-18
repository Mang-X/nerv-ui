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
import NvIcon from '../../theme/NvIcon.vue'
import NvButton from '../button/NvButton.vue'
import NvInput from '../input/NvInput.vue'
import NvSelect from '../select/NvSelect.vue'
import NvSelectTrigger from '../select/NvSelectTrigger.vue'
import NvSelectValue from '../select/NvSelectValue.vue'
import NvSelectContent from '../select/NvSelectContent.vue'
import NvSelectItem from '../select/NvSelectItem.vue'
import * as stylex from '@stylexjs/stylex'
import { computed, ref, watch } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Pagination.styles'
import type { NvPaginationProps } from './types'

// `v-model:page` arrives as the `page` prop plus an `onUpdate:page` listener in
// $attrs, which is forwarded untouched. ui-sdk treats every attached
// `onUpdate:*` listener as a controller, so the wrapper must not attach its own.
defineOptions({ inheritAttrs: false })

const emit = defineEmits<{
  'update:page': [page: number]
  pageSizeChange: [size: number, page: number]
}>()

const props = withDefaults(defineProps<NvPaginationProps>(), {
  showEdges: false,
  label: '分页',
  prevLabel: '上一页',
  nextLabel: '下一页',
  firstLabel: '第一页',
  lastLabel: '最后一页',
  size: 'md',
  disabled: false,
  hideOnSinglePage: false,
  showTotal: false,
  sizeCanChange: false,
  sizeOptions: () => [10, 20, 50, 100],
  pageSizeChangeResetPage: true,
  showJumper: false,
  simple: false,
  simpleJumper: true,
  jumpLabel: '跳至页码',
  pageSizeLabel: '每页条数',
  totalLabel: '总条数',
})

/**
 * 分页器的「页码事实」在这里统一推导一次：total/pageSize 与 pageCount 两种入参
 * 形式都要能算出总页数，右侧的「共 N 条 / 每页 N 条 / 跳至 N 页」才有依据。
 */
const effectivePageSize = computed(() => Math.max(1, props.pageSize ?? 10))
const pageCountValue = computed(() => {
  if (props.pageCount !== undefined) return Math.max(1, Math.floor(props.pageCount))
  const total = Math.max(0, props.total ?? 0)
  return Math.max(1, Math.ceil(total / effectivePageSize.value))
})
const currentPage = ref(props.page ?? props.defaultPage ?? 1)
watch(
  () => props.page,
  (next) => {
    if (next !== undefined) currentPage.value = next
  },
)
const goTo = (page: number) => emit('update:page', clampPage(page))

function clampPage(page: number) {
  if (!Number.isFinite(page)) return currentPage.value
  return Math.min(Math.max(1, Math.floor(page)), pageCountValue.value)
}

const totalRange = computed(() => {
  if (props.total === undefined || props.total <= 0) return { from: 0, to: 0 }
  const size = effectivePageSize.value
  const from = (currentPage.value - 1) * size + 1
  const to = Math.min(currentPage.value * size, props.total)
  return { from, to }
})
const totalText = computed(() => {
  const args = {
    total: props.total ?? 0,
    ...totalRange.value,
    page: currentPage.value,
    pageCount: pageCountValue.value,
  }
  if (typeof props.showTotal === 'function') return props.showTotal(args)
  return `共 ${args.total} 条`
})

const sizeList = computed(() => {
  if (Array.isArray(props.sizeCanChange)) return props.sizeCanChange
  return props.sizeOptions
})

const showPages = computed(() => pageCountValue.value > 1)
const hidden = computed(() => props.hideOnSinglePage && !showPages.value)

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
const auxSx = computed(() => stylex.props(styles.aux))
const auxTextSx = computed(() => stylex.props(styles.auxText))
const sizeSelectSx = computed(() =>
  stylex.props(styles.sizeSelect, props.size === 'sm' && styles.sizeSelectSm),
)
const jumperSx = computed(() =>
  stylex.props(styles.jumperInput, props.size === 'sm' && styles.jumperInputSm),
)
const simpleShellSx = computed(() => stylex.props(styles.simpleShell))
const simpleTextSx = computed(() => stylex.props(styles.simpleText))

/** 跳页输入框：回车或失焦时提交，非法值回退到当前页。 */
const jumperValue = ref('')
const jumperEditing = ref(false)

function commitJumper(value: string | number) {
  const next = clampPage(Number(value))
  if (next !== currentPage.value) goTo(next)
  jumperValue.value = ''
}

function onJumperKey(event: KeyboardEvent) {
  if (event.key !== 'Enter') return
  commitJumper((event.target as HTMLInputElement).value)
}

function onSizeChange(value: unknown) {
  const next = Number(value)
  if (!Number.isFinite(next) || next <= 0) return
  emit('pageSizeChange', next, props.pageSizeChangeResetPage ? 1 : currentPage.value)
}

/** 精简模式：点页码切到输入，回车/失焦提交。 */
function toggleSimpleJumper() {
  if (!props.simpleJumper) return
  jumperEditing.value = true
  jumperValue.value = String(currentPage.value)
}
</script>

<template>
  <div
    v-if="hidden"
    style="display: none"
    aria-hidden="true"
  />
  <div
    v-else-if="simple"
    :class="simpleShellSx.className"
    :style="simpleShellSx.style"
    role="group"
    :aria-label="label"
  >
    <NvButton
      variant="ghost"
      size="sm"
      :aria-label="prevLabel"
      :disabled="currentPage <= 1"
      @click="goTo(currentPage - 1)"
    >
      <NvIcon name="chevron-left" :size="16" />
    </NvButton>
    <NvInput
      v-if="jumperEditing"
      :model-value="jumperValue"
      size="sm"
      :aria-label="jumpLabel"
      style="width: 56px"
      @update:model-value="jumperValue = $event"
      @keydown="onJumperKey"
      @blur="commitJumper(jumperValue); jumperEditing = false"
    />
    <NvButton
      v-else
      variant="ghost"
      size="sm"
      :class="simpleTextSx.className"
      :style="simpleTextSx.style"
      :aria-label="`当前第 ${currentPage} 页，共 ${pageCountValue} 页`"
      @click="toggleSimpleJumper"
    >
      {{ currentPage }} / {{ pageCountValue }}
    </NvButton>
    <NvButton
      variant="ghost"
      size="sm"
      :aria-label="nextLabel"
      :disabled="currentPage >= pageCountValue"
      @click="goTo(currentPage + 1)"
    >
      <NvIcon name="chevron-right" :size="16" />
    </NvButton>
  </div>
  <Pagination
    v-bind="$attrs"
    :page="currentPage"
    :disabled="disabled"
    @update:page="(next: number | null) => { if (next) goTo(next) }"
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
          <NvIcon name="chevrons-left" :size="16" />
        </PaginationFirst>
      </PaginationItem>
      <PaginationItem :class="itemSx.className" :style="itemSx.style">
        <PaginationPrevious :aria-label="prevLabel" :class="stepSx.className" :style="stepSx.style">
          <NvIcon name="chevron-left" :size="16" />
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
          <NvIcon name="more-horizontal" :size="16" />
        </PaginationEllipsis>
      </PaginationItem>
      <PaginationItem :class="itemSx.className" :style="itemSx.style">
        <PaginationNext :aria-label="nextLabel" :class="stepSx.className" :style="stepSx.style">
          <NvIcon name="chevron-right" :size="16" />
        </PaginationNext>
      </PaginationItem>
      <PaginationItem v-if="showEdges" :class="itemSx.className" :style="itemSx.style">
        <PaginationLast :aria-label="lastLabel" :class="stepSx.className" :style="stepSx.style">
          <NvIcon name="chevrons-right" :size="16" />
        </PaginationLast>
      </PaginationItem>
    </PaginationList>

    <div v-if="showTotal || sizeCanChange || showJumper" :class="auxSx.className" :style="auxSx.style">
      <span v-if="showTotal" :class="auxTextSx.className" :style="auxTextSx.style">
        {{ totalText }}
      </span>
      <NvSelect
        v-if="sizeCanChange"
        :model-value="String(effectivePageSize)"
        :aria-label="pageSizeLabel"
        :disabled="disabled"
        @update:model-value="onSizeChange"
      >
        <NvSelectTrigger :class="sizeSelectSx.className" :style="sizeSelectSx.style">
          <NvSelectValue />
        </NvSelectTrigger>
        <NvSelectContent>
          <NvSelectItem v-for="option in sizeList" :key="option" :value="String(option)">
            {{ option }} 条/页
          </NvSelectItem>
        </NvSelectContent>
      </NvSelect>
      <span v-if="showJumper" :class="auxTextSx.className" :style="auxTextSx.style">跳至</span>
      <NvInput
        v-if="showJumper"
        :class="jumperSx.className"
        :style="jumperSx.style"
        size="sm"
        :aria-label="jumpLabel"
        :disabled="disabled"
        @keydown="onJumperKey"
        @blur="commitJumper(jumperValue)"
        @update:model-value="jumperValue = $event"
      />
    </div>
  </Pagination>
</template>
