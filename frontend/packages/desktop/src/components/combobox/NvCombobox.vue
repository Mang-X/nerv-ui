<script setup lang="ts">
import {
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemText,
  ComboboxList,
  ComboboxStatus,
  ComboboxTrigger,
} from '@ui-sdk/vue/combobox'
import { useAsyncOptions } from '@ui-sdk/vue/async-options'
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { focus, glass, presence } from '../../theme/shared.stylex'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Combobox.styles'
import type { NvComboboxItem, NvComboboxProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvComboboxProps>(), {
  placeholder: '搜索…',
  ariaLabel: '搜索选项',
  clearable: false,
  clearLabel: '清除',
  triggerLabel: '展开选项',
  emptyText: '无匹配选项',
  loadingText: '搜索中…',
  showTrigger: true,
})

// Async mode keeps the query controlled on our side and lets the loader own
// filtering; sync mode forwards the caller's query/items untouched.
const asyncQuery = ref(props.defaultQuery ?? '')
const asyncApi = useAsyncOptions<NvComboboxItem>(
  (query, context) => (props.loadOptions ? props.loadOptions(query, context) : Promise.resolve([])),
  {
    debounce: props.debounce,
    query: asyncQuery.value,
    immediate: Boolean(props.loadOptions) && props.loadOnMount !== false,
  },
)

function onAsyncQuery(query: string) {
  asyncQuery.value = query
  asyncApi.setQuery(query)
}

const comboboxBindings = computed<Record<string, unknown>>(() => {
  const asyncMode = Boolean(props.loadOptions)
  const state = asyncApi.state.value
  const bindings: Record<string, unknown> = {
    value: props.value,
    defaultValue: props.defaultValue,
    multiple: props.multiple,
    maxSelected: props.maxSelected,
    open: props.open,
    defaultOpen: props.defaultOpen,
    query: asyncMode ? asyncQuery.value : props.query,
    defaultQuery: asyncMode ? undefined : props.defaultQuery,
    items: asyncMode ? state.items : props.items,
    filter: asyncMode ? false : props.filter,
    status: asyncMode ? state.status : undefined,
    autoHighlight: props.autoHighlight,
    allowCustomValue: props.allowCustomValue,
    loop: props.loop,
    disabled: props.disabled,
    readOnly: props.readOnly,
    required: props.required,
    name: props.name,
    form: props.form,
  }
  if (asyncMode) {
    bindings.onQueryChange = onAsyncQuery
    bindings.onLoadMore = () => asyncApi.loadMore()
  }
  return bindings
})

const fieldSx = computed(() => stylex.props(styles.field, focus.ring))
const iconSx = computed(() => stylex.props(styles.icon))
const inputSx = computed(() => stylex.props(styles.input))
const triggerSx = computed(() => stylex.props(styles.trigger, focus.ring))
const clearSx = computed(() => stylex.props(styles.clear, focus.subtle))
const contentSx = computed(() => stylex.props(glass.surface, styles.content, presence.fadeZoom))
const statusSx = computed(() => stylex.props(styles.status))
const emptySx = computed(() => stylex.props(styles.empty))
const listSx = computed(() => stylex.props(styles.list))
const itemSx = computed(() => stylex.props(styles.item, focus.subtle))
const itemTextSx = computed(() => stylex.props(styles.itemText))
const indicatorSx = computed(() => stylex.props(styles.indicator))

/** Data items arrive as `ListData`; the wrapper only accepts flat items. */
function visibleItems(items: unknown): NvComboboxItem[] {
  return Array.isArray(items) ? (items as NvComboboxItem[]) : []
}
</script>

<template>
  <Combobox v-bind="{ ...omitClassStyle($attrs), ...comboboxBindings }">
    <div :class="[fieldSx.className, $attrs.class]" :style="[fieldSx.style, $attrs.style]">
      <SearchIcon
        :size="16"
        aria-hidden="true"
        :class="iconSx.className"
        :style="iconSx.style"
      />
      <ComboboxInput
        :aria-label="ariaLabel"
        :placeholder="placeholder"
        :class="inputSx.className"
        :style="inputSx.style"
      />
      <ComboboxClear
        v-if="clearable"
        :aria-label="clearLabel"
        :class="clearSx.className"
        :style="clearSx.style"
      >
        <XIcon :size="14" aria-hidden="true" />
      </ComboboxClear>
      <ComboboxTrigger
        v-if="showTrigger"
        :aria-label="triggerLabel"
        :class="triggerSx.className"
        :style="triggerSx.style"
      >
        <ChevronDownIcon :size="16" aria-hidden="true" />
      </ComboboxTrigger>
    </div>
    <ComboboxContent
      align="start"
      :side-offset="6"
      :class="contentSx.className"
      :style="contentSx.style"
    >
      <ComboboxStatus v-if="loadOptions" :class="statusSx.className" :style="statusSx.style">
        <template #default="{ state }">
          <span v-if="state.status === 'error'">加载失败</span>
          <span v-else-if="state.loading">{{ loadingText }}</span>
        </template>
      </ComboboxStatus>
      <ComboboxEmpty :class="emptySx.className" :style="emptySx.style">
        <template #default="{ state }">
          <span v-if="state.empty && !state.loading">{{ emptyText }}</span>
        </template>
      </ComboboxEmpty>
      <ComboboxList v-slot="{ state }" :class="listSx.className" :style="listSx.style">
        <ComboboxItem
          v-for="item in visibleItems(state.items)"
          :key="item.value"
          :value="item.value"
          :label="item.label"
          :keywords="item.keywords"
          :disabled="item.disabled"
          :class="itemSx.className"
          :style="itemSx.style"
        >
          <ComboboxItemText :class="itemTextSx.className" :style="itemTextSx.style">
            {{ item.label }}
          </ComboboxItemText>
          <ComboboxItemIndicator :class="indicatorSx.className" :style="indicatorSx.style">
            <CheckIcon :size="14" aria-hidden="true" />
          </ComboboxItemIndicator>
        </ComboboxItem>
      </ComboboxList>
    </ComboboxContent>
  </Combobox>
</template>
