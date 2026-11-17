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
import { X } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus, glass, overlay } from '../../theme/shared.stylex'
import { styles } from './Dialog.styles'
import type { MobileDialogProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MobileDialogProps>(), {
  // Undefined, not false: a boolean default would make the ui-sdk dialog
  // permanently controlled and it could never open on its own.
  open: undefined,
  defaultOpen: false,
  title: undefined,
  description: undefined,
  ariaLabel: '对话框',
  modal: true,
  dismissible: true,
  closeOnOutsidePress: true,
  showClose: true,
  closeLabel: '关闭',
  confirmText: undefined,
  cancelText: undefined,
  confirmLoading: false,
  confirmDisabled: false,
  triggerLabel: undefined,
})

const emit = defineEmits<{
  'update:open': [open: boolean]
  'open-change': [open: boolean]
  confirm: []
  cancel: []
}>()

const contentSx = computed(() => stylex.props(styles.content, glass.surface))
const headerSx = computed(() => stylex.props(styles.header))
const headingSx = computed(() => stylex.props(styles.heading))
const closeSx = computed(() => stylex.props(styles.close, focus.ring))
const footerSx = computed(() => stylex.props(styles.footer))
const cancelSx = computed(() => stylex.props(styles.action, focus.ring))
const confirmSx = computed(() =>
  stylex.props(styles.action, styles.actionPrimary, focus.ring),
)

function onOpenChange(open: boolean) {
  emit('update:open', open)
  emit('open-change', open)
}
</script>

<template>
  <Dialog
    :open="open"
    :default-open="defaultOpen"
    :modal="modal"
    :dismissible="dismissible"
    :close-on-outside-press="closeOnOutsidePress"
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
      <div v-if="title || description || $slots.title || $slots.description || showClose" :class="headerSx.className" :style="headerSx.style">
        <div :class="headingSx.className" :style="headingSx.style">
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
        <DialogClose v-if="showClose" :aria-label="closeLabel" :class="closeSx.className" :style="closeSx.style">
          <X aria-hidden="true" :size="20" />
        </DialogClose>
      </div>
      <div :class="stylex.props(styles.body).className">
        <slot />
      </div>
      <div
        v-if="$slots.footer || confirmText || cancelText"
        :class="footerSx.className"
        :style="footerSx.style"
      >
        <slot name="footer">
          <DialogClose
            v-if="cancelText"
            :class="cancelSx.className"
            :style="cancelSx.style"
            @click="emit('cancel')"
          >
            {{ cancelText }}
          </DialogClose>
          <DialogClose
            v-if="confirmText"
            :disabled="confirmDisabled || confirmLoading"
            :aria-busy="confirmLoading || undefined"
            :class="confirmSx.className"
            :style="confirmSx.style"
            @click="emit('confirm')"
          >
            {{ confirmText }}
          </DialogClose>
        </slot>
      </div>
    </DialogContent>
  </Dialog>
</template>
