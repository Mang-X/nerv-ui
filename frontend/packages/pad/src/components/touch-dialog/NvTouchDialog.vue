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
import { XIcon } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed, ref, useAttrs } from 'vue'
import { focus, glass, overlay, presence } from '../../theme/shared.stylex'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './TouchDialog.styles'
import type { TouchDialogProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TouchDialogProps>(), {
  open: undefined,
  defaultOpen: false,
  modal: true,
  dismissible: true,
  closeOnOutsidePress: true,
  keepMounted: false,
  title: undefined,
  description: undefined,
  closable: true,
  closeLabel: '关闭',
  size: 'lg',
})

const emit = defineEmits<{
  'update:open': [open: boolean]
  openChange: [open: boolean]
}>()

// Local state carries the uncontrolled case; the prop wins once a caller
// attaches `v-model:open`.
const inner = ref(props.defaultOpen)
const isOpen = computed(() => props.open ?? inner.value)

function handleOpenChange(open: boolean) {
  inner.value = open
  emit('update:open', open)
  emit('openChange', open)
}

const attrs = useAttrs()
const forwardedAttrs = computed(() => omitClassStyle(attrs))
const backdropSx = computed(() => stylex.props(overlay.backdrop, presence.fade, styles.backdrop))
const contentSx = computed(() =>
  stylex.props(
    glass.surface,
    overlay.panel,
    presence.fadeZoom,
    styles.content,
    props.size === 'md' ? styles.md : styles.lg,
  ),
)
const headerSx = computed(() => stylex.props(styles.header))
const headingSx = computed(() => stylex.props(styles.heading))
const titleSx = computed(() => stylex.props(styles.title))
const descriptionSx = computed(() => stylex.props(styles.description))
const closeSx = computed(() => stylex.props(styles.close, focus.ring))
const bodySx = computed(() => stylex.props(styles.body))
const footerSx = computed(() => stylex.props(styles.footer))
</script>

<template>
  <Dialog
    :open="isOpen"
    :default-open="defaultOpen"
    :modal="modal"
    :dismissible="dismissible"
    :close-on-outside-press="closeOnOutsidePress"
    @open-change="handleOpenChange"
  >
    <DialogTrigger v-if="$slots.trigger">
      <slot name="trigger" />
    </DialogTrigger>
    <DialogBackdrop :class="backdropSx.className" :style="backdropSx.style" />
    <DialogContent
      v-bind="forwardedAttrs"
      :keep-mounted="keepMounted"
      :class="[contentSx.className, attrs.class]"
      :style="[contentSx.style, attrs.style]"
    >
      <header
        v-if="title || description || $slots.title || $slots.description || closable"
        :class="headerSx.className"
        :style="headerSx.style"
      >
        <div :class="headingSx.className" :style="headingSx.style">
          <DialogTitle
            v-if="title || $slots.title"
            :class="titleSx.className"
            :style="titleSx.style"
          >
            <slot name="title">{{ title }}</slot>
          </DialogTitle>
          <DialogDescription
            v-if="description || $slots.description"
            :class="descriptionSx.className"
            :style="descriptionSx.style"
          >
            <slot name="description">{{ description }}</slot>
          </DialogDescription>
        </div>
        <DialogClose
          v-if="closable"
          :aria-label="closeLabel"
          :class="closeSx.className"
          :style="closeSx.style"
        >
          <XIcon :size="26" aria-hidden="true" />
        </DialogClose>
      </header>
      <div v-if="$slots.default" :class="bodySx.className" :style="bodySx.style">
        <slot />
      </div>
      <footer v-if="$slots.footer" :class="footerSx.className" :style="footerSx.style">
        <slot name="footer" />
      </footer>
    </DialogContent>
  </Dialog>
</template>
