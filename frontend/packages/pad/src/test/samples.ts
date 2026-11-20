import { h } from 'vue'
import type { VNode } from 'vue'
import { NvTouchAvatar } from '../components/touch-avatar'
import { NvTouchButton } from '../components/touch-button'
import { NvTouchInput } from '../components/touch-input'
import { NvQtyStepper } from '../components/qty-stepper'
import { NvSegmented } from '../components/segmented'
import { NvTouchProgress } from '../components/touch-progress'
import { NvTouchSelect } from '../components/touch-select'
import { NvTouchSwitch } from '../components/touch-switch'
import { NvTouchDialog } from '../components/touch-dialog'

/**
 * 触屏样本。`kind` 是 ui-sdk 的 primitive 名。
 *
 * 触屏件普遍比桌面件大一号，但它们承载的还是同一批原语——这正是判据要钉住的
 * 东西：形态可以变，行为不能自己写。
 */
export interface Sample {
  kind: string
  render: () => VNode
}

export const samples: Record<string, Sample> = {
  button: {
    kind: 'button',
    render: () => h(NvTouchButton, null, { default: () => '确认上架' }),
  },
  avatar: {
    kind: 'avatar',
    render: () => h(NvTouchAvatar, { name: '张伟' }),
  },
  input: {
    kind: 'input',
    render: () => h(NvTouchInput, { 'aria-label': '工位编码', modelValue: '' }),
  },
  stepper: {
    kind: 'number-input',
    render: () =>
      h(NvQtyStepper, {
        'aria-label': '数量',
        modelValue: 2,
        controlLabel: '数量',
        decrementLabel: '减少数量',
        incrementLabel: '增加数量',
      }),
  },
  segmented: {
    kind: 'segmented-control',
    render: () =>
      h(NvSegmented, {
        options: [
          { value: 'all', label: '全部' },
          { value: 'mine', label: '我的' },
        ],
        modelValue: 'all',
      }),
  },
  progress: {
    kind: 'progress',
    render: () => h(NvTouchProgress, { value: 40, label: '本单完成率' }),
  },
  select: {
    kind: 'select',
    render: () =>
      h(NvTouchSelect, {
        'aria-label': '记录分组',
        options: [
          { value: 'a', label: '分组甲' },
          { value: 'b', label: '分组乙' },
        ],
      }),
  },
  switch: {
    kind: 'switch',
    render: () => h(NvTouchSwitch, { 'aria-label': '通知开关' }),
  },
  dialog: {
    kind: 'dialog',
    render: () =>
      h(NvTouchDialog, {
        open: true,
        title: '确认上架',
        description: '上架后该工位对操作员可见。',
      }),
  },
}
