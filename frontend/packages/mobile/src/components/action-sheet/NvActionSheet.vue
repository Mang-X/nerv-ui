<script setup lang="ts">
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@ui-sdk/vue/dialog'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus, glass, overlay } from '../../theme/shared.stylex'
import { styles } from './ActionSheet.styles'
import type { MobileActionSheetItem, MobileActionSheetProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MobileActionSheetProps>(), {
  // Undefined, not false: a boolean default makes the dialog permanently
  // controlled, so it can never open by itself.
  open: undefined,
  defaultOpen: false,
  title: undefined,
  description: undefined,
  actions: () => [],
  cancelText: '取消',
  showCancel: true,
  ariaLabel: '操作菜单',
  modal: true,
  dismissible: true,
  closeOnOutsidePress: true,
})

const emit = defineEmits<{
  'update:open': [open: boolean]
  'open-change': [open: boolean]
  select: [value: string]
  cancel: []
}>()

const contentSx = computed(() => stylex.props(styles.content, glass.surface))
const closeSx = computed(() => stylex.props(styles.cancel, focus.ring))

function onOpenChange(open: boolean) {
  emit('update:open', open)
  emit('open-change', open)
}

function itemSx(item: MobileActionSheetItem) {
  return stylex.props(styles.item, focus.subtle, item.danger && styles.itemDanger)
}

function itemIconSx(item: MobileActionSheetItem) {
  return stylex.props(styles.itemIcon, item.danger && styles.itemIconDanger)
}

function selectAction(action: MobileActionSheetItem) {
  if (action.disabled) return
  emit('select', action.value)
}
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
      <div :class="stylex.props(styles.list).className">
        <div :class="stylex.props(styles.group).className">
          <DialogClose
            v-for="action in actions"
            :key="action.value"
            :disabled="action.disabled"
            :class="itemSx(action).className"
            :style="itemSx(action).style"
            @click="selectAction(action)"
          >
            <span v-if="action.icon" :class="itemIconSx(action).className">
              <component :is="action.icon" aria-hidden="true" :size="20" />
            </span>
            <span :class="stylex.props(styles.itemBody).className">
              <span :class="stylex.props(styles.itemLabel).className">{{ action.label }}</span>
              <span v-if="action.description" :class="stylex.props(styles.itemDescription).className">
                {{ action.description }}
              </span>
            </span>
          </DialogClose>
          <slot />
        </div>
        <DialogClose
          v-if="showCancel"
          :aria-label="cancelText"
          :class="closeSx.className"
          :style="closeSx.style"
          @click="emit('cancel')"
        >
          <slot name="cancel">{{ cancelText }}</slot>
        </DialogClose>
      </div>
    </DialogContent>
  </Dialog>
</template>
