import { h } from 'vue'
import type { VNode } from 'vue'
import { NvAccordion, NvAccordionItem } from '../components/accordion'
import {
  NvAlertDialog,
  NvAlertDialogClose,
  NvAlertDialogContent,
  NvAlertDialogDescription,
  NvAlertDialogTitle,
  NvAlertDialogTrigger,
} from '../components/alert-dialog'
import NvAvatar from '../components/avatar/NvAvatar.vue'
import NvButton from '../components/button/NvButton.vue'
import { NvCarousel, NvCarouselItem } from '../components/carousel'
import NvCheckbox from '../components/checkbox/NvCheckbox.vue'
import {
  NvDialog,
  NvDialogClose,
  NvDialogContent,
  NvDialogDescription,
  NvDialogTitle,
  NvDialogTrigger,
} from '../components/dialog'
import NvInput from '../components/input/NvInput.vue'
import { NvPopover, NvPopoverContent, NvPopoverTrigger } from '../components/popover'
import NvProgress from '../components/progress/NvProgress.vue'
import { NvRadio, NvRadioGroup } from '../components/radio'
import {
  NvSelect,
  NvSelectContent,
  NvSelectItem,
  NvSelectTrigger,
  NvSelectValue,
} from '../components/select'
import {
  NvSheet,
  NvSheetClose,
  NvSheetContent,
  NvSheetDescription,
  NvSheetTitle,
  NvSheetTrigger,
} from '../components/sheet'
import NvSlider from '../components/slider/NvSlider.vue'
import { NvSidebar, NvSidebarHeader, NvSidebarItem } from '../components/sidebar'
import NvSwitch from '../components/switch/NvSwitch.vue'
import { NvTabs, NvTabsList, NvTabsPanel, NvTabsTrigger } from '../components/tabs'
import NvTextarea from '../components/textarea/NvTextarea.vue'
import { NvTimeline, NvTimelineItem } from '../components/timeline'
import { NvToggle, NvToggleGroup } from '../components/toggle'
import { NvTooltip, NvTooltipContent, NvTooltipTrigger } from '../components/tooltip'

/**
 * 一份样本 = 一个组件的最小可用组合 + 它在代理桥里的名字。
 *
 * 名字用 ui-sdk 的 primitive 名（`select` / `dialog` / `alert-dialog` …）。
 * 断言按这个名字找条目，顺带钉住「组件确实由那个原语承载」——名字对不上
 * 时测试会红，而不是悄悄跳过。
 *
 * 一律用 `h()` 组合 VNode，不要把子组件先 `mount().html()` 再拼字符串：后者
 * 交出的是静态 HTML，ui-sdk 的子部件根本不会挂载，也就不会登记进桥。
 */
export interface Sample {
  /** 条目在 `snapshot()` 里的 `component` 字段。 */
  kind: string
  render: () => VNode
}

export const samples: Record<string, Sample> = {
  button: { kind: 'button', render: () => h(NvButton, null, { default: () => '保存' }) },
  input: { kind: 'input', render: () => h(NvInput, { 'aria-label': '工位编码' }) },
  textarea: { kind: 'textarea', render: () => h(NvTextarea, { 'aria-label': '备注' }) },
  switch: { kind: 'switch', render: () => h(NvSwitch, { 'aria-label': '通知开关' }) },
  checkbox: {
    kind: 'checkbox',
    render: () => h(NvCheckbox, null, { default: () => '我已阅读并同意' }),
  },
  radio: {
    kind: 'radio',
    render: () =>
      h(
        NvRadioGroup,
        { 'aria-label': '配送方式' },
        { default: () => [h(NvRadio, { value: 'standard' }, () => '标准配送')] },
      ),
  },
  slider: { kind: 'slider', render: () => h(NvSlider, { 'aria-label': '音量' }) },
  progress: {
    kind: 'progress',
    render: () => h(NvProgress, { value: 40, label: '本记录完成率' }),
  },
  tabs: {
    kind: 'tabs',
    render: () =>
      h(
        NvTabs,
        { 'aria-label': '记录详情' },
        {
          default: () => [
            h(NvTabsList, null, {
              default: () => [
                h(NvTabsTrigger, { value: 'overview' }, () => '概览'),
                h(NvTabsTrigger, { value: 'logs' }, () => '日志'),
              ],
            }),
            h(NvTabsPanel, { value: 'overview' }, () => '面板 A'),
            h(NvTabsPanel, { value: 'logs' }, () => '面板 B'),
          ],
        },
      ),
  },
  accordion: {
    kind: 'accordion',
    render: () =>
      h(
        NvAccordion,
        { 'aria-label': '记录信息' },
        {
          default: () => [
            h(NvAccordionItem, { value: 'basic', title: '基本信息' }, () => '正文 A'),
          ],
        },
      ),
  },
  carousel: {
    kind: 'carousel',
    render: () =>
      h(
        NvCarousel,
        { 'aria-label': '项目概览' },
        {
          default: () => [
            h(NvCarouselItem, { label: '当日数量' }, () => '第一页'),
            h(NvCarouselItem, { label: '任务完成率' }, () => '第二页'),
          ],
        },
      ),
  },
  avatar: { kind: 'avatar', render: () => h(NvAvatar, { name: '张伟' }) },
  sidebar: {
    kind: 'sidebar',
    render: () =>
      h(
        NvSidebar,
        { label: '主导航' },
        {
          default: () => [
            h(NvSidebarHeader, null, () => '示例平台'),
            h(NvSidebarItem, { label: '项目看板' }, () => '项目看板'),
          ],
        },
      ),
  },
  timeline: {
    kind: 'timeline',
    render: () =>
      h(
        NvTimeline,
        { label: '记录流转' },
        {
          default: () => [
            h(NvTimelineItem, {
              time: '08:12',
              datetime: '2026-11-18T08:12',
              title: '记录创建',
              status: 'complete',
            }),
            h(NvTimelineItem, {
              time: '09:05',
              datetime: '2026-11-18T09:05',
              title: '开始处理',
              status: 'current',
            }),
          ],
        },
      ),
  },
  select: {
    kind: 'select',
    render: () =>
      h(
        NvSelect,
        { 'aria-label': '工位编码' },
        {
          default: () => [
            h(NvSelectTrigger, null, {
              default: () => [h(NvSelectValue, { placeholder: '请选择' })],
            }),
            h(NvSelectContent, null, {
              default: () => [
                h(NvSelectItem, { value: 'a' }, () => '选项 A'),
                h(NvSelectItem, { value: 'b' }, () => '选项 B'),
              ],
            }),
          ],
        },
      ),
  },
  toggle: {
    kind: 'toggle',
    render: () =>
      h(
        NvToggleGroup,
        { 'aria-label': '视图切换', multiple: true },
        {
          default: () => [
            h(NvToggle, { value: 'grid', 'aria-label': '网格视图' }, () => '网格'),
            h(NvToggle, { value: 'list', 'aria-label': '列表视图' }, () => '列表'),
          ],
        },
      ),
  },
  dialog: {
    kind: 'dialog',
    render: () =>
      h(
        NvDialog,
        { open: true, modal: true },
        {
          default: () => [
            h(NvDialogTrigger, null, () => '打开对话框'),
            h(
              NvDialogContent,
              { keepMounted: true },
              {
                default: () => [
                  h(NvDialogTitle, null, () => '编辑资料'),
                  h(NvDialogDescription, null, () => '弹层会锁定焦点。'),
                  h(NvDialogClose, null, () => '关闭'),
                ],
              },
            ),
          ],
        },
      ),
  },
  'alert-dialog': {
    kind: 'alert-dialog',
    render: () =>
      h(
        NvAlertDialog,
        { defaultOpen: true },
        {
          default: () => [
            h(NvAlertDialogTrigger, null, () => '删除记录'),
            h(
              NvAlertDialogContent,
              { keepMounted: true },
              {
                default: () => [
                  h(NvAlertDialogTitle, null, () => '确认删除'),
                  h(NvAlertDialogDescription, null, () => '这条记录将被永久删除。'),
                  h(NvAlertDialogClose, { value: 'cancel' }, () => '取消'),
                ],
              },
            ),
          ],
        },
      ),
  },
  sheet: {
    kind: 'drawer',
    render: () =>
      h(
        NvSheet,
        { open: true },
        {
          default: () => [
            h(NvSheetTrigger, null, () => '打开抽屉'),
            h(
              NvSheetContent,
              { keepMounted: true },
              {
                default: () => [
                  h(NvSheetTitle, null, () => '筛选条件'),
                  h(NvSheetDescription, null, () => '按条件缩小结果。'),
                  h(NvSheetClose, null, () => '关闭'),
                ],
              },
            ),
          ],
        },
      ),
  },
  popover: {
    kind: 'popover',
    render: () =>
      h(
        NvPopover,
        { defaultOpen: true },
        {
          default: () => [
            h(NvPopoverTrigger, null, () => '查看详情'),
            h(NvPopoverContent, null, { default: () => '气泡内容' }),
          ],
        },
      ),
  },
  tooltip: {
    kind: 'tooltip',
    render: () =>
      h(
        NvTooltip,
        { defaultOpen: true },
        {
          default: () => [
            h(NvTooltipTrigger, { 'aria-label': '上一班次' }, () => '悬停查看'),
            h(NvTooltipContent, null, { default: () => '上一班次为 A 班' }),
          ],
        },
      ),
  },
}
