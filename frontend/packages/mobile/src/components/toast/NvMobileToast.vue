<script setup lang="ts">
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  type Toaster,
  type ToastType,
} from '@ui-sdk/vue/toast'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus, glass, presence } from '../../theme/shared.stylex'
import { styles } from './MobileToast.styles'
import type { MobileToastAlign, MobileToastSide } from './types'

const props = withDefaults(
  defineProps<{
    toaster?: Toaster
    side?: MobileToastSide
    align?: MobileToastAlign
    maxVisible?: number
    expanded?: boolean
    closable?: boolean
    closeLabel?: string
    pendingAnnouncement?: string
    ariaLabel?: string
  }>(),
  {
    toaster: undefined,
    side: 'bottom',
    align: 'center',
    maxVisible: 3,
    expanded: false,
    closable: true,
    closeLabel: '关闭',
    pendingAnnouncement: '请稍候',
    ariaLabel: '通知',
  },
)

const icons = {
  default: 'info',
  info: 'info',
  success: 'circle-check',
  error: 'x-circle',
  warning: 'alert',
  loading: 'loader-circle',
} as const

function iconFor(type: ToastType) {
  return icons[type] ?? 'info'
}

function iconSx(type: ToastType) {
  const variant =
    type === 'success'
      ? styles.iconSuccess
      : type === 'error'
        ? styles.iconError
        : type === 'warning'
          ? styles.iconWarning
          : type === 'loading'
            ? styles.iconLoading
            : styles.iconInfo
  return stylex.props(styles.icon, variant)
}

const toastSx = computed(() => stylex.props(styles.toast, glass.surface, presence.fade))
const regionSx = computed(() => stylex.props(styles.region))
</script>

<template>
  <ToastRegion
    :toaster="toaster"
    :side="side"
    :align="align"
    :max-visible="maxVisible"
    :expanded="expanded"
    :pending-announcement="pendingAnnouncement"
    :aria-label="ariaLabel"
    :class="regionSx.className"
    :style="regionSx.style"
  >
    <Toast v-slot="{ state }" :class="toastSx.className" :style="toastSx.style">
      <span :class="iconSx(state.type).className">
        <NvIcon :name="iconFor(state.type)" :size="20" />
      </span>
      <span :class="stylex.props(styles.content).className">
        <ToastTitle :class="stylex.props(styles.title).className" />
        <ToastDescription :class="stylex.props(styles.description).className" />
      </span>
      <ToastAction :class="stylex.props(styles.action, focus.ring).className" />
      <ToastClose
        v-if="closable"
        :aria-label="closeLabel"
        :class="stylex.props(styles.close, focus.ring).className"
      >
        <NvIcon name="close" :size="18" />
      </ToastClose>
    </Toast>
  </ToastRegion>
</template>
