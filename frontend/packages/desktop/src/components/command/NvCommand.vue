<script setup lang="ts">
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemText,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@ui-sdk/vue/command'
import { SearchIcon } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus, glass } from '../../theme/shared.stylex'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Command.styles'
import type { NvCommandEntry, NvCommandGroup, NvCommandProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvCommandProps>(), {
  placeholder: '输入命令或搜索…',
  ariaLabel: '搜索命令',
  emptyText: '没有匹配的命令',
  autoHighlight: true,
  loop: true,
})

const emit = defineEmits<{ action: [value: string] }>()

const panelSx = computed(() => stylex.props(glass.surface, styles.panel))
const inputRowSx = computed(() => stylex.props(styles.inputRow, focus.ring))
const searchIconSx = computed(() => stylex.props(styles.searchIcon))
const inputSx = computed(() => stylex.props(styles.input))
const listSx = computed(() => stylex.props(styles.list))
const emptySx = computed(() => stylex.props(styles.empty))
const groupLabelSx = computed(() => stylex.props(styles.groupLabel))
const itemSx = computed(() => stylex.props(styles.item, focus.subtle))
const itemTextSx = computed(() => stylex.props(styles.itemText))
const shortcutSx = computed(() => stylex.props(styles.shortcut))
const separatorSx = computed(() => stylex.props(styles.separator))

function isGroup(entry: NvCommandEntry): entry is NvCommandGroup {
  return 'items' in entry
}

function onAction(value: string) {
  emit('action', value)
}
</script>

<template>
  <Command
    v-bind="omitClassStyle($attrs)"
    :value="value"
    :default-value="defaultValue"
    :query="query"
    :default-query="defaultQuery"
    :filter="filter"
    :auto-highlight="autoHighlight"
    :loop="loop"
    @action="onAction"
    :class="[panelSx.className, $attrs.class]"
    :style="[panelSx.style, $attrs.style]"
  >
    <div :class="inputRowSx.className" :style="inputRowSx.style">
      <SearchIcon
        :size="16"
        aria-hidden="true"
        :class="searchIconSx.className"
        :style="searchIconSx.style"
      />
      <CommandInput
        :aria-label="ariaLabel"
        :placeholder="placeholder"
        :class="inputSx.className"
        :style="inputSx.style"
      />
    </div>
    <CommandEmpty :class="emptySx.className" :style="emptySx.style">
      {{ emptyText }}
    </CommandEmpty>
    <CommandList :class="listSx.className" :style="listSx.style">
      <template v-for="(entry, index) in items ?? []" :key="isGroup(entry) ? `g-${index}` : entry.value">
        <template v-if="isGroup(entry)">
          <CommandGroup>
            <CommandGroupLabel
              v-if="entry.label"
              :class="groupLabelSx.className"
              :style="groupLabelSx.style"
            >
              {{ entry.label }}
            </CommandGroupLabel>
            <CommandItem
              v-for="item in entry.items"
              :key="item.value"
              :value="item.value"
              :label="item.label"
              :keywords="item.keywords"
              :disabled="item.disabled"
              :shortcut="item.shortcut"
              :class="itemSx.className"
              :style="itemSx.style"
            >
              <CommandItemText :class="itemTextSx.className" :style="itemTextSx.style">
                {{ item.label }}
              </CommandItemText>
              <CommandShortcut
                v-if="item.shortcut"
                :class="shortcutSx.className"
                :style="shortcutSx.style"
              />
            </CommandItem>
          </CommandGroup>
          <CommandSeparator
            v-if="index < (items?.length ?? 0) - 1"
            :class="separatorSx.className"
            :style="separatorSx.style"
          />
        </template>
        <CommandItem
          v-else
          :value="entry.value"
          :label="entry.label"
          :keywords="entry.keywords"
          :disabled="entry.disabled"
          :shortcut="entry.shortcut"
          :class="itemSx.className"
          :style="itemSx.style"
        >
          <CommandItemText :class="itemTextSx.className" :style="itemTextSx.style">
            {{ entry.label }}
          </CommandItemText>
          <CommandShortcut
            v-if="entry.shortcut"
            :class="shortcutSx.className"
            :style="shortcutSx.style"
          />
        </CommandItem>
      </template>
    </CommandList>
  </Command>
</template>
