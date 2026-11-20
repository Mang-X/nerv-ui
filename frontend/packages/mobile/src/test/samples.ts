import { h } from 'vue'
import type { VNode } from 'vue'
import { NvMobileAvatar } from '../components/avatar'
import NvMobileStepper from '../components/stepper/NvMobileStepper.vue'
import { NvMobileDropdownMenu, NvMobileDropdownMenuItem } from '../components/dropdown-menu'
import NvMobileButton from '../components/button/NvMobileButton.vue'
import NvMobileCheckbox from '../components/checkbox/NvMobileCheckbox.vue'
import NvMobileCollapse from '../components/collapse/NvMobileCollapse.vue'
import NvMobileInput from '../components/input/NvMobileInput.vue'
import NvMobileProgress from '../components/progress/NvMobileProgress.vue'
import { NvMobileRadio, NvMobileRadioGroup } from '../components/radio'
import NvMobileSlider from '../components/slider/NvMobileSlider.vue'
import NvMobileSwitch from '../components/switch/NvMobileSwitch.vue'
import { NvMobileTabs } from '../components/tabs'
import { NvSearchBar } from '../components/search-bar'

/**
 * 移动端样本。`kind` 对的是 ui-sdk 的 primitive 名，不是组件名——断言按前者查。
 *
 * `NvSearchBar` 内部就是 Input + Button，登记成 `input`；这说明一个包装可以
 * 承载一个原语，也可以承载多个。
 */
export interface Sample {
  kind: string
  render: () => VNode
}

export const samples: Record<string, Sample> = {
  button: {
    kind: 'button',
    render: () => h(NvMobileButton, null, { default: () => '确认' }),
  },
  avatar: {
    kind: 'avatar',
    render: () => h(NvMobileAvatar, { name: '陈明' }),
  },
  input: {
    kind: 'input',
    render: () => h(NvMobileInput, { 'aria-label': '工位编码', placeholder: '请输入' }),
  },
  switch: {
    kind: 'switch',
    render: () => h(NvMobileSwitch, { 'aria-label': '通知开关' }),
  },
  checkbox: {
    kind: 'checkbox',
    render: () => h(NvMobileCheckbox, null, { default: () => '我已阅读并同意' }),
  },
  radio: {
    kind: 'radio',
    render: () =>
      h(
        NvMobileRadioGroup,
        { 'aria-label': '配送方式', defaultValue: 'standard' },
        { default: () => [h(NvMobileRadio, { value: 'standard' }, () => '标准配送')] },
      ),
  },
  tabs: {
    kind: 'tabs',
    render: () =>
      h(NvMobileTabs, {
        'aria-label': '订单状态',
        items: [
          { value: 'pending', label: '待处理' },
          { value: 'done', label: '已完成' },
        ],
      }),
  },
  collapse: {
    kind: 'collapsible',
    render: () =>
      h(NvMobileCollapse, { ariaLabel: '订单详情', title: '订单详情' }, () => '正文内容'),
  },
  searchBar: {
    kind: 'input',
    render: () => h(NvSearchBar, { 'aria-label': '搜索工位', placeholder: '搜索工位' }),
  },
  slider: {
    kind: 'slider',
    render: () => h(NvMobileSlider, { ariaLabel: '音量' }),
  },
  progress: {
    kind: 'progress',
    render: () => h(NvMobileProgress, { value: 40, label: '本单完成率' }),
  },
  stepper: {
    kind: 'number-input',
    render: () => h(NvMobileStepper, { label: '数量', modelValue: 3, min: 0, max: 99 }),
  },
  'dropdown-menu': {
    kind: 'select',
    render: () =>
      h(NvMobileDropdownMenu, { label: '列表筛选' }, {
        default: () => [
          h(NvMobileDropdownMenuItem, {
            title: '全部产线',
            modelValue: 'line-a',
            options: [
              { label: 'A 线', value: 'line-a' },
              { label: 'B 线', value: 'line-b' },
            ],
          }),
        ],
      }),
  },
}
