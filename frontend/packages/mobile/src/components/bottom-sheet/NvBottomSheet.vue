<script setup lang="ts">
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@ui-sdk/vue/dialog'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus, glass, overlay, presence } from '../../theme/shared.stylex'
import { styles } from './BottomSheet.styles'

const props = withDefaults(
  defineProps<{
    open?: boolean
    title?: string
    description?: string
    ariaLabel?: string
    modal?: boolean | 'trap-focus'
    dismissible?: boolean
    closeOnOutsidePress?: boolean
    showClose?: boolean
    closeLabel?: string
  }>(),
  {
    open: undefined,
    title: undefined,
    description: undefined,
    ariaLabel: '底部面板',
    modal: true,
    dismissible: true,
    closeOnOutsidePress: true,
    showClose: true,
    closeLabel: '关闭',
  },
)

const emit = defineEmits<{ 'update:open': [open: boolean] }>()

const contentSx = computed(() =>
  stylex.props(styles.content, glass.surface, presence.fade),
)
</script>

<template>
  <Dialog
    :open="open"
    :modal="modal"
    :dismissible="dismissible"
    :close-on-outside-press="closeOnOutsidePress"
    presentation="sheet"
    @open-change="emit('update:open', $event)"
  >
    <DialogBackdrop :class="stylex.props(overlay.backdrop).className" />
    <DialogContent
      :aria-label="title || $slots.title ? undefined : ariaLabel"
      :class="contentSx.className"
      :style="contentSx.style"
    >
      <span aria-hidden="true" :class="stylex.props(styles.handle).className" />
      <div v-if="title || description || $slots.title || $slots.description || showClose" :class="stylex.props(styles.header).className">
        <div :class="stylex.props(styles.heading).className">
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
        <DialogClose
          v-if="showClose"
          :aria-label="closeLabel"
          :class="stylex.props(styles.close, focus.ring).className"
        >
          <NvIcon name="close" :size="20" />
        </DialogClose>
      </div>
      <div :class="stylex.props(styles.body).className">
        <slot />
      </div>
      <div v-if="$slots.footer" :class="stylex.props(styles.footer).className">
        <slot name="footer" />
      </div>
    </DialogContent>
  </Dialog>
</template>
