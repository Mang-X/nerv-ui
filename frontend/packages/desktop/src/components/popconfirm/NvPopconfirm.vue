<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@ui-sdk/vue/popover'
import NvButton from '../button/NvButton.vue'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { glass, overlay, presence } from '../../theme/shared.stylex'
import { styles } from './Popconfirm.styles'
import type { NvPopconfirmProps } from './types'

/**
 * 行内二次确认气泡。用于删除/停用这类就地触发的危险动作，
 * 与整屏模态对话框不同——它锚在触发元素上，不打散上下文。
 *
 * 打开态、外部点击关闭与 Esc 都由 `@ui-sdk/vue/popover` 承担；
 * 受控模式（`v-model:open`）下组件不自己改 `open`，只发事件。
 */
const props = withDefaults(defineProps<NvPopconfirmProps>(), {
  title: '确认执行该操作？',
  confirmText: '确定',
  cancelText: '取消',
  tone: 'danger',
  loading: false,
})

defineOptions({ inheritAttrs: false })

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:open': [open: boolean]
}>()

const contentSx = computed(() =>
  stylex.props(glass.surface, overlay.panel, presence.fadeZoom, styles.content),
)
const sx = computed(() => ({
  title: stylex.props(styles.title),
  description: stylex.props(styles.description),
  actions: stylex.props(styles.actions),
  dangerIcon: stylex.props(styles.dangerIcon),
}))
</script>

<template>
  <Popover :open="props.open" @update:open="emit('update:open', $event)">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverContent
      :side-offset="8"
      :aria-label="props.title"
      :class="contentSx.className"
      :style="contentSx.style"
    >
      <span :class="sx.dangerIcon.className" :style="sx.dangerIcon.style" aria-hidden="true">
        <NvIcon name="alert" :size="16" />
      </span>
      <p :class="sx.title.className" :style="sx.title.style">{{ props.title }}</p>
      <p v-if="props.description" :class="sx.description.className" :style="sx.description.style">
        {{ props.description }}
      </p>
      <div :class="sx.actions.className" :style="sx.actions.style">
        <NvButton size="sm" variant="outline" @click="emit('cancel')">{{ props.cancelText }}</NvButton>
        <NvButton
          size="sm"
          :variant="props.tone === 'danger' ? 'danger' : 'primary'"
          :disabled="props.loading"
          @click="emit('confirm')"
        >
          {{ props.confirmText }}
        </NvButton>
      </div>
    </PopoverContent>
  </Popover>
</template>
