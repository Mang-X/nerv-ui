import { h } from 'vue'
import type { VNode } from 'vue'
import { NvScreenButton } from '../components/screen-button'
import { NvScreenInput } from '../components/screen-input'
import { NvScreenSelect } from '../components/screen-select'
import { NvScreenSegmented } from '../components/screen-segmented'
import { NvScreenTabs } from '../components/screen-tabs'
import { NvScreenToolbar } from '../components/screen-toolbar'
import { NvScreenPagination } from '../components/screen-pagination'

/**
 * 大屏样本。大屏组件里有一半是纯展示（KPI、环图、数字翻牌、面板），它们不进
 * 桥是正常的——这里只覆盖真正可操作的那部分。
 *
 * `kind` 是 ui-sdk 的 primitive 名。
 */
export interface Sample {
  kind: string
  render: () => VNode
}

export const samples: Record<string, Sample> = {
  button: {
    kind: 'button',
    render: () => h(NvScreenButton, null, { default: () => '切换班次' }),
  },
  input: {
    kind: 'input',
    render: () => h(NvScreenInput, { 'aria-label': '工位编码', placeholder: '请输入' }),
  },
  select: {
    kind: 'select',
    render: () =>
      h(NvScreenSelect, {
        ariaLabel: '产线',
        options: [
          { value: 'line-a', label: 'A 线' },
          { value: 'line-b', label: 'B 线' },
        ],
      }),
  },
  segmented: {
    kind: 'segmented-control',
    render: () =>
      h(NvScreenSegmented, {
        ariaLabel: '时间范围',
        options: [
          { value: 'today', label: '今日' },
          { value: 'week', label: '本周' },
        ],
        defaultValue: 'today',
      }),
  },
  tabs: {
    kind: 'tabs',
    render: () =>
      h(NvScreenTabs, {
        ariaLabel: '看板分页',
        items: [
          { value: 'overview', label: '总览' },
          { value: 'quality', label: '质量' },
        ],
      }),
  },
  toolbar: {
    kind: 'toolbar',
    render: () =>
      h(NvScreenToolbar, {
        ariaLabel: '看板操作',
        items: [{ value: 'refresh', label: '刷新' }],
      }),
  },
  pagination: {
    kind: 'pagination',
    render: () => h(NvScreenPagination, { pageCount: 5, defaultPage: 1, label: '看板分页' }),
  },
}
