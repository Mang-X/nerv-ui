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
import { styles } from './DetailDialog.styles'
import type { ScreenDetailState } from './types'

/**
 * 大屏详情弹层。打开/关闭、焦点锁定、Esc 与关闭后的焦点归还都由
 * `@ui-sdk/vue/dialog` 承担；这里只负责按状态渲染正文或说明。
 *
 * 标题与描述是 `DialogTitle` / `DialogDescription`，不是普通文字——
 * 原语靠它们给弹层挂 `aria-labelledby` / `aria-describedby`。
 */
const props = defineProps<{
  /** 受控打开态。 */
  open: boolean
  title: string
  description: string
  state: ScreenDetailState
  statusText?: string
}>()

const emit = defineEmits<{ 'update:open': [open: boolean] }>()

const sx = computed(() => ({
  backdrop: stylex.props(styles.backdrop),
  content: stylex.props(styles.content),
  header: stylex.props(styles.header),
  headText: stylex.props(styles.headText),
  title: stylex.props(styles.title),
  description: stylex.props(styles.description),
  body: stylex.props(styles.body),
}))

const stateText = computed(() => {
  if (props.statusText) return props.statusText
  return props.state === 'pending' ? '正在加载…' : props.state === 'error' ? '加载失败' : '暂无数据'
})
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <slot name="trigger" />
    <DialogBackdrop :class="sx.backdrop.className" :style="sx.backdrop.style" />
    <DialogContent :class="sx.content.className" :style="sx.content.style">
      <header :class="sx.header.className" :style="sx.header.style">
        <div :class="sx.headText.className" :style="sx.headText.style">
          <DialogTitle :class="sx.title.className" :style="sx.title.style">{{ props.title }}</DialogTitle>
          <DialogDescription :class="sx.description.className" :style="sx.description.style">
            {{ props.description }}
          </DialogDescription>
        </div>
        <DialogClose aria-label="关闭详情">关闭</DialogClose>
      </header>
      <div :class="sx.body.className" :style="sx.body.style">
        <p
          v-if="props.state !== 'data'"
          :role="props.state === 'error' ? 'alert' : 'status'"
          :aria-busy="props.state === 'pending' || undefined"
        >
          {{ stateText }}
        </p>
        <slot v-else />
      </div>
      <slot name="footer" />
    </DialogContent>
  </Dialog>
</template>
