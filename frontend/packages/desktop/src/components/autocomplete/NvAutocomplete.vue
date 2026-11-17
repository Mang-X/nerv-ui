<script setup lang="ts">
import {
  Autocomplete,
  AutocompleteClear,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteItemText,
  AutocompleteList,
} from '@ui-sdk/vue/autocomplete'
import { SearchIcon, XIcon } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus, glass, presence } from '../../theme/shared.stylex'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Autocomplete.styles'
import type { NvAutocompleteProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvAutocompleteProps>(), {
  placeholder: '输入以联想…',
  ariaLabel: '联想输入',
  clearable: false,
  clearLabel: '清除',
  emptyText: '无匹配建议',
  // Boolean props omitted by the caller must stay undefined so ui-sdk keeps
  // its own uncontrolled state; passing false would control `open` et al.
  open: undefined,
  inlineComplete: undefined,
  autoHighlight: undefined,
  openOnFocus: undefined,
  submitOnSelect: undefined,
  disabled: undefined,
  readOnly: undefined,
  required: undefined,
  // `filter` is typed as `... | false`; Vue otherwise resolves an omitted
  // Boolean-union prop to `false`, which would disable filtering entirely.
  filter: undefined,
})

const fieldSx = computed(() => stylex.props(styles.field, focus.ring))
const iconSx = computed(() => stylex.props(styles.icon))
const inputSx = computed(() => stylex.props(styles.input))
const clearSx = computed(() => stylex.props(styles.clear, focus.subtle))
const contentSx = computed(() => stylex.props(glass.surface, styles.content, presence.fadeZoom))
const emptySx = computed(() => stylex.props(styles.empty))
const listSx = computed(() => stylex.props(styles.list))
const itemSx = computed(() => stylex.props(styles.item, focus.subtle))
const itemTextSx = computed(() => stylex.props(styles.itemText))

/** The list hands back filtered suggestion data; the wrapper deals in strings. */
function visibleItems(items: unknown): string[] {
  return Array.isArray(items) ? (items as string[]) : []
}
</script>

<template>
  <Autocomplete
    v-bind="omitClassStyle($attrs)"
    :value="value"
    :default-value="defaultValue"
    :open="open"
    :default-open="defaultOpen"
    :items="items"
    :filter="filter"
    :inline-complete="inlineComplete"
    :auto-highlight="autoHighlight"
    :open-on-focus="openOnFocus"
    :submit-on-select="submitOnSelect"
    :disabled="disabled"
    :read-only="readOnly"
    :required="required"
    :name="name"
    :form="form"
  >
    <div :class="[fieldSx.className, $attrs.class]" :style="[fieldSx.style, $attrs.style]">
      <SearchIcon
        :size="16"
        aria-hidden="true"
        :class="iconSx.className"
        :style="iconSx.style"
      />
      <AutocompleteInput
        :aria-label="ariaLabel"
        :placeholder="placeholder"
        :class="inputSx.className"
        :style="inputSx.style"
      />
      <AutocompleteClear
        v-if="clearable"
        :aria-label="clearLabel"
        :class="clearSx.className"
        :style="clearSx.style"
      >
        <XIcon :size="14" aria-hidden="true" />
      </AutocompleteClear>
    </div>
    <AutocompleteContent
      align="start"
      :side-offset="6"
      :class="contentSx.className"
      :style="contentSx.style"
    >
      <AutocompleteEmpty :class="emptySx.className" :style="emptySx.style">
        <template #default="{ state }">
          <span v-if="state.empty">{{ emptyText }}</span>
        </template>
      </AutocompleteEmpty>
      <AutocompleteList
        v-slot="{ state }"
        :class="listSx.className"
        :style="listSx.style"
      >
        <AutocompleteItem
          v-for="item in visibleItems(state.items)"
          :key="item"
          :value="item"
          :class="itemSx.className"
          :style="itemSx.style"
        >
          <AutocompleteItemText :class="itemTextSx.className" :style="itemTextSx.style">
            {{ item }}
          </AutocompleteItemText>
        </AutocompleteItem>
      </AutocompleteList>
    </AutocompleteContent>
  </Autocomplete>
</template>
