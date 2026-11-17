<script setup lang="ts">
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@ui-sdk/vue/dialog'
import * as stylex from '@stylexjs/stylex'
import { computed, ref, watch } from 'vue'
import { focus, glass, overlay } from '../../theme/shared.stylex'
import PickerWheel from './PickerWheel.vue'
import { styles } from './Picker.styles'
import type { MobilePickerColumn, MobilePickerProps, MobilePickerValue } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MobilePickerProps>(), {
  // Undefined, not false: keeps the ui-sdk dialog uncontrolled until the caller
  // opts in with v-model:open.
  open: undefined,
  defaultOpen: false,
  title: undefined,
  description: undefined,
  columns: () => [],
  modelValue: undefined,
  defaultValue: undefined,
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true,
  ariaLabel: '选择器',
  modal: true,
  dismissible: true,
  closeOnOutsidePress: true,
  triggerLabel: undefined,
})

const emit = defineEmits<{
  'update:open': [open: boolean]
  'open-change': [open: boolean]
  'update:modelValue': [value: MobilePickerValue[]]
  change: [value: MobilePickerValue[]]
  confirm: [value: MobilePickerValue[]]
  cancel: []
}>()

const draft = ref<MobilePickerValue[]>([])
const committed = ref<MobilePickerValue[] | null>(null)

function firstEnabled(column: MobilePickerColumn | undefined): MobilePickerValue | undefined {
  return column?.options.find((option) => !option.disabled)?.value
}

function resolveColumnValue(index: number): MobilePickerValue {
  const column = props.columns[index]
  const candidates = [
    props.modelValue?.[index],
    props.defaultValue?.[index],
    committed.value?.[index],
    column?.defaultValue,
    firstEnabled(column),
  ]
  for (const candidate of candidates) {
    if (candidate === undefined) continue
    if (column?.options.some((option) => option.value === candidate && !option.disabled)) {
      return candidate
    }
  }
  return column?.options[0]?.value ?? ''
}

function syncDraft() {
  draft.value = props.columns.map((_, index) => resolveColumnValue(index))
}

syncDraft()

watch(
  () => [props.modelValue, props.columns] as const,
  () => syncDraft(),
  { deep: true },
)

function onOpenChange(open: boolean) {
  if (open) syncDraft()
  emit('update:open', open)
  emit('open-change', open)
}

function onWheel(index: number, value: MobilePickerValue) {
  draft.value = draft.value.map((current, at) => (at === index ? value : current))
}

function confirm() {
  const value = [...draft.value]
  committed.value = value
  emit('update:modelValue', value)
  emit('change', value)
  emit('confirm', value)
}

function cancel() {
  emit('cancel')
}

const contentSx = computed(() => stylex.props(styles.content, glass.surface))
const cancelSx = computed(() => stylex.props(styles.action, focus.ring))
const confirmSx = computed(() =>
  stylex.props(styles.action, styles.actionPrimary, focus.ring),
)
</script>

<template>
  <Dialog
    :open="open"
    :default-open="defaultOpen"
    :modal="modal"
    :dismissible="dismissible"
    :close-on-outside-press="closeOnOutsidePress"
    presentation="sheet"
    @open-change="onOpenChange"
  >
    <DialogTrigger v-if="triggerLabel || $slots.trigger" :class="stylex.props(styles.trigger, focus.ring).className">
      <slot name="trigger">{{ triggerLabel }}</slot>
    </DialogTrigger>
    <DialogBackdrop :class="stylex.props(overlay.backdrop).className" />
    <DialogContent
      v-bind="$attrs"
      :aria-label="title || $slots.title ? undefined : ariaLabel"
      :class="[contentSx.className, $attrs.class]"
      :style="[contentSx.style, $attrs.style]"
    >
      <span aria-hidden="true" :class="stylex.props(styles.handle).className" />
      <div
        v-if="title || description || $slots.title || $slots.description"
        :class="stylex.props(styles.header).className"
      >
        <DialogTitle v-if="title || $slots.title" :class="stylex.props(styles.title).className">
          <slot name="title">{{ title }}</slot>
        </DialogTitle>
        <DialogDescription
          v-if="description || $slots.description"
          :class="stylex.props(styles.description).className"
        >
          <slot name="description">{{ description }}</slot>
        </DialogDescription>
      </div>
      <div :class="stylex.props(styles.columns).className">
        <div
          v-for="(column, index) in columns"
          :key="column.key ?? index"
          :class="stylex.props(styles.column).className"
        >
          <PickerWheel
            :options="column.options"
            :model-value="draft[index]"
            :aria-label="column.ariaLabel ?? `第 ${index + 1} 列`"
            @update:model-value="onWheel(index, $event)"
          />
        </div>
      </div>
      <slot />
      <div :class="stylex.props(styles.footer).className">
        <DialogClose
          v-if="showCancel"
          :class="cancelSx.className"
          :style="cancelSx.style"
          @click="cancel"
        >
          <slot name="cancel">{{ cancelText }}</slot>
        </DialogClose>
        <DialogClose
          :class="confirmSx.className"
          :style="confirmSx.style"
          @click="confirm"
        >
          <slot name="confirm">{{ confirmText }}</slot>
        </DialogClose>
      </div>
    </DialogContent>
  </Dialog>
</template>
