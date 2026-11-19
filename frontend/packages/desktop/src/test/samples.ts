import { h } from 'vue'
import type { VNode } from 'vue'
import NvButton from '../components/button/NvButton.vue'
import NvCheckbox from '../components/checkbox/NvCheckbox.vue'
import NvInput from '../components/input/NvInput.vue'
import NvProgress from '../components/progress/NvProgress.vue'
import { NvRadio, NvRadioGroup } from '../components/radio'
import {
  NvSelect,
  NvSelectContent,
  NvSelectItem,
  NvSelectTrigger,
  NvSelectValue,
} from '../components/select'
import NvSlider from '../components/slider/NvSlider.vue'
import NvSwitch from '../components/switch/NvSwitch.vue'
import { NvTabs, NvTabsList, NvTabsPanel, NvTabsTrigger } from '../components/tabs'
import NvTextarea from '../components/textarea/NvTextarea.vue'
import { NvAccordion, NvAccordionItem } from '../components/accordion'
import NvAvatar from '../components/avatar/NvAvatar.vue'
import { NvCarousel, NvCarouselItem } from '../components/carousel'

/**
 * 每个组件一份"最小可用"的组合。名字就是断言目标——代理按 label 找控件。
 *
 * 一律用 `h()` 而不是把子组件先 `mount().html()` 再拼字符串：后者交出的是静态
 * HTML，ui-sdk 的子部件根本不会挂载，也就不会登记进桥，测出来的"能看见"是假的。
 */
export const samples = {
  button: (): VNode => h(NvButton, null, { default: () => '保存' }),
  input: (): VNode => h(NvInput, { 'aria-label': '工位编码' }),
  textarea: (): VNode => h(NvTextarea, { 'aria-label': '备注' }),
  switch: (): VNode => h(NvSwitch, { 'aria-label': '通知开关' }),
  checkbox: (): VNode => h(NvCheckbox, null, { default: () => '我已阅读并同意' }),
  radio: (): VNode =>
    h(
      NvRadioGroup,
      { 'aria-label': '配送方式' },
      {
        default: () => [h(NvRadio, { value: 'standard' }, () => '标准配送')],
      },
    ),
  slider: (): VNode => h(NvSlider, { 'aria-label': '音量' }),
  progress: (): VNode => h(NvProgress, { value: 40, label: '本记录完成率' }),
  tabs: (): VNode =>
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
  accordion: (): VNode =>
    h(
      NvAccordion,
      { 'aria-label': '记录信息' },
      {
        default: () => [h(NvAccordionItem, { value: 'basic', title: '基本信息' }, () => '正文 A')],
      },
    ),
  carousel: (): VNode =>
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
  avatar: (): VNode => h(NvAvatar, { name: '张伟' }),
  select: (): VNode =>
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
}
