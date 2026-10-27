<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, ref, watch } from 'vue'
import { XIcon } from '@lucide/vue'
import { cn } from '../../../lib/utils'
import NvEntityPicker from './NvEntityPicker.vue'
import type { EntityPickerOption } from './types'

/** 多选只管理选择与已见标签；搜索结果、请求时序和权限由宿主负责。 */
const props = withDefaults(
  defineProps<{
    modelValue: readonly string[]
    options: EntityPickerOption[]
    title: string
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    selectionEmptyText?: string
    loading?: boolean
    disabled?: boolean
    invalid?: boolean
    showCode?: boolean
    search?: string
    serverSearch?: boolean
    totalCount?: number
    id?: string
    ariaLabel?: string
    ariaDescribedby?: string
    class?: HTMLAttributes['class']
  }>(),
  {
    placeholder: '请选择',
    selectionEmptyText: '尚未选择',
    loading: false,
    disabled: false,
    invalid: false,
    showCode: true,
    serverSearch: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'update:search', value: string): void
  (e: 'load-more'): void
}>()

const selectedValues = computed(() => [
  ...new Set(props.modelValue.filter((value) => value !== '')),
])
const selectedSet = computed(() => new Set(selectedValues.value))

// 只保存仍被选中的标签。结果页消失时保留名称；同 key 的新结果更新名称；
// 宿主移除/替换值后清退缓存，之后再引入该 key 不会误用旧名称。
const labels = ref(new Map<string, string>())
watch(
  [() => props.modelValue, () => props.options],
  () => {
    const next = new Map<string, string>()
    for (const value of selectedValues.value) {
      const current = props.options.find((option) => option.value === value)
      const label = current?.label ?? labels.value.get(value)
      if (label !== undefined) next.set(value, label)
    }
    labels.value = next
  },
  { immediate: true, deep: true, flush: 'post' },
)

const selectedEntries = computed(() =>
  selectedValues.value.map((value) => ({ value, label: labels.value.get(value) ?? value })),
)
const availableOptions = computed(() => {
  const seen = new Set<string>()
  return props.options.filter((option) => {
    if (!option.value || selectedSet.value.has(option.value) || seen.has(option.value)) return false
    seen.add(option.value)
    return true
  })
})
const availableTotalCount = computed(() => {
  if (props.totalCount === undefined) return undefined
  const selectedOnPage = new Set(
    props.options
      .filter((option) => selectedSet.value.has(option.value))
      .map((option) => option.value),
  ).size
  return Math.max(availableOptions.value.length, props.totalCount - selectedOnPage)
})

function add(value: string) {
  if (props.disabled || !value || selectedSet.value.has(value)) return
  emit('update:modelValue', [...selectedValues.value, value])
}

function remove(value: string) {
  if (props.disabled) return
  emit(
    'update:modelValue',
    selectedValues.value.filter((selected) => selected !== value),
  )
}

function clear() {
  if (props.disabled || !selectedValues.value.length) return
  emit('update:modelValue', [])
}
</script>

<template>
  <div
    :class="cn('grid min-w-0 gap-2', props.class)"
    data-slot="nv-entity-multi-picker"
    :data-invalid="invalid || undefined"
  >
    <NvEntityPicker
      :id="id"
      model-value=""
      :options="availableOptions"
      :title="title"
      :placeholder="placeholder"
      :search-placeholder="searchPlaceholder"
      :empty-text="emptyText"
      :loading="loading"
      :disabled="disabled"
      :invalid="invalid"
      :show-code="showCode"
      :search="search"
      :server-search="serverSearch"
      :total-count="availableTotalCount"
      :aria-label="ariaLabel"
      :aria-describedby="ariaDescribedby"
      @update:model-value="add"
      @update:search="emit('update:search', $event)"
      @load-more="emit('load-more')"
    />
    <div
      v-if="selectedEntries.length"
      role="group"
      :aria-label="`${ariaLabel ?? title}已选项`"
      class="flex min-w-0 flex-wrap items-center gap-1.5"
    >
      <span
        v-for="entry in selectedEntries"
        :key="entry.value"
        class="inline-flex max-w-full min-w-0 items-center rounded-full border border-border bg-muted pl-3 text-xs text-foreground"
      >
        <span class="max-w-48 min-w-0 truncate" :title="entry.label">{{ entry.label }}</span>
        <button
          type="button"
          class="ml-1 flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          :aria-label="`移除 ${entry.label}`"
          :disabled="disabled"
          @click="remove(entry.value)"
        >
          <XIcon class="size-4" aria-hidden="true" />
        </button>
      </span>
      <button
        type="button"
        aria-label="清空已选"
        class="min-h-11 rounded-md px-2 text-xs text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        :disabled="disabled"
        @click="clear"
      >
        清空已选
      </button>
    </div>
    <p v-else class="text-xs text-muted-foreground">{{ selectionEmptyText }}</p>
  </div>
</template>
